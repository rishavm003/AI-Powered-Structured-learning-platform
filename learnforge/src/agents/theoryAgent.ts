import { callAI } from '../gateway/apiGateway';
import type { Subtopic, DepthLevel } from '../types';

export async function generateTheory(
  topicName: string,
  subtopic: Subtopic,
  depth: DepthLevel
): Promise<string> {
  const systemPrompt = `You are an expert AI tutor. 
Your task is to generate a comprehensive, highly educational, and engaging theory lesson for the given topic.
Format your response in Markdown. Use headings, bullet points, and code blocks (if applicable).
Be concise but extremely informative. 
Target Depth: ${depth.toUpperCase()}`;

  const userPrompt = `Main Subject: ${topicName}
Subtopic to explain: ${subtopic.name}
Description: ${subtopic.description}

Please provide the theory for this subtopic.`;

  // We skip cache to ensure we can re-generate if needed, or we can use cache to save tokens.
  const cacheKey = `theory-${topicName}-${subtopic.name}-${depth}`;

  try {
    const rawMarkdown = await callAI(systemPrompt, userPrompt, cacheKey, {
      rawText: true,
      maxTokens: 2000
    });
    return rawMarkdown;
  } catch (error) {
    console.error("Failed to generate theory:", error);
    throw error;
  }
}
