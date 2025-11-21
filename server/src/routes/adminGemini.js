import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fetchRssFeeds, preprocessArticle, classifyBatch } from '../services/geminiClassifier.js';
import Minister from '../models/Minister.js';
import NewsUpdate from '../models/NewsUpdate.js';
import PromiseModel from '../models/Promise.js';
import PromiseRelatedNews from '../models/PromiseRelatedNews.js';
import ReviewQueue from '../models/ReviewQueue.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

dotenv.config();
const GEMINI_AVAILABLE = !!process.env.GEMINI_API_KEY;

const router = express.Router();

const DEFAULT_FEEDS = [
  'https://www.thehindu.com/news/national/feeder/default.rss',
  'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml',
  'https://www.theguardian.com/world/india/rss',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://rss.dw.com/rdf/rss-en-asia',
];

async function upsertNews(item, ministerName, classification, confidence, evidenceSnippets) {
  const minister = ministerName ? await Minister.findOne({ name: ministerName }) : null;
  const update = {
    $setOnInsert: {
      headline: item.headline,
      summary: (item.content || '').slice(0, 2000),
      source: (() => { try { return new URL(item.url).hostname; } catch { return 'unknown'; } })(),
      url: item.url,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
    },
    $set: {},
    $push: { mentions: { ministerName, classification, confidence, snippets: evidenceSnippets } },
  };
  if (minister && minister._id) update.$set.candidateMinister = minister._id;
  if (classification === 'promise') update.$set.isPromiseCandidate = true;
  if (classification === 'critic') update.$set.isPromiseRelated = true;
  await NewsUpdate.updateOne({ url: item.url }, update, { upsert: true });
  const nu = await NewsUpdate.findOne({ url: item.url });
  if (classification === 'critic') {
    await PromiseRelatedNews.updateOne(
      { url: item.url },
      {
        $setOnInsert: {
          headline: item.headline,
          summary: (item.content || '').slice(0, 2000),
          source: (() => { try { return new URL(item.url).hostname; } catch { return 'unknown'; } })(),
          url: item.url,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        },
        $set: {
          minister: nu?.candidateMinister || (minister ? minister._id : undefined),
          newsUpdate: nu?._id,
          classification: 'critic',
          confidence: confidence || 0,
        },
      },
      { upsert: true }
    );
  }
  return nu;
}

async function attachPromise(ministerName, promiseObj, sourceItem = null) {
  if (!promiseObj || !promiseObj.evidenceText || (promiseObj.confidence || 0) < 0.5) return null;
  const minister = await Minister.findOne({ name: ministerName });
  const ministerId = minister ? minister._id : null;
  const existing = await PromiseModel.findOne({
    $or: [
      { title: promiseObj.title },
      { description: { $regex: promiseObj.evidenceText.slice(0, 50), $options: 'i' } },
    ],
    minister: ministerId,
  });

  if (existing) {
    if ((promiseObj.confidence || 0) > (existing.confidence || 0)) {
      existing.description = existing.description || promiseObj.description;
      existing.evidence = existing.evidence || promiseObj.evidenceText;
      existing.dateMade = existing.dateMade || (promiseObj.dateMade ? new Date(promiseObj.dateMade) : null);
      existing.deadline = existing.deadline || (promiseObj.deadline ? new Date(promiseObj.deadline) : null);
      existing.confidence = Math.max(existing.confidence || 0, promiseObj.confidence || 0);
      await existing.save();
    }
    return existing;
  } else {
    const p = new PromiseModel({
      minister: ministerId,
      title: promiseObj.title,
      description: promiseObj.description,
      evidence: promiseObj.evidenceText,
      dateMade: promiseObj.dateMade ? new Date(promiseObj.dateMade) : null,
      deadline: promiseObj.deadline ? new Date(promiseObj.deadline) : null,
      status: 'pending',
      sourceUrl: sourceItem ? sourceItem.url : null,
      confidence: promiseObj.confidence || 0,
    });
    await p.save();
    return p;
  }
}

async function queueForReview(kind, payload) {
  const q = new ReviewQueue({ kind, payload, createdAt: new Date() });
  await q.save();
  return q;
}

