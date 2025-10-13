import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Minister from '../models/Minister.js';
import PromiseModel from '../models/Promise.js';
import NewsUpdate from '../models/NewsUpdate.js';
import PerformanceMetric from '../models/PerformanceMetric.js';

const router = Router();

// Gemini integration helpers
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MINISTERS_PROMPT = process.env.GEMINI_MINISTERS_PROMPT || `
Return STRICTLY a JSON array (no prose, no Markdown) of Indian Union ministers. Each item must include:
{
  "name": string,
  "ministry": string,
  "party": string,
  "constituency"?: string,
  "photoUrl"?: string,
  "bio"?: string
}
Include at least 25 ministers from recent cabinets. Use official portrait URLs when possible.
`;
const PROMISES_PROMPT = process.env.GEMINI_PROMISES_PROMPT || `
Return STRICTLY a JSON array (no prose, no Markdown) of political promises mapped to Indian ministers. Each item must include:
{
  "ministerName": string, // must match a minister's name
  "title": string,
  "description"?: string,
  "category"?: string,
  "dateMade": string, // YYYY-MM-DD
  "status": "pending" | "in_progress" | "completed" | "broken",
  "sourceUrl"?: string
}
Include at least 40 promises, balanced across ministries.
`;

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error('Gemini error:', txt);
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    try {
      const jsonText = text.trim().replace(/^```json\n?|```$/g, '');
      const parsed = JSON.parse(jsonText);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', e, '\nRaw:', text.slice(0, 500));
      return null;
    }
  } catch (err) {
    console.error('Gemini call failed:', err);
    return null;
  }
}

function buildNewsToPromisesPrompt(newsItems, ministerNames) {
  const articles = newsItems.map(n => ({ headline: n.headline, summary: n.summary || '', url: n.url || '', publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString().slice(0,10) : '' }));
  const context = JSON.stringify(articles);
  const namesList = ministerNames.join(', ');
  return `You are an information extraction system. Given the following Indian political news articles as JSON, extract only promises or policy commitments attributable to the listed Indian ministers. Use EXACT minister names from this list: ${namesList}.
Return STRICTLY a JSON array (no prose, no Markdown). Fields:\n{
  "ministerName": string,
  "title": string,
  "description"?: string,
  "category"?: string,
  "dateMade": string, // YYYY-MM-DD (use article published date)
  "status": "pending" | "in_progress" | "completed" | "broken",
  "sourceUrl": string
}\nOnly include items directly attributable to a minister (ignore general news without a minister commitment).\nArticles JSON:\n${context}`;
}

