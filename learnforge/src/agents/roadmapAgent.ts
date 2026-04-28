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
  resources: z.array(z.any()),
  mncProjects: z.array(z.any()),
  quiz: z.array(z.any()),
});

const roadmapSchema = z.array(daySchema);

export async function generateRoadmap(
  config: RoadmapConfig,
  onStatusChange?: (msg: string) => void
): Promise<Day[]> {
  const systemPrompt = `You are a structured learning curriculum designer. Return ONLY valid JSON — no markdown, no explanation.
Return an array of Day objects. Each Day has:
{
  "dayNumber": number,
  "title": string,
  "subtopics": [{ "name": string, "description": string, "estimatedMinutes": number }],
  "goals": [string],
  "resources": [],
  "mncProjects": [],
  "quiz": []
}
Resources, mncProjects, and quiz are empty arrays — they are filled by other agents.
Be realistic about estimatedMinutes — they must sum to approximately hoursPerDay * 60.
Depth levels: beginner = fundamentals only, intermediate = practical application, expert = internals + trade-offs.`;

  const userPrompt = `Create a ${config.days}-day learning roadmap for: ${config.topic}
Hours per day: ${config.hoursPerDay}
Depth: ${config.depth}
Return exactly ${config.days} Day objects in a JSON array.`;

  const configHash = `${config.topic}-${config.days}-${config.hoursPerDay}-${config.depth}-${config.promptVersion}`;

  onStatusChange?.('Generating your roadmap...');
  const jsonResponse = await callAI(systemPrompt, userPrompt, configHash);
  const validated = roadmapSchema.parse(jsonResponse);
  let days = validated as Day[];

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
