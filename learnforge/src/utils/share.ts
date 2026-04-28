import LZString from 'lz-string';
import { z } from 'zod';
import type { Day, RoadmapConfig } from '../types';

const MAX_URL_LENGTH = 1800;

interface SharePayload {
  config: RoadmapConfig;
  roadmap: Day[];
}

/** Strips heavy arrays from the roadmap to keep URL compact */
function slimRoadmap(roadmap: Day[]): Day[] {
  return roadmap.map(day => ({
    ...day,
    quiz: [],        // omit quiz — too large
    resources: [],   // omit resources — regenerated from DuckDuckGo
  }));
}

/**
 * Generates a shareable URL for the current roadmap.
 * Returns null if the resulting URL would exceed 1800 characters.
 */
export function generateShareURL(roadmap: Day[], config: RoadmapConfig): string | null {
  try {
    const payload: SharePayload = { config, roadmap: slimRoadmap(roadmap) };
    const json = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(json);
    const url = `${window.location.origin}/?shared=${compressed}`;
    if (url.length > MAX_URL_LENGTH) return null;
    return url;
  } catch (e) {
    console.error('Failed to generate share URL:', e);
    return null;
  }
}

const configSchema = z.object({
  topic: z.string(),
  days: z.number(),
  hoursPerDay: z.number(),
  depth: z.enum(['beginner', 'intermediate', 'expert']),
  promptVersion: z.string(),
  createdAt: z.number(),
});

const daySharedSchema = z.object({
  dayNumber: z.number(),
  title: z.string(),
  subtopics: z.array(z.object({
    name: z.string(),
    description: z.string(),
    estimatedMinutes: z.number(),
  })),
  goals: z.array(z.string()),
  resources: z.array(z.any()),
  mncProjects: z.array(z.any()),
  quiz: z.array(z.any()),
});

const sharePayloadSchema = z.object({
  config: configSchema,
  roadmap: z.array(daySharedSchema),
});

/**
 * Reads ?shared= from the current URL and returns the decoded payload, or null.
 */
export function loadSharedURL(): SharePayload | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('shared');
    if (!shared) return null;
    const json = LZString.decompressFromEncodedURIComponent(shared);
    if (!json) return null;
    const parsed = JSON.parse(json);
    const validated = sharePayloadSchema.parse(parsed);
    return validated as SharePayload;
  } catch (e) {
    console.warn('Failed to load shared URL:', e);
    return null;
  }
}
