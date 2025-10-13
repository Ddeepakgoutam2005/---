import { Router } from 'express';
import RSSParser from 'rss-parser';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import NewsUpdate from '../models/NewsUpdate.js';
import PromiseModel from '../models/Promise.js';
import Minister from '../models/Minister.js';
import PerformanceMetric from '../models/PerformanceMetric.js';

const router = Router();
const rss = new RSSParser();

// Gemini integration for optional news summarization
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('Gemini error:', txt);
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    try {
      const jsonText = text.trim().replace(/^```json\n?|```$/g, '');
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', e, '\nRaw:', text.slice(0, 500));
      return null;
    }
  } catch (err) {
    console.error('Gemini call failed:', err);
    return null;
  }
}

function buildNewsSummariesPrompt(items) {
  const articles = items.map(n => ({ headline: n.headline, summary: n.summary || '', url: n.url || '', publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString().slice(0,10) : '' }));
  const context = JSON.stringify(articles);
  return `Summarize the following Indian political news items. Return STRICTLY a JSON array where each item is { "url": string, "summary": string } with 1-2 concise sentences focusing on political promises, commitments or policy actions mentioned. No prose or Markdown.\nArticles JSON:\n${context}`;
}

const KEYWORDS = [
  'manifesto', 'election', 'rally', 'campaign', 'promise',
  'Prime Minister', 'Home Minister', 'Finance Minister', 'External Affairs',
  'cabinet', 'parliament', 'Lok Sabha', 'Rajya Sabha', 'policy', 'scheme',
  'BJP', 'Congress', 'INC', 'AAP', 'TMC', 'NCP', 'DMK', 'AIADMK', 'SP', 'BSP'
];

function isRelevantIndianPolitical(article) {
  const text = `${article.headline} ${article.summary}`.toLowerCase();
  return KEYWORDS.some(k => text.includes(k.toLowerCase()));
}

async function fetchAndSaveFeed(feedUrl) {
  const parsed = await rss.parseURL(feedUrl);
  const rawArticles = parsed.items.slice(0, 50).map(i => ({
    headline: i.title,
    summary: i.contentSnippet,
    source: parsed.title,
    url: i.link,
    sentiment: 'neutral',
    relevanceScore: 0.5,
    publishedAt: i.pubDate ? new Date(i.pubDate) : undefined,
  }));
  const articles = rawArticles.filter(isRelevantIndianPolitical);
  let saved = 0;
  for (const a of articles) {
    try {
      await NewsUpdate.updateOne(
        { url: a.url },
        { $setOnInsert: a },
        { upsert: true }
      );
      saved++;
    } catch (err) {
      // ignore duplicates for idempotency
    }
  }
  return saved;
}

async function recomputeMonthlyMetrics() {
  const ministers = await Minister.find({});
  const now = new Date();
  const monthKey = new Date(now.getFullYear(), now.getMonth(), 1);
  let updated = 0;
  for (const m of ministers) {
    const promises = await PromiseModel.find({ minister: m._id });
    const total = promises.length;
    const completed = promises.filter(p => p.status === 'completed').length;
    const broken = promises.filter(p => p.status === 'broken').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    await PerformanceMetric.updateOne(
      { minister: m._id, monthYear: monthKey },
      {
        $set: {
          totalPromises: total,
          completedPromises: completed,
          brokenPromises: broken,
          completionRate,
          // simplistic score aligns with completion rate for now
          score: completionRate,
        },
      },
      { upsert: true }
    );
    updated++;
  }
  return updated;
}

// Admin-only refresh endpoint
router.post('/refresh', requireAuth, requireAdmin, async (req, res) => {
  const { feeds, saveNews = true, recomputeMetrics = true, geminiSummarize = false } = req.body || {};
  // default feeds: Indian political news sources
  const defaultFeeds = [
    'https://timesofindia.indiatimes.com/rss.cms',
    'https://www.thehindu.com/news/national/feeder/default.rss',
    'https://indianexpress.com/section/political-pulse/feed/',
    'https://www.ndtv.com/rss',
    'https://www.indiatoday.in/rss/1177073',
    'https://www.hindustantimes.com/feeds/rss/politics/rssfeed.xml'
  ];
  const feedList = Array.isArray(feeds) && feeds.length ? feeds : defaultFeeds;
  try {
    let savedTotal = 0;
    if (saveNews) {
      for (const f of feedList) {
        // best-effort per feed
        try {
          savedTotal += await fetchAndSaveFeed(f);
        } catch (e) {
          // continue on feed errors
        }
      }
    }
    // Optionally enrich summaries using Gemini
    let aiSummarized = 0;
    if (geminiSummarize && GEMINI_API_KEY) {
      try {
        const recent = await NewsUpdate.find({}).sort({ publishedAt: -1 }).limit(25);
        if (recent.length) {
          const prompt = buildNewsSummariesPrompt(recent);
          const ai = await callGemini(prompt);
          if (Array.isArray(ai) && ai.length) {
            // Map by URL for quick lookup
            const map = new Map();
            for (const it of ai) {
              if (it && typeof it.url === 'string' && typeof it.summary === 'string') {
                map.set(it.url, it.summary);
              }
            }
            for (const n of recent) {
              const s = map.get(n.url);
              if (s && s.length) {
                await NewsUpdate.updateOne({ _id: n._id }, { $set: { summary: s } });
                aiSummarized++;
              }
            }
          }
        }
      } catch (e) {
        console.warn('Gemini summarization skipped due to error:', e?.message || e);
      }
    }
    let metricsUpdated = 0;
    if (recomputeMetrics) {
      metricsUpdated = await recomputeMonthlyMetrics();
    }
    return res.json({ ok: true, feedsProcessed: feedList.length, articlesSaved: savedTotal, aiSummarized, metricsUpdated });
  } catch (e) {
    return res.status(500).json({ error: 'Refresh failed' });
  }
});

export default router;