// Expanded dataset of Indian ministers with photos and bios
const ministersData = [
  {
    name: 'Narendra Modi',
    ministry: 'Prime Minister',
    party: 'BJP',
    constituency: 'Varanasi',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/PM_Modi_2024.jpg',
    bio: 'Narendra Damodardas Modi is the 14th Prime Minister of India, in office since 2014.'
  },
  {
    name: 'Amit Shah',
    ministry: 'Home Affairs',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Amit_Shah_%28cropped%29.jpg',
    bio: 'Amit Anilchandra Shah is the Minister of Home Affairs and former President of BJP.'
  },
  {
    name: 'Nirmala Sitharaman',
    ministry: 'Finance',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Smt._Nirmala_Sitharaman_official.jpg',
    bio: 'Nirmala Sitharaman is the Minister of Finance of India.'
  },
  {
    name: 'Rajnath Singh',
    ministry: 'Defence',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Shri_Rajnath_Singh%2C_Hon%27ble_Defence_Minister.jpg',
    bio: 'Rajnath Singh is the Minister of Defence and former Chief Minister of Uttar Pradesh.'
  },
  {
    name: 'S. Jaishankar',
    ministry: 'External Affairs',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Dr._S._Jaishankar_%28cropped%29.jpg',
    bio: 'Subrahmanyam Jaishankar is the Minister of External Affairs and a former Foreign Secretary.'
  },
  {
    name: 'Nitin Gadkari',
    ministry: 'Road Transport and Highways',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Nitin_Gadkari_official.jpg',
    bio: 'Nitin Gadkari is known for infrastructure development, serving as Minister for Road Transport and Highways.'
  },
  {
    name: 'Piyush Goyal',
    ministry: 'Commerce and Industry',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Piyush_Goyal.jpg',
    bio: 'Piyush Goyal oversees Commerce and Industry; previously held Railways and Coal portfolios.'
  },
  {
    name: 'Ashwini Vaishnaw',
    ministry: 'Railways; Communications; Electronics and IT',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Ashwini_Vaishnaw_Official_Photograph.jpg',
    bio: 'Ashwini Vaishnaw is Minister for Railways and Information Technology, focusing on modernization.'
  },
  {
    name: 'Hardeep Singh Puri',
    ministry: 'Petroleum and Natural Gas; Housing and Urban Affairs',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Hardeep_Singh_Puri.jpg',
    bio: 'Hardeep Singh Puri is a former diplomat, leading urban affairs and energy portfolios.'
  },
  {
    name: 'Mansukh Mandaviya',
    ministry: 'Health and Family Welfare',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Dr._Mansukh_Mandaviya.jpg',
    bio: 'Mansukh Mandaviya is the Minister of Health and Family Welfare.'
  },
  {
    name: 'Dharmendra Pradhan',
    ministry: 'Education',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Dharmendra_Pradhan.jpg',
    bio: 'Dharmendra Pradhan is the Minister of Education, focusing on NEP implementation.'
  },
  {
    name: 'Anurag Thakur',
    ministry: 'Information and Broadcasting',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Anurag_Thakur.jpg',
    bio: 'Anurag Thakur served as Minister of Information and Broadcasting and Youth Affairs.'
  },
  {
    name: 'Smriti Irani',
    ministry: 'Women and Child Development',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Smriti_Irani_official_photo.jpg',
    bio: 'Smriti Irani has served in multiple ministries, including Women and Child Development and HRD.'
  },
  {
    name: 'Pralhad Joshi',
    ministry: 'Parliamentary Affairs; Coal and Mines',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Pralhad_Joshi.jpg',
    bio: 'Pralhad Joshi manages Parliamentary Affairs and previously Coal and Mines portfolios.'
  },
  {
    name: 'Gajendra Singh Shekhawat',
    ministry: 'Jal Shakti',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Gajendra_Singh_Shekhawat.jpg',
    bio: 'Gajendra Singh Shekhawat leads the Ministry of Jal Shakti (Water Resources).'
  },
  {
    name: 'Narayan Rane',
    ministry: 'Micro, Small and Medium Enterprises',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Narayan_Rane.jpg',
    bio: 'Narayan Rane oversees MSME sector development.'
  },
  {
    name: 'Bhupender Yadav',
    ministry: 'Environment, Forest and Climate Change; Labour and Employment',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Bhupender_Yadav.jpg',
    bio: 'Bhupender Yadav manages environment and labour portfolios.'
  }
];

router.post('/ministers', requireAuth, requireAdmin, async (req, res) => {
  const payload = Array.isArray(req.body?.ministers) && req.body.ministers.length ? req.body.ministers : ministersData;
  let created = 0;
  for (const m of payload) {
    await Minister.updateOne({ name: m.name }, { $set: m }, { upsert: true });
    created++;
  }
  res.json({ ok: true, upserted: created });
});

