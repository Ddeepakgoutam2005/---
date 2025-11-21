import dotenv from 'dotenv';
import path from 'path';
import { connectDB, stopDB } from '../src/utils/db.js';
import Minister from '../src/models/Minister.js';
import NewsUpdate from '../src/models/NewsUpdate.js';
import PromiseRelatedNews from '../src/models/PromiseRelatedNews.js';

dotenv.config({ path: path.join(process.cwd(), 'server/.env') });

async function main() {
  await connectDB();
  try {
    const name = 'Nitin Gadkari';
    const minister = await Minister.findOne({ name }) || await Minister.findOne({ name: new RegExp('^Nitin\s+Gadkari$', 'i') });
    if (!minister) {
      console.error('Minister not found:', name);
      process.exitCode = 1;
      return;
    }

    const items = [
      {
        headline: "Conflict of interest allegations involving son's company (Ceinsys Tech)",
        summary: 'Allegations that Ceinsys Tech, linked to Nikhil Gadkari, received substantial government orders; share price surged alongside tenders.',
        url: 'https://economictimes.indiatimes.com/news/politics-and-nation/congress-alleges-scam-in-orders-to-company-linked-to-nitin-gadkaris-son/articleshow/65155770.cms',
        source: 'economictimes.indiatimes.com',
      },
      {
        headline: 'CAG flags very high Dwarka Expressway construction cost',
        summary: 'Auditor notes cost escalation to ~₹250.77 crore/km versus ₹18.20 crore/km approved; questions project oversight.',
        url: 'https://www.thehindu.com/news/national/cag-flags-very-high-construction-cost-of-dwarka-expressway/article67195775.ece',
        source: 'thehindu.com',
      },
      {
        headline: "Alleged 'luxury bus gift' for daughter’s wedding (Scania)",
        summary: 'Reports allege Swedish bus maker provided a luxury bus tied to wedding events; Gadkari’s office denies allegations.',
        url: 'https://thewire.in/politics/scania-luxury-bus-nitin-gadkari-daughter-wedding-report',
        source: 'thewire.in',
      },
      {
        headline: 'CAG pulls up NHAI for excess toll collection',
        summary: 'Report says user fees continued at plazas after recovery of capital cost, violating rules and burdening commuters.',
        url: 'https://indianexpress.com/article/india/cag-pulls-up-nhai-for-collecting-toll-from-commuters-in-violation-of-rules-8891683/',
        source: 'indianexpress.com',
      },
      {
        headline: 'Environmental criticism of Char Dham road project',
        summary: 'Critics argue widening and hill cutting in fragile Himalayas increased landslides; concerns over EIA processes.',
        url: 'https://www.downtoearth.org.in/news/governance/char-dham-project-supreme-court-overrules-its-own-high-powered-committee-80706',
        source: 'downtoearth.org.in',
      }
    ];

    let upserted = 0;
    for (const it of items) {
      const doc = {
        headline: it.headline,
        summary: it.summary,
        source: it.source || (() => { try { return new URL(it.url).hostname; } catch { return 'unknown'; } })(),
        url: it.url,
      };
      try {
        await NewsUpdate.updateOne(
          { url: doc.url },
          { $setOnInsert: doc, $set: { candidateMinister: minister._id, isPromiseRelated: true } },
          { upsert: true }
        );
      } catch (_) {}
      await PromiseRelatedNews.updateOne(
        { url: doc.url },
        { $setOnInsert: doc, $set: { minister: minister._id, classification: 'critic', confidence: 0.8 } },
        { upsert: true }
      );
      upserted++;
    }
    console.log('Seeded promise-related news for', name, 'count:', upserted);
  } finally {
    await stopDB();
  }
}

main().catch(err => { console.error(err); process.exitCode = 1; });