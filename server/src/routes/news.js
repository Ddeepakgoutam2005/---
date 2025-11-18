import { Router } from 'express';
import RSSParser from 'rss-parser';
import NewsUpdate from '../models/NewsUpdate.js';

const router = Router();
const rss = new RSSParser();
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

router.get('/', async (req, res) => {
  try {
    const { candidate = null, minister = null, limit = 50 } = req.query || {};
    const filter = {};
    if (candidate === 'true') filter.isPromiseCandidate = true;
    if (minister && typeof minister === 'string') {
      try {
        if (mongoose.Types.ObjectId.isValid(minister)) {
          filter.$or = [
            { candidateMinister: new mongoose.Types.ObjectId(minister) },
          ];
          const promises = await PromiseModel.find({ minister: minister }).select('_id');
          if (promises.length) filter.$or.push({ promise: { $in: promises.map(p => p._id) } });
        }
      } catch (_) {}
    }
    const items = await NewsUpdate.find(filter).sort({ publishedAt: -1 }).limit(Number(limit));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

router.post('/fetch', async (req, res) => {
  const { feed = 'https://timesofindia.indiatimes.com/rss.cms' } = req.body;
  try {
    const parsed = await rss.parseURL(feed);
    const raw = parsed.items.slice(0, 30).map(i => ({
      headline: i.title,
      summary: i.contentSnippet,
      source: parsed.title,
      url: i.link,
      sentiment: 'neutral',
      relevanceScore: 0.5,
      publishedAt: i.pubDate ? new Date(i.pubDate) : undefined,
    }));
    const articles = raw.filter(isRelevantIndianPolitical);
    res.json(articles);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch RSS' });
  }
});

router.post('/fetch-and-save', async (req, res) => {
  const { feed = 'https://timesofindia.indiatimes.com/rss.cms' } = req.body;
  try {
    const parsed = await rss.parseURL(feed);
    const raw = parsed.items.slice(0, 50).map(i => ({
      headline: i.title,
      summary: i.contentSnippet,
      source: parsed.title,
      url: i.link,
      sentiment: 'neutral',
      relevanceScore: 0.5,
      publishedAt: i.pubDate ? new Date(i.pubDate) : undefined,
    }));
    const articles = raw.filter(isRelevantIndianPolitical);
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
        // Duplicate or validation errors are ignored for idempotency
      }
    }
    res.json({ ok: true, saved });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch & save RSS' });
  }
});


export default router;