// Seed sample promises for known Indian ministers. If a minister is missing, skip gracefully.
router.post('/promises', requireAuth, requireAdmin, async (req, res) => {
  // If explicit payload provided, use it; otherwise try Gemini, then fallback samples
  let samples = Array.isArray(req.body?.promises) && req.body.promises.length ? req.body.promises : null;

  let source = 'payload';
  if (!samples) {
    source = 'gemini';
    samples = await callGemini(PROMISES_PROMPT);
  }
  if (!Array.isArray(samples) || samples.length === 0) {
    source = 'fallback';
    samples = [
    { ministerName: 'Narendra Modi', title: 'Expand Smart City Mission', description: 'Add new cities and improve urban infrastructure.', category: 'Infrastructure', dateMade: '2019-06-01', status: 'in_progress', sourceUrl: 'https://www.smartcities.gov.in/' },
    { ministerName: 'Amit Shah', title: 'Strengthen Internal Security Framework', description: 'Enhance police modernization and border management.', category: 'Security', dateMade: '2020-01-15', status: 'pending' },
    { ministerName: 'Nirmala Sitharaman', title: 'Boost MSME Credit Access', description: 'Simplify loans and credit guarantees for MSMEs.', category: 'Economy', dateMade: '2021-08-01', status: 'completed' },
    { ministerName: 'Rajnath Singh', title: 'Modernize Defence Procurement', description: 'Accelerate domestic manufacturing through Atmanirbhar Bharat.', category: 'Defence', dateMade: '2022-02-10', status: 'in_progress' },
    { ministerName: 'S. Jaishankar', title: 'Strengthen Neighbourhood Diplomacy', description: 'Deepen ties with SAARC and ASEAN nations.', category: 'External Affairs', dateMade: '2021-05-20', status: 'in_progress' },
    { ministerName: 'Nitin Gadkari', title: 'Build High-Speed Corridors', description: 'New expressways and logistics parks across India.', category: 'Infrastructure', dateMade: '2020-09-01', status: 'in_progress' },
    { ministerName: 'Piyush Goyal', title: 'Promote Export Competitiveness', description: 'Incentives for exporters and new FTAs.', category: 'Commerce', dateMade: '2022-06-05', status: 'pending' },
    { ministerName: 'Ashwini Vaishnaw', title: 'Railway Modernization and Safety', description: 'Upgrade signalling and station infrastructure.', category: 'Railways', dateMade: '2023-01-10', status: 'in_progress' },
    { ministerName: 'Hardeep Singh Puri', title: 'Affordable Urban Housing', description: 'Expand PMAY-Urban with faster approvals.', category: 'Urban Affairs', dateMade: '2021-11-01', status: 'pending' },
    { ministerName: 'Mansukh Mandaviya', title: 'Improve Public Health Infrastructure', description: 'Upgrade district hospitals and medical colleges.', category: 'Health', dateMade: '2022-04-12', status: 'in_progress' },
    { ministerName: 'Dharmendra Pradhan', title: 'Implement NEP Reforms', description: 'Curriculum flexibility and skill integration.', category: 'Education', dateMade: '2021-07-29', status: 'in_progress' },
    { ministerName: 'Anurag Thakur', title: 'Promote Digital Broadcasting', description: 'Support adoption of new broadcasting standards.', category: 'Information', dateMade: '2022-10-18', status: 'pending' },
    { ministerName: 'Smriti Irani', title: 'Strengthen Child Nutrition Programs', description: 'Expand POSHAN Abhiyaan reach.', category: 'WCD', dateMade: '2020-03-08', status: 'in_progress' },
    { ministerName: 'Pralhad Joshi', title: 'Legislative Efficiency', description: 'Improve session productivity and discussion time.', category: 'Parliamentary Affairs', dateMade: '2021-12-01', status: 'pending' },
    { ministerName: 'Gajendra Singh Shekhawat', title: 'Ensure Tap Water to All Households', description: 'Accelerate Jal Jeevan Mission implementation.', category: 'Water Resources', dateMade: '2019-08-15', status: 'in_progress' },
    { ministerName: 'Narayan Rane', title: 'MSME Cluster Development', description: 'Support cluster-based growth initiatives.', category: 'MSME', dateMade: '2022-01-20', status: 'pending' },
    { ministerName: 'Bhupender Yadav', title: 'Strengthen Environmental Compliance', description: 'Streamline clearances while safeguarding ecology.', category: 'Environment', dateMade: '2022-02-28', status: 'in_progress' },
    ];
  }

  // Ensure ministers exist; if DB empty, attempt to import via Gemini, else fallback to embedded dataset
  const ministerCount = await Minister.countDocuments();
  if (ministerCount === 0) {
    let importSource = 'gemini';
    let ministers = await callGemini(MINISTERS_PROMPT);
    if (!Array.isArray(ministers) || ministers.length === 0) {
      importSource = 'fallback';
      ministers = ministersData;
    }
    const normalized = ministers.map(m => ({
      name: String(m.name || '').trim(),
      ministry: String(m.ministry || '').trim(),
      party: m.party || '',
      constituency: m.constituency || '',
      photoUrl: m.photoUrl || '',
      bio: m.bio || ''
    })).filter(m => m.name && m.ministry);

    for (const m of normalized) {
      await Minister.updateOne({ name: m.name }, { $set: m }, { upsert: true });
    }
    console.log(`Imported ministers (${importSource}):`, normalized.length);
  }

  let created = 0;
  for (const raw of samples) {
    // Normalize fields
    const s = {
      ministerName: String(raw.ministerName || '').trim(),
      title: String(raw.title || '').trim(),
      description: raw.description || '',
      category: raw.category || '',
      dateMade: raw.dateMade || '2022-01-01',
      status: ['pending','in_progress','completed','broken'].includes(raw.status) ? raw.status : 'pending',
      sourceUrl: raw.sourceUrl || ''
    };
    if (!s.ministerName || !s.title) continue;

    const minister = await Minister.findOne({ name: s.ministerName });
    if (!minister) continue;
    const doc = {
      minister: minister._id,
      title: s.title,
      description: s.description,
      category: s.category,
      dateMade: new Date(s.dateMade),
      status: s.status,
      sourceUrl: s.sourceUrl,
    };
    await PromiseModel.updateOne({ minister: minister._id, title: s.title }, { $set: doc }, { upsert: true });
    created++;
  }
  res.json({ ok: true, upserted: created, source });
});

