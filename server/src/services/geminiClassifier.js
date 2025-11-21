import Parser from 'rss-parser';
import { stripHtml } from 'string-strip-html';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const parser = new Parser({
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
    },
  },
});

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

function buildBatchPrompt(items, ministers, rules) {
  const header = process.env.GEMINI_CLASSIFIER_PROMPT || (
    'Return ONLY JSON. For each input item, classify into one of: "promise", "critic", or "other".' +
    ' Output MUST be a JSON array. Each element MUST be: ' +
    ' { "itemId": string, "url": string, "found": boolean, "results": [ { ' +
    '   "ministerName": string, ' +
    '   "category": "promise" | "critic" | "other", ' +
    '   "classificationConfidence": number, ' +
    '   "recommendedAction": "attach_to_promises" | "attach_to_promise_related" | "none", ' +
    '   "sentiment": "positive" | "neutral" | "negative", ' +
    '   "matchedSnippets": string[], ' +
    '   "promise": { ' +
    '     "title": string, ' +
    '     "description": string, ' +
    '     "dateMade": string, ' +
    '     "deadline"?: string, ' +
    '     "status": "pending" | "in_progress" | "completed" | "broken", ' +
    '     "sourceUrl"?: string, ' +
    '     "evidenceText"?: string, ' +
    '     "confidence": number ' +
    '   } | null ' +
    ' } ] }.' +
    ' Only include a "promise" object when category is "promise" and there is a clear explicit commitment. Use ISO date format YYYY-MM-DD for dates.' +
    ' Determine status based on explicit reporting: "completed" if the promise is reported implemented or finished, "in_progress" if rollout or implementation has begun, "broken" if explicitly failed or cancelled, else "pending".'
  );
  const payload = {
    mode: 'BATCH_CLASSIFY',
    items: items.map((it) => ({
      itemId: it.itemId,
      headline: it.headline,
      content: it.content,
      url: it.url,
      publishedAt: it.publishedAt || null,
    })),
    ministers,
    rules,
  };
  return `${header}\n${JSON.stringify(payload)}`;
}

export async function callGemini(prompt, modelName = 'gemini-1.5-flash') {
  if (!genAI) throw new Error('GEMINI_API_KEY not configured');
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    let text = result?.response?.text?.();
    if (!text) throw new Error('No text returned from Gemini');
    let cleaned = String(text).trim();
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '');
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const startArr = cleaned.indexOf('[');
      const endArr = cleaned.lastIndexOf(']');
      const startObj = cleaned.indexOf('{');
      const endObj = cleaned.lastIndexOf('}');
      if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
        parsed = JSON.parse(cleaned.slice(startArr, endArr + 1));
      } else if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
        parsed = JSON.parse(cleaned.slice(startObj, endObj + 1));
      } else {
        throw new Error('JSON parse failed');
      }
    }
    return parsed;
  } catch (err) {
    throw new Error('Gemini call error: ' + (err.message || String(err)));
  }
}

export function preprocessArticle(raw) {
  if (!raw) return '';
  const clean = stripHtml(raw).result || raw;
  const normalized = clean.replace(/\s+/g, ' ').trim();
  const truncated = normalized.length > 18000 ? normalized.slice(0, 18000) + '...' : normalized;
  return truncated;
}

export async function fetchRssFeeds(feedUrls, limitPerFeed = 10) {
  const results = [];
  for (const url of feedUrls) {
    try {
      const feed = await parser.parseURL(url);
      const items = (feed.items || []).slice(0, limitPerFeed);
      for (const it of items) {
        results.push({
          itemId:
            it.guid ||
            it.id ||
            `${Buffer.from(it.link || it.title || '').toString('base64').slice(0, 8)}`,
          headline: it.title || '',
          content: it.contentSnippet || it.content || it.summary || '',
          url: it.link || '',
          publishedAt: it.isoDate || it.pubDate || null,
        });
      }
    } catch (e) {
      console.warn('RSS fetch error for', url, e.message || e);
    }
  }
  return results;
}

export async function classifyBatch(items, ministers, rules) {
  const prompt = buildBatchPrompt(items, ministers, rules);
  const parsed = await callGemini(prompt);
  if (!Array.isArray(parsed)) {
    throw new Error('Unexpected Gemini output: expected array');
  }
  return parsed;
}