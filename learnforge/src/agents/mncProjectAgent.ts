import { z } from 'zod';
import { callAI } from '../gateway/apiGateway';
import type { RoadmapConfig, Project } from '../types';

const projectSchema = z.object({
  title: z.string(),
  problemStatement: z.string(),
  techStack: z.array(z.string()),
  milestones: z.array(z.string()),
  rubric: z.array(z.string()),
});

const projectsSchema = z.array(projectSchema).length(3);

export async function generateMNCProjects(config: RoadmapConfig): Promise<Project[]> {
  const systemPrompt = `You are a senior engineer at a top tech company. Return ONLY valid JSON — no markdown, no explanation.
Return an array of 3 Project objects:
[{
  "title": string,
  "problemStatement": string (2-3 sentences, real engineering context),
  "techStack": string[] (specific technologies),
  "milestones": string[] (4-6 concrete milestones),
  "rubric": string[] (4-5 evaluation criteria)
}]
Model these after real engineering problems at Google, Amazon, Meta, Microsoft, or similar companies.
Match complexity to depth level: beginner = guided project, expert = open-ended system design.`;

  const userPrompt = `Topic: ${config.topic}
Depth: ${config.depth}
Generate 3 real-world engineering project challenges.`;

  const cacheKey = `${config.topic}-${config.depth}-projects`;
  const raw = await callAI(systemPrompt, userPrompt, cacheKey);

  const arr = Array.isArray(raw) ? raw : raw?.projects ?? raw;
  const validated = projectsSchema.parse(arr);
  return validated as Project[];
}