// Create/update promises inferred from recent NewsUpdate items
router.post('/promises-from-news', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { limit = 40 } = req.body || {};
    const newsItems = await NewsUpdate.find({}).sort({ publishedAt: -1 }).limit(Number(limit));
    const ministers = await Minister.find({});
    const ministerNames = ministers.map(m => m.name).filter(Boolean);
    let samples = [];
    let source = 'gemini';
    if (newsItems.length && ministerNames.length && GEMINI_API_KEY) {
      const prompt = buildNewsToPromisesPrompt(newsItems, ministerNames);
      const ai = await callGemini(prompt);
      if (Array.isArray(ai) && ai.length) {
        samples = ai;
      }
    }
    if (!samples.length) {
      source = 'heuristic';
      // Precompute ministry tokens for fuzzy matching like "Finance Minister"
      const ministerTokens = ministers.map(m => ({
        ref: m,
        nameLower: String(m.name || '').toLowerCase(),
        ministryTokens: String(m.ministry || '').toLowerCase().split(/[^a-z]+/).filter(w => w.length >= 4)
      }));
      const MINISTRY_KEYWORDS = [
        { token: 'finance', value: 'Finance' },
        { token: 'home', value: 'Home Affairs' },
        { token: 'defence', value: 'Defence' },
        { token: 'external affairs', value: 'External Affairs' },
        { token: 'foreign', value: 'External Affairs' },
        { token: 'railway', value: 'Railways' },
        { token: 'education', value: 'Education' },
        { token: 'health', value: 'Health and Family Welfare' },
        { token: 'commerce', value: 'Commerce and Industry' },
        { token: 'industry', value: 'Commerce and Industry' },
        { token: 'road', value: 'Road Transport and Highways' },
        { token: 'highways', value: 'Road Transport and Highways' },
        { token: 'environment', value: 'Environment, Forest and Climate Change' },
        { token: 'labour', value: 'Labour and Employment' },
        { token: 'broadcast', value: 'Information and Broadcasting' },
        { token: 'information and broadcasting', value: 'Information and Broadcasting' },
        { token: 'women', value: 'Women and Child Development' },
        { token: 'child', value: 'Women and Child Development' },
        { token: 'water', value: 'Jal Shakti' },
        { token: 'msme', value: 'Micro, Small and Medium Enterprises' },
        { token: 'urban', value: 'Housing and Urban Affairs' },
        { token: 'petroleum', value: 'Petroleum and Natural Gas' }
      ];
      for (const n of newsItems) {
        const text = `${n.headline} ${n.summary}`.toLowerCase();
        let matched = ministerTokens.find(mt => text.includes(mt.nameLower));
        if (!matched) {
          // If article mentions "minister" plus any significant ministry token, consider it related
          if (text.includes('minister')) {
            matched = ministerTokens.find(mt => mt.ministryTokens.some(tok => text.includes(tok)));
          }
        }
        const inferredMinistry = MINISTRY_KEYWORDS.find(k => text.includes(k.token))?.value || '';
        if (!matched) continue;
        samples.push({
          ministerName: matched.ref.name,
          title: n.headline.slice(0, 180),
          description: n.summary || '',
          category: 'news',
          dateMade: (n.publishedAt ? new Date(n.publishedAt) : new Date()).toISOString().slice(0,10),
          status: 'in_progress',
          sourceUrl: n.url || '',
          ministry: inferredMinistry
        });
      }
    }

    const affectedMinisterIds = new Set();
    let upserted = 0;
    let linked = 0;
    for (const raw of samples) {
      const s = {
        ministerName: String(raw.ministerName || '').trim(),
        title: String(raw.title || '').trim(),
        description: raw.description || '',
        category: raw.category || 'news',
        dateMade: raw.dateMade || new Date().toISOString().slice(0,10),
        status: ['pending','in_progress','completed','broken'].includes(raw.status) ? raw.status : 'pending',
        sourceUrl: raw.sourceUrl || ''
      };
      if (!s.ministerName || !s.title) continue;
      let minister = await Minister.findOne({ name: s.ministerName });
      if (!minister) {
        // Create a minister record with inferred AI/heuristic fields when possible
        const inferredMinistry = String(raw.ministry || '').trim();
        minister = await Minister.create({ name: s.ministerName, ministry: inferredMinistry || undefined });
      }
      // Update minister with any inferred details if missing
      const update = {};
      if (!minister.ministry && raw.ministry) update.ministry = String(raw.ministry).trim();
      if (raw.party) update.party = String(raw.party).trim();
      if (raw.photoUrl) update.photoUrl = String(raw.photoUrl).trim();
      if (Object.keys(update).length) {
        minister = await Minister.findByIdAndUpdate(minister._id, { $set: update }, { new: true });
      }
      affectedMinisterIds.add(String(minister._id));
      const doc = {
        minister: minister._id,
        title: s.title,
        description: s.description,
        category: s.category,
        dateMade: new Date(s.dateMade),
        status: s.status,
        sourceUrl: s.sourceUrl,
      };
      await PromiseModel.updateOne({ minister: minister._id, title: s.title }, { $set: doc }, { upsert: true });
      upserted++;
      if (s.sourceUrl) {
        const linkedPromise = await PromiseModel.findOne({ minister: minister._id, title: s.title });
        if (linkedPromise) {
          await NewsUpdate.updateOne({ url: s.sourceUrl }, { $set: { promise: linkedPromise._id } });
          linked++;
        }
      }
    }

    // Recompute current month metrics for affected ministers
    let metricsUpdated = 0;
    const now = new Date();
    const monthKey = new Date(now.getFullYear(), now.getMonth(), 1);
    for (const id of affectedMinisterIds) {
      const promises = await PromiseModel.find({ minister: id });
      const total = promises.length;
      const completed = promises.filter(p => p.status === 'completed').length;
      const broken = promises.filter(p => p.status === 'broken').length;
      const completionRate = total ? Math.round((completed / total) * 100) : 0;
      await PerformanceMetric.updateOne(
        { minister: id, monthYear: monthKey },
        { $set: { totalPromises: total, completedPromises: completed, brokenPromises: broken, completionRate, score: completionRate } },
        { upsert: true }
      );
      metricsUpdated++;
    }

    return res.json({ ok: true, upserted, linked, metricsUpdated, source });
  } catch (e) {
    console.error('promises-from-news error:', e);
    return res.status(500).json({ error: 'Failed to import promises from news' });
  }
});

export default router;