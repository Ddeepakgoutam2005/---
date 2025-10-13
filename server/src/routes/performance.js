import { Router } from 'express';
import PromiseModel from '../models/Promise.js';
import Minister from '../models/Minister.js';

const router = Router();

router.get('/summary', async (req, res) => {
  const ministers = await Minister.find({});
  const results = [];
  for (const m of ministers) {
    const promises = await PromiseModel.find({ minister: m._id });
    const total = promises.length;
    const completed = promises.filter(p => p.status === 'completed').length;
    const broken = promises.filter(p => p.status === 'broken').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    results.push({ minister: m.name, ministry: m.ministry, totalPromises: total, completed, broken, completionRate });
  }
  results.sort((a, b) => b.completionRate - a.completionRate);
  res.json(results.map((r, i) => ({ ...r, ranking: i + 1 })));
});

// Monthly trends: counts of promises by status per month, optionally filtered by minister
router.get('/trends', async (req, res) => {
  const { minister, months = 12 } = req.query;
  const filter = {};
  if (minister) filter.minister = minister;
  const promises = await PromiseModel.find(filter);
  const bucket = new Map(); // key: YYYY-MM
  const now = new Date();
  for (let i = 0; i < Number(months); i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    bucket.set(key, { month: key, pending: 0, in_progress: 0, completed: 0, broken: 0, total: 0 });
  }
  for (const p of promises) {
    const d = p.dateMade || p.createdAt || new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (bucket.has(key)) {
      const b = bucket.get(key);
      b.total += 1;
      if (p.status && b[p.status] !== undefined) b[p.status] += 1;
      bucket.set(key, b);
    }
  }
  const trend = Array.from(bucket.values()).sort((a, b) => a.month.localeCompare(b.month));
  const withRate = trend.map(t => ({ ...t, completionRate: t.total ? Math.round((t.completed / t.total) * 100) : 0 }));
  res.json(withRate);
});

export default router;