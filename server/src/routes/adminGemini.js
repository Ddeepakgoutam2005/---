import express from 'express';
import dotenv from 'dotenv';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { processNewsFeeds, fetchAndSaveRawNews, classifySavedNews } from '../services/newsProcessor.js';

dotenv.config();

const router = express.Router();

// Original combined endpoint
router.post('/refresh-gemini', requireAuth, requireAdmin, async (req, res) => {
  try {
    const feedUrls = req.body.feeds;
    const limitPerFeed = req.body.limitPerFeed;
    const ministersList = req.body.ministers;

    // Delegate all complex logic to the service
    const processed = await processNewsFeeds(feedUrls, limitPerFeed, ministersList);

    res.json({ ok: true, processedCount: processed.length, details: processed });
  } catch (err) {
    console.error('refresh-gemini error', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// New separated endpoints
router.post('/fetch-news', requireAuth, requireAdmin, async (req, res) => {
  try {
    const feedUrls = req.body.feeds;
    const limitPerFeed = req.body.limitPerFeed;

    const result = await fetchAndSaveRawNews(feedUrls, limitPerFeed);

    res.json({ ok: true, savedCount: result.savedCount, totalFetched: result.totalFetched });
  } catch (err) {
    console.error('fetch-news error', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

router.post('/classify-news', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ministersList = req.body.ministers;
    const limit = req.body.limit || 50;

    const processed = await classifySavedNews(ministersList, limit);

    res.json({ ok: true, processedCount: processed.length, details: processed });
  } catch (err) {
    console.error('classify-news error', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

export default router;
