import { z } from 'zod';
import { callAI } from '../gateway/apiGateway';
import { generateQuizForDay } from './quizAgent';
import { generateMNCProjects } from './mncProjectAgent';
import { fetchResources } from './resourceAgent';
import type { RoadmapConfig, Day } from '../types';

const subtopicSchema = z.object({
  name: z.string(),
  description: z.string(),
  estimatedMinutes: z.number(),
});

const daySchema = z.object({
  dayNumber: z.number(),
  title: z.string(),
  subtopics: z.array(subtopicSchema),
  goals: z.array(z.string()),
  resources: z.array(z.any()).optional().default([]),
  mncProjects: z.array(z.any()).optional().default([]),
  quiz: z.array(z.any()).optional().default([]),
});

const roadmapSchema = z.object({
  title: z.string().optional().default('Learning Roadmap'),
  description: z.string().optional().default(''),
  days: z.array(daySchema),
});

function sanitizeRoadmap(raw: any): any {
  if (!raw) return { title: 'Learning Roadmap', description: '', days: [] };
  
  let daysArray = [];
  if (Array.isArray(raw)) {
    daysArray = raw;
  } else if (raw.days && Array.isArray(raw.days)) {
    daysArray = raw.days;
  }
  
  const sanitizedDays = daysArray.map((day: any, index: number) => ({
    dayNumber: day?.dayNumber ?? day?.day ?? (index + 1),
    title: day?.title || day?.topic || `Day ${index + 1}`,
    subtopics: Array.isArray(day?.subtopics) ? day.subtopics.map((st: any) => ({
      name: st?.name || st?.topic || 'Subtopic',
      description: st?.description || st?.details || '',
      estimatedMinutes: st?.estimatedMinutes || st?.time || 30
    })) : [],
    goals: Array.isArray(day?.goals) ? day.goals : [],
    resources: Array.isArray(day?.resources) ? day.resources : [],
    mncProjects: Array.isArray(day?.mncProjects) ? day.mncProjects : [],
    quiz: Array.isArray(day?.quiz) ? day.quiz : []
  }));

  return {
    title: raw.title || 'Learning Roadmap',
    description: raw.description || '',
    days: sanitizedDays
  };
}

import { SYSTEM_PROMPTS } from '../config/prompts';

export async function generateRoadmap(
  config: RoadmapConfig,
  onStatusChange?: (msg: string) => void
): Promise<Day[]> {
  const systemPrompt = SYSTEM_PROMPTS.ROADMAP_GENERATOR;

  const userPrompt = `Create a ${config.days}-day learning roadmap for: ${config.topic}
Hours per day: ${config.hoursPerDay}
Depth: ${config.depth}
Return exactly ${config.days} Day objects in a JSON array.`;

  const configHash = `${config.topic}-${config.days}-${config.hoursPerDay}-${config.depth}-${config.promptVersion}`;

  onStatusChange?.('Generating your roadmap...');
  const jsonResponse = await callAI(systemPrompt, userPrompt, configHash);
  
  console.log("Raw AI Response:", JSON.stringify(jsonResponse, null, 2));

  const sanitized = sanitizeRoadmap(jsonResponse);
  console.log("Sanitized Response:", JSON.stringify(sanitized, null, 2));

  const validated = roadmapSchema.parse(sanitized);
  let days = validated.days as Day[];

  // Pre-generate quizzes for all days in parallel
  onStatusChange?.(`Generating quizzes for all ${days.length} days...`);
  try {
    const quizResults = await Promise.all(days.map(d => generateQuizForDay(d)));
    days = days.map((day, i) => ({ ...day, quiz: quizResults[i] ?? [] }));
  } catch (err) {
    console.warn('Quiz pre-generation failed, continuing:', err);
  }

  // Pre-generate MNC Projects (shared across all days)
  onStatusChange?.('Generating MNC project challenges...');
  let sharedProjects: Day['mncProjects'] = [];
  try {
    sharedProjects = await generateMNCProjects(config);
  } catch (err) {
    console.warn('MNC project generation failed, continuing:', err);
  }

  // Pre-fetch resources for each day in parallel (DuckDuckGo, free)
  onStatusChange?.('Fetching curated resources...');
  try {
    const resourceResults = await Promise.all(
      days.map(d => fetchResources(d.subtopics, config.depth))
    );
    days = days.map((day, i) => ({
      ...day,
      resources: resourceResults[i] ?? [],
      mncProjects: sharedProjects,
    }));
  } catch (err) {
    console.warn('Resource fetching failed, continuing:', err);
    // Still assign projects even if resources failed
    days = days.map(day => ({ ...day, mncProjects: sharedProjects }));
  }

  return days;
}
