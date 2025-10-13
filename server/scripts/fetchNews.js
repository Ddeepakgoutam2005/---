import dotenv from 'dotenv';
import RSSParser from 'rss-parser';
import { connectDB, stopDB } from '../src/utils/db.js';
import NewsUpdate from '../src/models/NewsUpdate.js';

dotenv.config();

async function run() {
  const feed = process.argv[2] || 'https://timesofindia.indiatimes.com/rss.cms';
  const rss = new RSSParser();
  await connectDB();
  const parsed = await rss.parseURL(feed);
  const articles = parsed.items.slice(0, 20).map(i => ({
    headline: i.title,
    summary: i.contentSnippet,
    source: parsed.title,
    url: i.link,
    sentiment: 'neutral',
    relevanceScore: 0.5,
    publishedAt: i.pubDate ? new Date(i.pubDate) : undefined,
  }));
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
      // ignore duplicates/validation errors for idempotency
    }
  }
  console.log(JSON.stringify({ ok: true, saved }));
  await stopDB();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});