import { Router } from 'express';
import Minister from '../models/Minister.js';
import PromiseModel from '../models/Promise.js';
import NewsUpdate from '../models/NewsUpdate.js';
import PerformanceMetric from '../models/PerformanceMetric.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const q = req.query.q || '';
  const filter = q ? { name: new RegExp(q, 'i') } : {};
  const ministers = await Minister.find(filter).sort({ name: 1 });
  res.json(ministers);
});

router.get('/:id', async (req, res) => {
  const m = await Minister.findById(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json(m);
});

// Minister dashboard aggregate: profile, promises, recent news, metrics
router.get('/:id/dashboard', async (req, res) => {
  const m = await Minister.findById(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  const promises = await PromiseModel.find({ minister: m._id }).sort({ createdAt: -1 });
  const metrics = await PerformanceMetric.find({ minister: m._id }).sort({ monthYear: -1 }).limit(12);
  const recentNews = await NewsUpdate.find({}).sort({ publishedAt: -1 }).limit(10);
  res.json({ minister: m, promises, metrics, recentNews });
});

router.post('/', requireAuth, async (req, res) => {
  const created = await Minister.create(req.body);
  res.json(created);
});

router.put('/:id', requireAuth, async (req, res) => {
  const updated = await Minister.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Minister.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;