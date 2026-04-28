import { z } from 'zod';
import { callAI } from '../gateway/apiGateway';
import type { Day, Question } from '../types';

const questionSchema = z.object({
  question: z.string(),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string(),
});

const quizSchema = z.array(questionSchema).length(5);

export async function generateQuizForDay(day: Day): Promise<Question[]> {
  const systemPrompt = `You are a quiz question writer. Return ONLY valid JSON — no markdown, no explanation.
Return an array of exactly 5 Question objects:
[{ "question": string, "options": [string, string, string, string], "correctIndex": 0|1|2|3, "explanation": string }]
Questions must test understanding of the specific subtopics covered.
Make options plausible — wrong answers should be common misconceptions, not obviously wrong.
Explanation should be 1-2 sentences explaining why the correct answer is right.`;

  const subtopicsText = day.subtopics.map(s => `- ${s.name}: ${s.description}`).join('\n');
  const goalsText = day.goals.join('\n');

  const userPrompt = `Day: ${day.title}
Subtopics covered:
${subtopicsText}
Learning goals:
${goalsText}
Generate 5 multiple choice questions testing mastery of these concepts.`;

  const cacheKey = `quiz-day-${day.dayNumber}`;
  const result = await callAI(systemPrompt, userPrompt, cacheKey);

  // Handle if result is already an array or wrapped
  const raw = Array.isArray(result) ? result : result?.questions ?? result;
  const validated = quizSchema.parse(raw);
  return validated as Question[];
}
