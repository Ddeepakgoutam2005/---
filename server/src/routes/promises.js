import { Router } from 'express';
import PromiseModel from '../models/Promise.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const { status, minister } = req.query;
  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (minister) filter.minister = minister;
  const raw = await PromiseModel.find(filter).populate('minister').sort({ createdAt: -1 });
  res.json(raw);
});

router.get('/:id', async (req, res) => {
  const p = await PromiseModel.findById(req.params.id).populate('minister');
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

router.post('/', requireAuth, async (req, res) => {
  const created = await PromiseModel.create(req.body);
  res.json(await created.populate('minister'));
});

router.put('/:id', requireAuth, async (req, res) => {
  const updated = await PromiseModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('minister');
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await PromiseModel.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;