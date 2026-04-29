import LZString from 'lz-string';
import { PROMPT_VERSION } from '../utils/promptVersions';
import { safeSet } from '../utils/storageGuard';

import { ENV } from '../utils/envCheck';

const PROXY_URL = ENV.PROXY_URL;
const AUTH_TOKEN = ENV.AUTH_TOKEN;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CallAIOptions {
  cacheKey?: string;
  skipCache?: boolean;
  /** When true, returns the raw text string instead of trying to JSON.parse it */
  rawText?: boolean;
}

import { usePrefsStore } from '../store/prefsStore';

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  cacheKeyOrOptions?: string | CallAIOptions,
  skipCache?: boolean
): Promise<any> {
  const { aiModel: rawAiModel } = usePrefsStore.getState();
  // Strip provider prefix if exists (e.g. nvidia_nim/model-name -> model-name)
  const aiModel = rawAiModel.includes('/') && (rawAiModel.startsWith('nvidia_nim/') || rawAiModel.startsWith('open_router/'))
    ? rawAiModel.split('/').slice(1).join('/')
    : rawAiModel;
  
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

  // NVIDIA NIM / OpenAI payload format
  const payload = {
    model: "meta/llama-3.1-8b-instruct",
    max_tokens: 4000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    stream: false
  };

  let attempt = 0;
  const maxAttempts = 3;
  const backoff = [1000, 2000, 4000];

  while (attempt < maxAttempts) {
    try {
      const response = await fetch(`${PROXY_URL}/api/ai`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AUTH_TOKEN}`
        },
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
      
      // OpenAI/NIM format: data.choices[0].message.content
      const contentText: string = data.choices?.[0]?.message?.content;
      if (!contentText) {
        throw new Error(`Empty content in response: ${JSON.stringify(data)}`);
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
