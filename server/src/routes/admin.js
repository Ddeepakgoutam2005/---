import { Router } from 'express';
import RSSParser from 'rss-parser';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import PromiseRelatedNews from '../models/PromiseRelatedNews.js';
import NewsUpdate from '../models/NewsUpdate.js';
import PromiseModel from '../models/Promise.js';
import Minister from '../models/Minister.js';
import PerformanceMetric from '../models/PerformanceMetric.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const router = Router();
const rss = new RSSParser();

// Gemini integration for optional news summarization
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
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
  const header = process.env.GEMINI_SUMMARIES_PROMPT || 'Return STRICTLY a JSON array of { "url": string, "summary": string }.';
  const articles = items.map(n => ({ headline: n.headline, summary: n.summary || '', url: n.url || '', publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString().slice(0,10) : '' }));
  const context = JSON.stringify(articles);
  return `${header}\nArticles JSON:\n${context}`;
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
    publishedAt: i.pubDate ? new Date(i.pubDate) : new Date(),
  }));
  const articles = rawArticles.filter(isRelevantIndianPolitical);
  const ministers = await Minister.find({});
  const ministerTokens = ministers.map(m => ({ ref: m, nameLower: String(m.name || '').toLowerCase() }));
  const verbs = [' will ', 'will ', ' pledges', ' pledged', ' promises', ' promised', ' commits to', ' plans to', ' intends to', ' announced that', ' aims to'];
  const negs = [' not ', ' never ', ' unlikely ', ' denied '];
  const specs = [' may ', ' might ', ' could '];
  let saved = 0;
  for (const a of articles) {
    try {
      const text = `${a.headline} ${a.summary}`.toLowerCase();
      let matched = ministerTokens.find(mt => text.includes(mt.nameLower));
      let score = 0;
      const reasons = [];
      const hasName = !!matched;
      if (hasName) { score += 30; reasons.push('minister'); }
      const verb = verbs.find(v => text.includes(v));
      if (verb) { score += 30; reasons.push('verb'); }
      const deadline = /(by\s+\d{4}|next\s+year|this\s+year|within\s+\d+\s+(days|months|years))/i.test(text);
      if (deadline) { score += 10; reasons.push('deadline'); }
      if (negs.some(n => text.includes(n))) { score -= 50; reasons.push('negation'); }
      if (specs.some(s => text.includes(s))) { score -= 20; reasons.push('speculative'); }
      if (hasName && verb) {
        const nameIdx = text.indexOf(matched.nameLower);
        const verbIdx = text.indexOf(verb);
        if (Math.abs(nameIdx - verbIdx) > 100) { score -= 20; reasons.push('far'); }
      }
      const isCandidate = score >= 60;
      if (!matched) continue;
      await NewsUpdate.updateOne(
        { url: a.url },
        { $setOnInsert: a, $set: { isPromiseCandidate: isCandidate, promiseScore: score, candidateLog: reasons.join(','), candidateMinister: matched ? matched.ref._id : undefined } },
        { upsert: true }
      );
      saved++;
    } catch (err) {}
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
    const completed = promises.filter(p => p.status === 'completed' || p.status === 'in_progress').length;
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

function buildPromiseValidationPrompt(items, ministerNames) {
  const context = JSON.stringify(items.map(it => ({ id: it.id, ministerName: it.ministerName, title: it.title, description: it.description || '', newsSummary: it.newsSummary || '', sourceUrl: it.sourceUrl || '' })));
  const namesList = ministerNames.join(', ');
  return `You validate whether each record is a genuine political promise.
Use EXACT minister names from this list when assessing attribution: ${namesList}.
Define "promise" strictly as an explicit, future-oriented commitment made by the named minister (e.g., "will", "pledge", "commit to", "plan to", "announce to implement").
Ignore general news, opinions, criticism, allegations, or completed retrospectives without an explicit prior commitment.
Return STRICTLY a JSON array where each item is:
{ "id": string, "is_promise": boolean, "confidence": number, "reason": string }
Only JSON. No prose.
Items JSON:\n${context}`;
}

const COMMITMENT_PHRASES = [
  'will ', 'pledge', 'promises', 'promise ', 'commit ', 'committed', 'commitment',
  'plan to', 'plans to', 'announce ', 'announced', 'launch ', 'implement ', 'scheme', 'policy',
  'roll out', 'introduce', 'provide ', 'create ', 'build '
];

function looksLikePromiseHeuristic(p) {
  const text = `${p.title} ${p.description || ''}`.toLowerCase();
  const hasPhrase = COMMITMENT_PHRASES.some(ph => text.includes(ph));
  const hasSource = !!p.sourceUrl;
  // Strong signal: commitment phrase present
  if (hasPhrase) return true;
  // If no phrase, but has a source and linked news mentions scheme/policy keywords, keep
  const softKeywords = ['scheme', 'policy', 'will ', 'plan to'];
  const soft = softKeywords.some(ph => text.includes(ph));
  return hasSource && soft;
}

// Admin-only: analyze all promises and remove entries that are not genuine promises
router.post('/cleanup-promises', requireAuth, requireAdmin, async (req, res) => {
  const { dryRun = true, limit = null, useAI = true, minConfidence = 0.5, minister } = req.body || {};
  try {
    // Optional minister filter: accept ObjectId or name (case-insensitive)
    let ministerDoc = null;
    if (minister) {
      try {
        if (mongoose.Types.ObjectId.isValid(minister)) {
          ministerDoc = await Minister.findById(minister);
        } else {
          ministerDoc = await Minister.findOne({ name: new RegExp(String(minister), 'i') });
        }
      } catch (_) {
        // ignore lookup errors; will treat as not found
      }
    }
    let q = PromiseModel.find(ministerDoc ? { minister: ministerDoc._id } : {}).populate('minister');
    if (limit && Number(limit) > 0) q = q.limit(Number(limit));
    const promises = await q;
    const total = promises.length;
    if (!total) return res.json({ ok: true, totalPromises: 0, invalidCount: 0, deletedCount: 0, dryRun: !!dryRun, useAI: false, metricsUpdated: 0, note: minister ? 'Minister filter matched none or no promises' : undefined });

    // Map related news summaries by sourceUrl
    const urlSet = new Set(promises.map(p => p.sourceUrl).filter(Boolean));
    const news = urlSet.size ? await NewsUpdate.find({ url: { $in: Array.from(urlSet) } }) : [];
    const newsMap = new Map(news.map(n => [n.url, n.summary || '']));

    const items = promises.map(p => ({
      id: String(p._id),
      ministerName: p.minister?.name || '',
      title: p.title,
      description: p.description || '',
      sourceUrl: p.sourceUrl || '',
      newsSummary: p.sourceUrl ? (newsMap.get(p.sourceUrl) || '') : ''
    }));
    const ministerNames = ministerDoc ? [ministerDoc.name] : Array.from(new Set(promises.map(p => p.minister?.name).filter(Boolean)));

    const invalidIds = new Set();

    const canUseAI = useAI && !!GEMINI_API_KEY;
    if (canUseAI) {
      // Chunk the items to keep prompt size reasonable
      const chunkSize = 30;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const prompt = buildPromiseValidationPrompt(chunk, ministerNames);
        const ai = await callGemini(prompt);
        if (Array.isArray(ai)) {
          for (const r of ai) {
            if (!r || typeof r.id !== 'string') continue;
            const isPromise = !!r.is_promise;
            const conf = typeof r.confidence === 'number' ? r.confidence : 0;
            if (!isPromise || conf < minConfidence) invalidIds.add(r.id);
          }
        } else {
          // Fallback to heuristics for this chunk if AI fails
          for (const it of chunk) {
            if (!looksLikePromiseHeuristic(it)) invalidIds.add(it.id);
          }
        }
      }
    } else {
      // Heuristic-only mode
      for (const it of items) {
        if (!looksLikePromiseHeuristic(it)) invalidIds.add(it.id);
      }
    }

    const invalidCount = invalidIds.size;
    let deletedCount = 0;
    let metricsUpdated = 0;
    const invalidIdList = Array.from(invalidIds);
    if (!dryRun && invalidCount > 0) {
      // Unlink related news items first
      await NewsUpdate.updateMany({ promise: { $in: invalidIdList } }, { $unset: { promise: 1 } });
      // Delete invalid promises
      await PromiseModel.deleteMany({ _id: { $in: invalidIdList } });
      deletedCount = invalidCount;
      // Recompute metrics: targeted if minister filter provided, otherwise global
      if (ministerDoc) {
        const now = new Date();
        const monthKey = new Date(now.getFullYear(), now.getMonth(), 1);
        const remaining = await PromiseModel.find({ minister: ministerDoc._id });
        const totalRem = remaining.length;
        const completedRem = remaining.filter(p => p.status === 'completed' || p.status === 'in_progress').length;
        const brokenRem = remaining.filter(p => p.status === 'broken').length;
        const completionRateRem = totalRem ? Math.round((completedRem / totalRem) * 100) : 0;
        await PerformanceMetric.updateOne(
          { minister: ministerDoc._id, monthYear: monthKey },
          { $set: { totalPromises: totalRem, completedPromises: completedRem, brokenPromises: brokenRem, completionRate: completionRateRem, score: completionRateRem } },
          { upsert: true }
        );
        metricsUpdated = 1;
      } else {
        metricsUpdated = await recomputeMonthlyMetrics();
      }
    }

    return res.json({ ok: true, totalPromises: total, invalidCount, deletedCount, dryRun: !!dryRun, useAI: !!canUseAI, metricsUpdated, sampleInvalidIds: invalidIdList.slice(0, 50), filterMinister: ministerDoc ? ministerDoc.name : undefined });
  } catch (e) {
    console.error('cleanup-promises error:', e);
    return res.status(500).json({ error: 'Failed to cleanup promises' });
  }
});
 
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
    'https://www.hindustantimes.com/feeds/rss/politics/rssfeed.xml',
    'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml',
    'https://www.theguardian.com/world/india/rss',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://rss.dw.com/rdf/rss-en-asia'
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
    // Heuristic fallback: mark promise-related based on patterns but do not link unless later AI confirms
    try {
      const recent = await NewsUpdate.find({}).sort({ publishedAt: -1 }).limit(100);
      const patterns = [
        /\bpromis(?:e|ed)\b/i,
        /\bcommit(?:ment|ted)\b/i,
        /\bannounce(?:d|ment)\b/i,
        /\bwill\s+(launch|implement|build|provide|create)\b/i,
        /\bscheme\b/i,
        /\bpolicy\b/i
      ];
      const ministerIndicators = [/minister/i, /prime\s+minister/i];
      for (const n of recent) {
        const text = `${n.headline} ${n.summary || ''}`;
        const hasPhrase = patterns.some((r) => r.test(text));
        const hasMinisterWord = ministerIndicators.some((r) => r.test(text));
        const conf = hasPhrase && hasMinisterWord ? 0.5 : hasPhrase ? 0.35 : 0;
        if (conf >= 0.35 && !n.promise) {
          await NewsUpdate.updateOne({ _id: n._id }, { $set: { isPromiseRelated: true, promiseConfidence: conf, classificationEvidence: 'heuristic: phrase+minister keyword' } });
        }
      }
    } catch (_) {
      // ignore heuristic errors
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

router.post('/cleanup-news', requireAuth, requireAdmin, async (req, res) => {
  const { dryRun = true, threshold = 60 } = req.body || {};
  try {
    const bad = await NewsUpdate.find({ promise: { $ne: null }, promiseScore: { $lt: Number(threshold) } }).sort({ publishedAt: -1 }).limit(500);
    const items = bad.map(n => ({ id: String(n._id), headline: n.headline, source: n.source, url: n.url, score: n.promiseScore }));
    if (dryRun) return res.json({ ok: true, count: items.length, items });
    const ids = bad.map(n => n._id);
    await NewsUpdate.updateMany({ _id: { $in: ids } }, { $unset: { promise: 1 }, $set: { isPromiseCandidate: false } });
    return res.json({ ok: true, unlinked: ids.length });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to cleanup news' });
  }
});

router.post('/fetch-minister-images', requireAuth, requireAdmin, async (req, res) => {
  const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="#111827">Minister</text></svg>';
  try {
    const TARGET_NAMES = [
      'Revanth Reddy','Ajay Bhatt','Amit Shah','Anupriya Patel','Anurag Thakur','Arjun Ram Meghwal','Arvind Kejriwal','Ashok Gehlot','Ashwini Kumar Choubey','Ashwini Vaishnaw','Bhagwant Mann','Bhagwanth Khuba','Bhupender Yadav','Bhupesh Baghel','Dharmendra Pradhan','Eknath Shinde','Faggan Singh Kulaste','G. Kishan Reddy','Gajendra Singh Shekhawat','Giriraj Singh','Hardeep Singh Puri','Himanta Biswa Sarma','Jitendra Singh','Jyotiraditya Scindia','K. Chandrashekar Rao','Kailash Choudhary','Kamal Nath','Kaushal Kishore','Kiran Rijiju','M. K. Stalin','Mahendra Nath Pandey','Mamata Banerjee','Mansukh Mandaviya','Mayawati','Meenakashi Lekhi','Narayan Rane','Narendra Modi','Naveen Patnaik','Nirmala Sitharaman','Nitin Gadkari','Nitish Kumar','Nityanand Rai','P. Chidambaram','Pankaj Chaudhary','Parshottam Rupala','Prahlad Singh Patel','Pralhad Joshi','Rajeev Chandrasekhar','Rajnath Singh','Ramdas Athawale','Rao Inderjit Singh','S. Jaishankar','Sadhvi Niranjan Jyoti','Sarbananda Sonowal','Shivraj Singh Chouhan','Shobha Karandlaje','Siddaramaiah','Smriti Irani','Uddhav Thackeray','V. K. Singh','Yogi Adityanath','Pinarayi Vijayan','Piyush Goyal'
    ];
    const out = [];
    let updated = 0;
    let placeholders = 0;
    let skipped = 0;
    for (const name of TARGET_NAMES) {
      const q = await Minister.findOne({ name }) || await Minister.findOne({ name: new RegExp(`^${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') });
      if (!q) { skipped++; out.push({ name, photoUrl: '', status: 'skipped' }); continue; }
      await new Promise(r => setTimeout(r, 300));
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrlimit=1&prop=pageimages&piprop=original&origin=*`;
      let photo = '';
      try {
        const resp = await fetch(apiUrl);
        const data = await resp.json();
        const pages = data?.query?.pages || {};
        const keys = Object.keys(pages);
        if (keys.length) {
          const first = pages[keys[0]];
          if (first && first.original && first.original.source) photo = first.original.source;
        }
      } catch (_) {}
      if (photo) {
        await Minister.updateOne({ _id: q._id }, { $set: { photoUrl: photo } });
        updated++;
        out.push({ name, photoUrl: photo, status: 'updated' });
      } else {
        await Minister.updateOne({ _id: q._id }, { $set: { photoUrl: PLACEHOLDER } });
        placeholders++;
        out.push({ name, photoUrl: PLACEHOLDER, status: 'placeholder' });
      }
    }
    const outPath = path.resolve(process.cwd(), 'server', 'scripts', 'minister_images.json');
    try { fs.writeFileSync(outPath, JSON.stringify(out, null, 2)); } catch (_) {}
    return res.json({ ok: true, processed: TARGET_NAMES.length, updated, placeholders, skipped, outPath });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch minister images' });
  }
});

// Seed promise-related (criticism) news for a minister
router.post('/seed-promise-related', requireAuth, requireAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) && req.body.items.length ? req.body.items : [
      {
        headline: "Conflict of interest allegations involving son's company (Ceinsys Tech)",
        summary: 'Allegations that Ceinsys Tech, linked to Nikhil Gadkari, received substantial government orders; share price surged alongside tenders.',
        url: 'https://economictimes.indiatimes.com/news/politics-and-nation/congress-alleges-scam-in-orders-to-company-linked-to-nitin-gadkaris-son/articleshow/65155770.cms',
        source: 'economictimes.indiatimes.com',
      },
      {
        headline: 'CAG flags very high Dwarka Expressway construction cost',
        summary: 'Auditor notes cost escalation to ~₹250.77 crore/km versus ₹18.20 crore/km approved; questions project oversight.',
        url: 'https://www.thehindu.com/news/national/cag-flags-very-high-construction-cost-of-dwarka-expressway/article67195775.ece',
        source: 'thehindu.com',
      },
      {
        headline: "Alleged 'luxury bus gift' for daughter’s wedding (Scania)",
        summary: 'Reports allege Swedish bus maker provided a luxury bus tied to wedding events; Gadkari’s office denies allegations.',
        url: 'https://thewire.in/politics/scania-luxury-bus-nitin-gadkari-daughter-wedding-report',
        source: 'thewire.in',
      },
      {
        headline: 'CAG pulls up NHAI for excess toll collection',
        summary: 'Report says user fees continued at plazas after recovery of capital cost, violating rules and burdening commuters.',
        url: 'https://indianexpress.com/article/india/cag-pulls-up-nhai-for-collecting-toll-from-commuters-in-violation-of-rules-8891683/',
        source: 'indianexpress.com',
      },
      {
        headline: 'Environmental criticism of Char Dham road project',
        summary: 'Critics argue widening and hill cutting in fragile Himalayas increased landslides; concerns over EIA processes.',
        url: 'https://www.downtoearth.org.in/news/governance/char-dham-project-supreme-court-overrules-its-own-high-powered-committee-80706',
        source: 'downtoearth.org.in',
      }
    ];

    const ministerName = String(req.body?.ministerName || 'Nitin Gadkari');
    const minister = await Minister.findOne({ name: ministerName });
    if (!minister) return res.status(404).json({ error: 'Minister not found' });

    let upserted = 0;
    for (const it of items) {
      const doc = {
        headline: it.headline,
        summary: it.summary,
        source: it.source || (() => { try { return new URL(it.url).hostname; } catch { return 'unknown'; } })(),
        url: it.url,
        publishedAt: it.publishedAt ? new Date(it.publishedAt) : undefined,
      };

      try {
        await NewsUpdate.updateOne(
          { url: doc.url },
          { $setOnInsert: doc, $set: { candidateMinister: minister._id, isPromiseRelated: true } },
          { upsert: true }
        );
      } catch (_) {}

      await PromiseRelatedNews.updateOne(
        { url: doc.url },
        {
          $setOnInsert: doc,
          $set: {
            minister: minister._id,
            classification: 'critic',
            confidence: 0.8,
          },
        },
        { upsert: true }
      );
      upserted++;
    }
    return res.json({ ok: true, upserted, minister: ministerName });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to seed promise-related news' });
  }
});

export default router;