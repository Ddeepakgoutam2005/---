import { Router } from 'express';
import PromiseModel from '../models/Promise.js';
import Minister from '../models/Minister.js';

const router = Router();

router.get('/summary', async (req, res) => {
  try {
    const ministers = await Minister.find({}).lean();
    const promises = await PromiseModel.find({}).lean();
    
    // Group promises by minister ID for O(1) access
    const promiseMap = {}; 
    for (const p of promises) {
      const mid = p.minister.toString();
      if (!promiseMap[mid]) promiseMap[mid] = [];
      promiseMap[mid].push(p);
    }

    const results = ministers.map(m => {
      const mPromises = promiseMap[m._id.toString()] || [];
      const total = mPromises.length;
      const completed = mPromises.filter(p => p.status === 'completed' || p.status === 'in_progress').length;
      const broken = mPromises.filter(p => p.status === 'broken').length;
      const completionRate = total ? Math.round((completed / total) * 100) : 0;
      
      return { 
        minister: m.name, 
        ministry: m.ministry, 
        totalPromises: total, 
        completed, 
        broken, 
        completionRate 
      };
    });

    results.sort((a, b) => b.completionRate - a.completionRate);
    res.json(results.map((r, i) => ({ ...r, ranking: i + 1 })));
  } catch (error) {
    console.error('Performance summary error:', error);
    res.status(500).json({ message: 'Failed to fetch performance summary' });
  }
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
    bucket.set(key, { month: key, pending: 0, completed: 0, broken: 0, total: 0 });
  }
  for (const p of promises) {
    const d = p.dateMade || p.createdAt || new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (bucket.has(key)) {
      const b = bucket.get(key);
      b.total += 1;
      // Merge 'in_progress' into 'completed'
      const status = p.status === 'in_progress' ? 'completed' : p.status;
      if (status && b[status] !== undefined) b[status] += 1;
      bucket.set(key, b);
    }
  }
  const trend = Array.from(bucket.values()).sort((a, b) => a.month.localeCompare(b.month));
  const withRate = trend.map(t => ({ ...t, completionRate: t.total ? Math.round((t.completed / t.total) * 100) : 0 }));
  res.json(withRate);
});

export default router;