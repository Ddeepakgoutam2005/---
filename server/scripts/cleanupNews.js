import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, stopDB } from '../src/utils/db.js';
import NewsUpdate from '../src/models/NewsUpdate.js';

dotenv.config();

async function run() {
  const threshold = Number(process.env.CLEANUP_THRESHOLD || 60);
  const dryRun = String(process.env.CLEANUP_DRY_RUN || 'true') === 'true';
  await connectDB();
  const bad = await NewsUpdate.find({ promise: { $ne: null }, promiseScore: { $lt: threshold } }).sort({ publishedAt: -1 }).limit(1000);
  const items = bad.map(n => ({ id: String(n._id), headline: n.headline, source: n.source, url: n.url, score: n.promiseScore }));
  if (dryRun) {
    console.log(JSON.stringify({ ok: true, count: items.length, items }, null, 2));
  } else {
    const ids = bad.map(n => n._id);
    await NewsUpdate.updateMany({ _id: { $in: ids } }, { $unset: { promise: 1 }, $set: { isPromiseCandidate: false } });
    console.log(JSON.stringify({ ok: true, unlinked: ids.length }, null, 2));
  }
  await stopDB();
}

run().catch(e => { console.error(e); process.exit(1); });