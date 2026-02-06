import { Router } from 'express';
import Query from '../models/Query.js';
import PromiseModel from '../models/Promise.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { relatedType, relatedId, message } = req.body || {};
    if (!['news', 'promise'].includes(String(relatedType))) return res.status(400).json({ error: 'Invalid relatedType' });
    if (!relatedId || !mongoose.Types.ObjectId.isValid(String(relatedId))) return res.status(400).json({ error: 'Invalid relatedId' });
    if (typeof message !== 'string' || message.trim().length < 5) return res.status(400).json({ error: 'Message too short' });
    const id = new mongoose.Types.ObjectId(String(relatedId));
    let meta = {};
    if (relatedType === 'news') {
      const n = await NewsUpdate.findById(id);
      if (!n) return res.status(404).json({ error: 'News item not found' });
      meta = { headline: n.headline, source: n.source, url: n.url };
    } else {
      const p = await PromiseModel.findById(id).populate('minister');
      if (!p) return res.status(404).json({ error: 'Promise not found' });
      meta = { promiseTitle: p.title, ministerId: p.minister ? p.minister._id : undefined, ministerName: p.minister ? p.minister.name : undefined };
    }
    const created = await Query.create({ user: req.user.id, relatedType, relatedId: id, message: message.trim(), meta });
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create query' });
  }
});

router.get('/my', requireAuth, async (req, res) => {
  try {
    const items = await Query.find({ user: req.user.id }).sort({ createdAt: -1 }).select('_id relatedId message status createdAt meta relatedType');
    return res.json(items);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch my queries' });
  }
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, relatedType, minister, page = 1, pageSize = 20 } = req.query || {};
    const filter = {};
    if (status) filter.status = status;
    if (relatedType) filter.relatedType = relatedType;
    if (minister) filter['meta.minister'] = new RegExp(String(minister), 'i');
    let q = Query.find(filter).sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(pageSize)).limit(Number(pageSize)).populate('user', 'name email role');
    const items = await q;
    const total = await Query.countDocuments(filter);
    return res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to list queries' });
  }
});

router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['open', 'resolved'].includes(String(status))) return res.status(400).json({ error: 'Invalid status' });
    const updated = await Query.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;