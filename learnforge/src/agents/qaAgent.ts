import { callAI } from '../gateway/apiGateway';
import type { Day } from '../types';

export async function askQuestion(question: string, day: Day): Promise<string> {
  const topicsText = day.subtopics.map(s => s.name).join(', ');
  const subtopicsDetail = day.subtopics.map(s => `${s.name}: ${s.description}`).join('\n');

  const systemPrompt = `You are a focused technical tutor. The student is studying a specific topic today.
Answer ONLY questions relevant to today's learning content.
If the question is off-topic, politely redirect: "That is outside today's scope. Today we are covering: ${topicsText}"
Format your answer in markdown: use headers, bullet points, and code blocks where appropriate.
Keep answers concise but complete — aim for 150-300 words.`;

  const userPrompt = `Today's topic: ${day.title}
Subtopics covered today:
${subtopicsDetail}

Student question: ${question}`;

  // No caching, rawText mode — returns markdown string
  const result = await callAI(systemPrompt, userPrompt, { rawText: true });
  return result as string;
}
