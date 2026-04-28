/**
 * cache.ts
 * Lightweight in-memory + localStorage cache layer for LearnForge.
 * Used by apiGateway.ts for non-compressed quick lookups.
 */
import LZString from 'lz-string';
import { PROMPT_VERSION } from './promptVersions';
import { safeSet } from './storageGuard';

/** Build the full localStorage cache key for a given logical key */
export function buildCacheKey(key: string): string {
  return `learnforge:cache:v${PROMPT_VERSION}:${key}`;
}

/** Read and decompress a cached value. Returns null on miss or error. */
export function readCache<T>(key: string): T | null {
  const fullKey = buildCacheKey(key);
  const raw = localStorage.getItem(fullKey);
  if (!raw) return null;
  try {
    const decompressed = LZString.decompressFromUTF16(raw);
    if (!decompressed) return null;
    return JSON.parse(decompressed) as T;
  } catch (e) {
    console.warn(`Cache read failed for key "${fullKey}"`, e);
    return null;
  }
}

/** Compress and write a value to the localStorage cache. Returns false on quota error. */
export function writeCache<T>(key: string, value: T): boolean {
  const fullKey = buildCacheKey(key);
  try {
    const compressed = LZString.compressToUTF16(JSON.stringify(value));
    return safeSet(fullKey, compressed);
  } catch (e) {
    console.warn(`Cache write failed for key "${fullKey}"`, e);
    return false;
  }
}

/** Remove a single entry from the cache */
export function invalidateCache(key: string): void {
  localStorage.removeItem(buildCacheKey(key));
}

/** Remove ALL learnforge cache entries (keys matching the prefix pattern) */
export function clearAllCache(): void {
  const prefix = `learnforge:cache:v${PROMPT_VERSION}:`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
