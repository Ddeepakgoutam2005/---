import { Router } from 'express';
import RSSParser from 'rss-parser';
import mongoose from 'mongoose';
import NewsUpdate from '../models/NewsUpdate.js';
import PromiseModel from '../models/Promise.js';
import Minister from '../models/Minister.js';
import PromiseRelatedNews from '../models/PromiseRelatedNews.js';

const router = Router();
const rss = new RSSParser();

const COMMITMENT_PHRASES = [
  ' will ', 'will ', ' pledges', ' pledged', ' promises', ' promised', ' commit', ' commits to', ' intends to', ' plans to', ' announced that', ' aims to', ' target', ' introduce', ' implement', ' ensure', ' guarantee', ' launch', ' roll out', ' rolled out', ' unveiled', ' announced '
];
const NEGATIONS = [' not ', ' never ', ' unlikely ', ' denied '];
const SPECULATIVE = [' may ', ' might ', ' could '];

async function getMinisters() {
  const list = await Minister.find({}).select('name');
  return list.map(m => ({ id: m._id, name: m.name, nameLower: String(m.name || '').toLowerCase() }));
}

function detectMinister(text, ministers) {
  const t = String(text || '').toLowerCase();
  for (const m of ministers) {
    if (m.nameLower && t.includes(m.nameLower)) {
      return m;
    }
  }
  return null;
}

function scorePromiseCandidate(text, nameLower) {
  const t = String(text || '').toLowerCase();
  let score = 0;
  const reasons = [];
  if (nameLower && t.includes(nameLower)) { score += 30; reasons.push('minister'); }
  const verb = COMMITMENT_PHRASES.find(v => t.includes(v));
  if (verb) { score += 30; reasons.push('verb'); }
  const deadline = /(by\s+\d{4}|next\s+year|this\s+year|within\s+\d+\s+(days|months|years))/i.test(t);
  if (deadline) { score += 10; reasons.push('deadline'); }
  const hasNeg = NEGATIONS.some(n => t.includes(n));
  if (hasNeg) { score -= 50; reasons.push('negation'); }
  const hasSpec = SPECULATIVE.some(s => t.includes(s));
  if (hasSpec) { score -= 20; reasons.push('speculative'); }
  if (nameLower && verb) {
    const nameIdx = t.indexOf(nameLower);
    const verbIdx = t.indexOf(verb);
    const distance = Math.abs(nameIdx - verbIdx);
    if (distance > 100) { score -= 20; reasons.push('far'); }
  }
  return { score, reasons };
}

router.get('/', async (req, res) => {
  try {
    const { candidate = null, related = null, minister = null, limit = 50, promiseOnly = null } = req.query || {};
    const filter = {};
    if (candidate === 'true') filter.isPromiseCandidate = true;
    if (related === 'true') filter.isPromiseRelated = true;
    if (minister && typeof minister === 'string' && mongoose.Types.ObjectId.isValid(minister)) {
      const or = [];
      or.push({ candidateMinister: new mongoose.Types.ObjectId(minister) });
      const promises = await PromiseModel.find({ minister: minister }).select('_id');
      if (promises.length) or.push({ promise: { $in: promises.map(p => p._id) } });
      if (or.length) filter.$or = or;
    }
    if (promiseOnly === 'true') {
      const or = [];
      or.push({ promise: { $ne: null } });
      or.push({ isPromiseRelated: true });
      or.push({ isPromiseCandidate: true });
      filter.$or = or;
    }
    const items = await NewsUpdate.find(filter).sort({ publishedAt: -1 }).limit(Number(limit));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

router.get('/related', async (req, res) => {
  try {
    const { minister = null, limit = 50 } = req.query || {};
    const filter = {};
    if (minister && typeof minister === 'string' && mongoose.Types.ObjectId.isValid(minister)) {
      filter.minister = new mongoose.Types.ObjectId(minister);
    }
    const items = await PromiseRelatedNews.find(filter).sort({ publishedAt: -1 }).limit(Number(limit));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch promise-related news' });
  }
});

router.post('/fetch', async (req, res) => {
  const { feed = 'https://timesofindia.indiatimes.com/rss.cms' } = req.body;
  try {
    const parsed = await rss.parseURL(feed);
    const ministers = await getMinisters();
    const raw = parsed.items.slice(0, 30).map(i => ({
      headline: i.title,
      summary: i.contentSnippet,
      source: parsed.title,
      url: i.link,
      sentiment: 'neutral',
      relevanceScore: 0.5,
      publishedAt: i.pubDate ? new Date(i.pubDate) : undefined,
    }));
    const enriched = [];
    for (const a of raw) {
      const text = `${a.headline} ${a.summary || ''}`;
      const m = detectMinister(text, ministers);
      if (!m) continue;
      const sc = scorePromiseCandidate(text, m.nameLower);
      enriched.push({ ...a, isPromiseCandidate: sc.score >= 60, promiseScore: sc.score, candidateLog: sc.reasons.join(','), candidateMinister: m.id });
    }
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch RSS' });
  }
});

router.post('/fetch-and-save', async (req, res) => {
  const { feed = 'https://timesofindia.indiatimes.com/rss.cms' } = req.body;
  try {
    const parsed = await rss.parseURL(feed);
    const ministers = await getMinisters();
    const raw = parsed.items.slice(0, 50).map(i => ({
      headline: i.title,
      summary: i.contentSnippet,
      source: parsed.title,
      url: i.link,
      sentiment: 'neutral',
      relevanceScore: 0.5,
      publishedAt: i.pubDate ? new Date(i.pubDate) : undefined,
    }));
    let saved = 0;
    for (const a of raw) {
      const text = `${a.headline} ${a.summary || ''}`;
      const m = detectMinister(text, ministers);
      if (!m) continue;
      const sc = scorePromiseCandidate(text, m.nameLower);
      const doc = { ...a, isPromiseCandidate: sc.score >= 60, promiseScore: sc.score, candidateLog: sc.reasons.join(','), candidateMinister: m.id };
      try {
        await NewsUpdate.updateOne(
          { url: a.url },
          { $setOnInsert: doc, $set: { candidateMinister: doc.candidateMinister, isPromiseCandidate: doc.isPromiseCandidate, promiseScore: doc.promiseScore, candidateLog: doc.candidateLog } },
          { upsert: true }
        );
        saved++;
      } catch (_) {}
    }
    res.json({ ok: true, saved });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch & save RSS' });
  }
});


export default router;