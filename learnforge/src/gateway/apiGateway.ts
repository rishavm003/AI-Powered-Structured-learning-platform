import LZString from 'lz-string';
import { PROMPT_VERSION } from '../utils/promptVersions';
import { safeSet } from '../utils/storageGuard';

const PROXY_URL = import.meta.env.VITE_PROXY_URL || "http://localhost:11434/api/chat";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CallAIOptions {
  cacheKey?: string;
  skipCache?: boolean;
  /** When true, returns the raw text string instead of trying to JSON.parse it */
  rawText?: boolean;
}

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  cacheKeyOrOptions?: string | CallAIOptions,
  skipCache?: boolean
): Promise<any> {
  // Support both old callAI(s, u, key, skip) and new callAI(s, u, { ... })
  let options: CallAIOptions = {};
  if (typeof cacheKeyOrOptions === 'string') {
    options = { cacheKey: cacheKeyOrOptions, skipCache };
  } else if (cacheKeyOrOptions) {
    options = cacheKeyOrOptions;
  }

  const fullCacheKey = options.cacheKey
    ? `learnforge:cache:v${PROMPT_VERSION}:${options.cacheKey}`
    : null;

  if (fullCacheKey && !options.skipCache) {
    const cached = localStorage.getItem(fullCacheKey);
    if (cached) {
      try {
        const decompressed = LZString.decompressFromUTF16(cached);
        if (decompressed) {
          return options.rawText ? decompressed : JSON.parse(decompressed);
        }
      } catch (e) {
        console.warn("Cache decompression failed", e);
      }
    }
  }

  const payload = {
    model: "phi4-mini",
    stream: false,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  };

  let attempt = 0;
  const maxAttempts = 3;
  const backoff = [1000, 2000, 4000];

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.status === 429 || response.status >= 500) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const contentText: string = data.message?.content;
      if (!contentText) {
        throw new Error("Empty content in response");
      }

      // rawText mode — return the string directly, no JSON parsing
      if (options.rawText) {
        // Cache the raw string directly
        if (fullCacheKey) {
          const compressed = LZString.compressToUTF16(contentText);
          safeSet(fullCacheKey, compressed);
        }
        return contentText;
      }

      // JSON mode — strip markdown code fence if present
      let jsonStr = contentText;
      const jsonMatch = contentText.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsedJSON = JSON.parse(jsonStr);

      if (fullCacheKey) {
        const compressed = LZString.compressToUTF16(JSON.stringify(parsedJSON));
        const success = safeSet(fullCacheKey, compressed);
        if (!success) {
          console.warn("Failed to cache response due to quota limits");
        }
      }

      return parsedJSON;

    } catch (err: any) {
      attempt++;
      if (attempt >= maxAttempts) {
        throw err;
      }
      console.warn(`API call failed (attempt ${attempt}). Retrying in ${backoff[attempt - 1]}ms...`);
      await sleep(backoff[attempt - 1]);
    }
  }
}
