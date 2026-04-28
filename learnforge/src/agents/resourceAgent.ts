import type { Subtopic, Resource } from '../types';
import { readCache, writeCache } from '../utils/cache';

const DDGO_BASE = 'https://api.duckduckgo.com/';
const MAX_SUBTOPICS = 3;
const MAX_RESOURCES = 8;

function classifyUrl(url: string): Resource['type'] {
  if (!url) return 'article';
  const lower = url.toLowerCase();
  if (lower.includes('github.com')) return 'github';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'video';
  if (
    lower.includes('docs.') ||
    lower.includes('/docs/') ||
    lower.includes('developer.mozilla') ||
    lower.includes('documentation') ||
    lower.includes('readthedocs') ||
    lower.includes('reference')
  ) return 'doc';
  return 'article';
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function buildTitle(topic: string, url: string, abstractText: string): string {
  if (abstractText && abstractText.length > 5) {
    return abstractText.length > 70 ? abstractText.slice(0, 70) + '…' : abstractText;
  }
  return `${topic} — ${extractDomain(url)}`;
}

async function queryDuckDuckGo(query: string): Promise<Resource[]> {
  const resources: Resource[] = [];
  try {
    const encoded = encodeURIComponent(query);
    const url = `${DDGO_BASE}?q=${encoded}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    if (data.AbstractURL && data.AbstractURL.trim() !== '') {
      resources.push({
        url: data.AbstractURL,
        title: buildTitle(query, data.AbstractURL, data.Abstract),
        type: 'doc',
      });
    }

    const related: any[] = data.RelatedTopics ?? [];
    for (const topic of related.slice(0, 3)) {
      const topicUrl: string = topic.FirstURL ?? topic.Result?.match(/href="([^"]+)"/)?.[1] ?? '';
      if (!topicUrl) continue;
      resources.push({
        url: topicUrl,
        title: buildTitle(query, topicUrl, topic.Text),
        type: classifyUrl(topicUrl),
      });
    }
  } catch (e) {
    console.warn('DuckDuckGo query failed:', e);
  }
  return resources;
}

function fallbackResources(subtopicName: string, depth: string): Resource[] {
  const lower = subtopicName.toLowerCase();
  const resources: Resource[] = [];

  if (lower.includes('python')) {
    resources.push({ url: 'https://docs.python.org/3/', title: 'Python 3 Official Documentation', type: 'doc' });
  } else if (lower.includes('react') || lower.includes('jsx')) {
    resources.push({ url: 'https://react.dev', title: 'React Official Docs', type: 'doc' });
  } else if (lower.includes('css') || lower.includes('html')) {
    resources.push({ url: 'https://developer.mozilla.org/en-US/docs/Web', title: 'MDN Web Docs', type: 'doc' });
  } else if (lower.includes('typescript')) {
    resources.push({ url: 'https://www.typescriptlang.org/docs/', title: 'TypeScript Documentation', type: 'doc' });
  } else if (lower.includes('node')) {
    resources.push({ url: 'https://nodejs.org/en/docs/', title: 'Node.js Official Docs', type: 'doc' });
  } else {
    resources.push({
      url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(subtopicName)}`,
      title: `MDN Search: ${subtopicName}`,
      type: 'doc',
    });
  }

  if (depth === 'expert') {
    resources.push({
      url: `https://github.com/search?q=${encodeURIComponent(subtopicName)}&type=repositories`,
      title: `GitHub: ${subtopicName} repositories`,
      type: 'github',
    });
  }

  return resources;
}

export async function fetchResources(subtopics: Subtopic[], depth: string): Promise<Resource[]> {
  const cacheKey = `resources-${subtopics.map(s => s.name).join('-')}-${depth}`;
  const cached = readCache<Resource[]>(cacheKey);
  if (cached) return cached;

  const allResources: Resource[] = [];
  const seen = new Set<string>();

  const targets = subtopics.slice(0, MAX_SUBTOPICS);

  for (const subtopic of targets) {
    const query = `${subtopic.name} ${depth === 'expert' ? 'advanced internals' : depth} documentation tutorial`;
    let results = await queryDuckDuckGo(query);

    if (results.length === 0) {
      results = fallbackResources(subtopic.name, depth);
    }

    for (const r of results) {
      if (!seen.has(r.url) && r.url.startsWith('http')) {
        seen.add(r.url);
        allResources.push(r);
      }
    }
  }

  const final = allResources.slice(0, MAX_RESOURCES);
  writeCache(cacheKey, final);
  return final;
}
