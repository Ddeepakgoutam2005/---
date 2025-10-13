import dotenv from 'dotenv';
import { connectDB, stopDB } from '../src/utils/db.js';
import NewsUpdate from '../src/models/NewsUpdate.js';

dotenv.config();

async function run() {
  await connectDB();
  const count = await NewsUpdate.countDocuments();
  const latest = await NewsUpdate.find({}).sort({ createdAt: -1 }).limit(5);
  console.log(JSON.stringify({ count, latest: latest.map(n => ({ headline: n.headline, source: n.source, url: n.url, createdAt: n.createdAt })) }, null, 2));
  await stopDB();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});