router.post('/refresh-gemini', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (!GEMINI_AVAILABLE) {
      return res.status(400).json({ ok: false, error: 'GEMINI_API_KEY not configured' });
    }
    const feedUrls = req.body.feeds || DEFAULT_FEEDS;
    const limitPerFeed = req.body.limitPerFeed || 8;
    const rawItems = await fetchRssFeeds(feedUrls, limitPerFeed);

    let ministersList = req.body.ministers;
    if (!Array.isArray(ministersList)) {
      const ministers = await Minister.find({}, { name: 1 }).lean();
      ministersList = ministers.map((m) => m.name);
    }

    const items = rawItems.map((it) => ({
      itemId: it.itemId,
      headline: it.headline,
      content: preprocessArticle(it.content || it.headline || ''),
      url: it.url,
      publishedAt: it.publishedAt || null,
    }));

    const rules = {
      promiseIndicators: (process.env.PROMISE_INDICATORS || 'will,pledged,committed to,announced,plans to,aims to,targets,will launch,we will,promised').split(','),
      criticIndicators: (process.env.CRITIC_INDICATORS || 'alleged,investigation,scandal,tender,conflict of interest,probe,critic,accused,bribe,share spike,benefit to family,conflict-of-interest').split(','),
      thresholds: {
        autoAttach: parseFloat(process.env.AUTO_ATTACH_THRESHOLD || '0.80'),
        flagForReview: parseFloat(process.env.FLAG_REVIEW_THRESHOLD || '0.60'),
      },
    };

    let classifierResults;
    try {
      classifierResults = await classifyBatch(items, ministersList, rules);
    } catch (e) {
      const pInd = (rules.promiseIndicators || []).map(s => String(s).toLowerCase());
      const cInd = (rules.criticIndicators || []).map(s => String(s).toLowerCase());
      const mLow = ministersList.map(m => String(m).toLowerCase());
      classifierResults = items.map(it => {
        const t = `${it.headline || ''} ${it.content || ''}`.toLowerCase();
        const results = [];
        for (let i = 0; i < mLow.length; i++) {
          const name = ministersList[i];
          if (!name) continue;
          const nl = mLow[i];
          if (!nl || !t.includes(nl)) continue;
          const hasP = pInd.some(k => t.includes(k));
          const hasC = cInd.some(k => t.includes(k));
          let category = 'other';
          let recommendedAction = 'none';
          let confidence = 0.5;
          if (hasP) {
            category = 'promise';
            recommendedAction = 'attach_to_promises';
            confidence = 0.88;
          } else if (hasC) {
            category = 'critic';
            recommendedAction = 'attach_to_promise_related';
            confidence = 0.78;
          }
          const flagForReview = confidence < rules.thresholds.autoAttach;
          results.push({
            ministerName: name,
            category,
            classificationConfidence: confidence,
            recommendedAction,
            flagForReview,
            matchedSnippets: [],
            promise: null,
          });
        }
        return { itemId: it.itemId, url: it.url, found: results.length > 0, results };
      });
    }

    const processed = [];
    for (const result of classifierResults) {
      const item = items.find((i) => i.itemId === result.itemId) || { url: result.url, headline: '', content: '' };
      if (!result.found) {
        processed.push({ itemId: result.itemId, action: 'skipped_unrelated' });
        continue;
      }

      for (const r of result.results || []) {
        const nu = await upsertNews(item, r.ministerName, r.category, r.classificationConfidence, r.matchedSnippets || []);

        if (r.category === 'promise' && r.recommendedAction === 'attach_to_promises' && r.classificationConfidence >= rules.thresholds.autoAttach) {
          const createdPromise = await attachPromise(r.ministerName, r.promise, item);
          processed.push({ itemId: result.itemId, minister: r.ministerName, action: 'attach_promise', promiseId: createdPromise?._id || null });
        } else if (r.category === 'critic' && r.recommendedAction === 'attach_to_promise_related' && r.classificationConfidence >= rules.thresholds.autoAttach) {
          const prn = await PromiseRelatedNews.findOne({ url: item.url });
          processed.push({ itemId: result.itemId, minister: r.ministerName, action: 'saved_promise_related', relatedId: prn?._id || null });
        } else {
          if (r.flagForReview || r.classificationConfidence < rules.thresholds.autoAttach) {
            await queueForReview('classification', { itemId: result.itemId, minister: r.ministerName, result: r, rawItem: item });
            processed.push({ itemId: result.itemId, minister: r.ministerName, action: 'queued_review' });
          } else {
            processed.push({ itemId: result.itemId, minister: r.ministerName, action: 'saved_minister_news' });
          }
        }
      }
    }

    res.json({ ok: true, processedCount: processed.length, details: processed });
  } catch (err) {
    console.error('refresh-gemini error', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

export default router;