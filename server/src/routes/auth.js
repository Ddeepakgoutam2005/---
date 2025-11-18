import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || typeof name !== 'string' || name.trim().length < 2) return res.status(400).json({ error: 'Invalid name' });
    if (!email || typeof email !== 'string' || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
    if (!password || typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Password too short' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash, role: 'viewer' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
    if (!password || typeof password !== 'string') return res.status(400).json({ error: 'Invalid password' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;