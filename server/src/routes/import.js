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
  "status": "pending" | "completed" | "broken",
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
  return `You are an information extraction system. Given the Indian political news articles below, return only explicit, future-oriented commitments made by the named ministers. Use EXACT names from this list: ${namesList}.
Return STRICTLY a JSON array (no prose). Each item:
{
  "ministerName": string,
  "title": string,
  "description"?: string,
  "category"?: string,
  "dateMade": string, // YYYY-MM-DD (use article published date)
  "status": "pending" | "in_progress" | "completed" | "broken",
  "sourceUrl": string
}
Rules: Extract only explicit commitments by a minister (e.g., "will", "pledge", "commit", "plan to"). Ignore general news, speculation, or commentary. Return [] if none.
Articles JSON:\n${context}`;
}

function buildNewsClassifierPrompt(newsItems, ministerNames) {
  const articles = newsItems.map(n => ({ headline: n.headline, summary: n.summary || '', url: n.url || '', publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString().slice(0,10) : '' }));
  const context = JSON.stringify(articles);
  const namesList = ministerNames.join(', ');
  return `Classify which articles contain an explicit, verifiable commitment by a named minister. Use EXACT minister names from: ${namesList}.
Return STRICTLY a JSON array of strings where each string is the article "url" that contains a minister's explicit promise (future-oriented commitment). Return [] if none.
Articles JSON:\n${context}`;
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
  },
  // INC (Congress)
  {
    name: 'Siddaramaiah',
    ministry: 'Chief Minister of Karnataka',
    party: 'INC',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Siddaramaiah_2016.jpg',
    bio: 'Siddaramaiah is serving as the Chief Minister of Karnataka from INC.'
  },
  {
    name: 'A. Revanth Reddy',
    ministry: 'Chief Minister of Telangana',
    party: 'INC',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/A_Revanth_Reddy_2021.jpg',
    bio: 'A. Revanth Reddy is the Chief Minister of Telangana and senior INC leader.'
  },
  {
    name: 'P. Chidambaram',
    ministry: 'Finance (former)',
    party: 'INC',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/P_Chidambaram.jpg',
    bio: 'P. Chidambaram is a senior Congress leader and former Union Finance Minister.'
  },
  // AAP
  {
    name: 'Arvind Kejriwal',
    ministry: 'Chief Minister of Delhi',
    party: 'AAP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Arvind_Kejriwal.jpg',
    bio: 'Arvind Kejriwal is the National Convener of AAP and Chief Minister of Delhi.'
  },
  {
    name: 'Bhagwant Mann',
    ministry: 'Chief Minister of Punjab',
    party: 'AAP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Bhagwant_Mann_2022.jpg',
    bio: 'Bhagwant Mann is the Chief Minister of Punjab from AAP.'
  },
  // BSP
  {
    name: 'Mayawati',
    ministry: 'Former Chief Minister of Uttar Pradesh',
    party: 'BSP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/19/The_Chief_Minister_of_Uttar_Pradesh%2C_Kumari_Mayawati.jpg',
    bio: 'Mayawati is the President of BSP and served four terms as Chief Minister of Uttar Pradesh.'
  },
  { name: 'Yogi Adityanath', ministry: 'Chief Minister of Uttar Pradesh', party: 'BJP', photoUrl: '', bio: 'Yogi Adityanath is the Chief Minister of Uttar Pradesh.' },
  { name: 'Himanta Biswa Sarma', ministry: 'Chief Minister of Assam', party: 'BJP', photoUrl: '', bio: 'Himanta Biswa Sarma is the Chief Minister of Assam.' },
  { name: 'Shivraj Singh Chouhan', ministry: 'Former Chief Minister of Madhya Pradesh', party: 'BJP', photoUrl: '', bio: 'Shivraj Singh Chouhan served multiple terms as CM of Madhya Pradesh.' },
  { name: 'Ashok Gehlot', ministry: 'Former Chief Minister of Rajasthan', party: 'INC', photoUrl: '', bio: 'Ashok Gehlot is a senior Congress leader and former CM of Rajasthan.' },
  { name: 'Bhupesh Baghel', ministry: 'Former Chief Minister of Chhattisgarh', party: 'INC', photoUrl: '', bio: 'Bhupesh Baghel is a Congress leader and former CM of Chhattisgarh.' },
  { name: 'Kamal Nath', ministry: 'Former Chief Minister of Madhya Pradesh', party: 'INC', photoUrl: '', bio: 'Kamal Nath is a veteran Congress leader and former CM of MP.' },
  { name: 'M. K. Stalin', ministry: 'Chief Minister of Tamil Nadu', party: 'DMK', photoUrl: '', bio: 'MK Stalin is the DMK leader and Chief Minister of Tamil Nadu.' },
  { name: 'Pinarayi Vijayan', ministry: 'Chief Minister of Kerala', party: 'CPI(M)', photoUrl: '', bio: 'Pinarayi Vijayan is the Chief Minister of Kerala from CPI(M).'},
  { name: 'Mamata Banerjee', ministry: 'Chief Minister of West Bengal', party: 'TMC', photoUrl: '', bio: 'Mamata Banerjee is the Chief Minister of West Bengal and leader of TMC.' },
  { name: 'Nitish Kumar', ministry: 'Chief Minister of Bihar', party: 'JD(U)', photoUrl: '', bio: 'Nitish Kumar is the Chief Minister of Bihar.' },
  { name: 'Eknath Shinde', ministry: 'Chief Minister of Maharashtra', party: 'Shiv Sena', photoUrl: '', bio: 'Eknath Shinde is the Chief Minister of Maharashtra.' },
  { name: 'Uddhav Thackeray', ministry: 'Former Chief Minister of Maharashtra', party: 'Shiv Sena', photoUrl: '', bio: 'Uddhav Thackeray served as CM of Maharashtra.' },
  { name: 'K. Chandrashekar Rao', ministry: 'Former Chief Minister of Telangana', party: 'BRS', photoUrl: '', bio: 'KCR is the founder of BRS and former CM of Telangana.' },
  { name: 'Naveen Patnaik', ministry: 'Former Chief Minister of Odisha', party: 'BJD', photoUrl: '', bio: 'Naveen Patnaik served as the long-time CM of Odisha.' },
  { name: 'Sarbananda Sonowal', ministry: 'Ports, Shipping and Waterways; AYUSH', party: 'BJP', photoUrl: '', bio: 'Sarbananda Sonowal is a Union Minister handling ports and AYUSH.' },
  { name: 'Jyotiraditya Scindia', ministry: 'Civil Aviation', party: 'BJP', photoUrl: '', bio: 'Jyotiraditya Scindia is the Minister of Civil Aviation.' },
  { name: 'Kiren Rijiju', ministry: 'Law and Justice', party: 'BJP', photoUrl: '', bio: 'Kiren Rijiju has served as Minister of Law and Justice.' },
  { name: 'Arjun Ram Meghwal', ministry: 'Law and Justice (MoS)', party: 'BJP', photoUrl: '', bio: 'Arjun Ram Meghwal has served as MoS for Law and Justice.' },
  { name: 'Rajeev Chandrasekhar', ministry: 'Electronics and IT (MoS)', party: 'BJP', photoUrl: '', bio: 'Rajeev Chandrasekhar is MoS for Electronics and IT.' },
  { name: 'Giriraj Singh', ministry: 'Rural Development', party: 'BJP', photoUrl: '', bio: 'Giriraj Singh has served as Minister for Rural Development.' },
  { name: 'Parshottam Rupala', ministry: 'Fisheries, Animal Husbandry and Dairying', party: 'BJP', photoUrl: '', bio: 'Parshottam Rupala leads fisheries and animal husbandry.' },
  { name: 'Mahendra Nath Pandey', ministry: 'Heavy Industries', party: 'BJP', photoUrl: '', bio: 'Mahendra Nath Pandey has served as Minister of Heavy Industries.' },
  { name: 'G. Kishan Reddy', ministry: 'Culture; Development of North Eastern Region', party: 'BJP', photoUrl: '', bio: 'G Kishan Reddy has served as Minister of Culture and DoNER.' },
  { name: 'Anupriya Patel', ministry: 'Commerce and Industry (MoS)', party: 'Apna Dal (S)', photoUrl: '', bio: 'Anupriya Patel is MoS for Commerce and Industry.' },
  { name: 'Jitendra Singh', ministry: 'PMO; Science and Technology (MoS)', party: 'BJP', photoUrl: '', bio: 'Jitendra Singh is MoS in PMO and S&T.' },
  { name: 'V. K. Singh', ministry: 'Civil Aviation; MEA (MoS)', party: 'BJP', photoUrl: '', bio: 'Gen VK Singh has served as MoS in multiple ministries.' },
  { name: 'Meenakshi Lekhi', ministry: 'External Affairs; Culture (MoS)', party: 'BJP', photoUrl: '', bio: 'Meenakshi Lekhi is MoS for External Affairs and Culture.' },
  { name: 'Sadhvi Niranjan Jyoti', ministry: 'Consumer Affairs; Rural Development (MoS)', party: 'BJP', photoUrl: '', bio: 'Sadhvi Niranjan Jyoti is MoS in Consumer Affairs.' },
  { name: 'Kaushal Kishore', ministry: 'Housing and Urban Affairs (MoS)', party: 'BJP', photoUrl: '', bio: 'Kaushal Kishore is MoS for Housing and Urban Affairs.' },
  { name: 'Pankaj Chaudhary', ministry: 'Finance (MoS)', party: 'BJP', photoUrl: '', bio: 'Pankaj Chaudhary is MoS in the Ministry of Finance.' },
  { name: 'Nityanand Rai', ministry: 'Home Affairs (MoS)', party: 'BJP', photoUrl: '', bio: 'Nityanand Rai is MoS for Home Affairs.' },
  { name: 'Kailash Choudhary', ministry: 'Agriculture (MoS)', party: 'BJP', photoUrl: '', bio: 'Kailash Choudhary is MoS in Agriculture.' },
  { name: 'Prahlad Singh Patel', ministry: 'Food Processing; Jal Shakti', party: 'BJP', photoUrl: '', bio: 'Prahlad Singh Patel has served in Jal Shakti and Food Processing.' },
  { name: 'Ashwini Kumar Choubey', ministry: 'Health and Family Welfare (MoS)', party: 'BJP', photoUrl: '', bio: 'Ashwini Choubey is MoS for Health.' },
  { name: 'Ramdas Athawale', ministry: 'Social Justice and Empowerment (MoS)', party: 'RPI(A)', photoUrl: '', bio: 'Ramdas Athawale is MoS for Social Justice and Empowerment.' },
  { name: 'Shobha Karandlaje', ministry: 'Agriculture and Farmers Welfare (MoS)', party: 'BJP', photoUrl: '', bio: 'Shobha Karandlaje is MoS in Agriculture.' },
  { name: 'Ajay Bhatt', ministry: 'Defence; Tourism (MoS)', party: 'BJP', photoUrl: '', bio: 'Ajay Bhatt is MoS in Defence and Tourism.' },
  { name: 'Bhagwanth Khuba', ministry: 'Chemicals and Fertilizers (MoS)', party: 'BJP', photoUrl: '', bio: 'Bhagwanth Khuba is MoS for Chemicals and Fertilizers.' },
  { name: 'Faggan Singh Kulaste', ministry: 'Steel (MoS)', party: 'BJP', photoUrl: '', bio: 'Faggan Singh Kulaste is MoS in Steel.' },
  { name: 'Rao Inderjit Singh', ministry: 'Statistics and Programme Implementation', party: 'BJP', photoUrl: '', bio: 'Rao Inderjit Singh leads Statistics and Programme Implementation.' }
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
    { ministerName: 'Narendra Modi', title: 'Expand Smart City Mission', description: 'Add new cities and improve urban infrastructure.', category: 'Infrastructure', dateMade: '2019-06-01', status: 'completed', sourceUrl: 'https://www.smartcities.gov.in/' },
    { ministerName: 'Amit Shah', title: 'Strengthen Internal Security Framework', description: 'Enhance police modernization and border management.', category: 'Security', dateMade: '2020-01-15', status: 'pending' },
    { ministerName: 'Nirmala Sitharaman', title: 'Boost MSME Credit Access', description: 'Simplify loans and credit guarantees for MSMEs.', category: 'Economy', dateMade: '2021-08-01', status: 'completed' },
    { ministerName: 'Rajnath Singh', title: 'Modernize Defence Procurement', description: 'Accelerate domestic manufacturing through Atmanirbhar Bharat.', category: 'Defence', dateMade: '2022-02-10', status: 'completed' },
    { ministerName: 'S. Jaishankar', title: 'Strengthen Neighbourhood Diplomacy', description: 'Deepen ties with SAARC and ASEAN nations.', category: 'External Affairs', dateMade: '2021-05-20', status: 'completed' },
    { ministerName: 'Nitin Gadkari', title: 'Build High-Speed Corridors', description: 'New expressways and logistics parks across India.', category: 'Infrastructure', dateMade: '2020-09-01', status: 'completed' },
    { ministerName: 'Piyush Goyal', title: 'Promote Export Competitiveness', description: 'Incentives for exporters and new FTAs.', category: 'Commerce', dateMade: '2022-06-05', status: 'pending' },
    { ministerName: 'Ashwini Vaishnaw', title: 'Railway Modernization and Safety', description: 'Upgrade signalling and station infrastructure.', category: 'Railways', dateMade: '2023-01-10', status: 'completed' },
    { ministerName: 'Hardeep Singh Puri', title: 'Affordable Urban Housing', description: 'Expand PMAY-Urban with faster approvals.', category: 'Urban Affairs', dateMade: '2021-11-01', status: 'pending' },
    { ministerName: 'Mansukh Mandaviya', title: 'Improve Public Health Infrastructure', description: 'Upgrade district hospitals and medical colleges.', category: 'Health', dateMade: '2022-04-12', status: 'completed' },
    { ministerName: 'Dharmendra Pradhan', title: 'Implement NEP Reforms', description: 'Curriculum flexibility and skill integration.', category: 'Education', dateMade: '2021-07-29', status: 'completed' },
    { ministerName: 'Anurag Thakur', title: 'Promote Digital Broadcasting', description: 'Support adoption of new broadcasting standards.', category: 'Information', dateMade: '2022-10-18', status: 'pending' },
    { ministerName: 'Smriti Irani', title: 'Strengthen Child Nutrition Programs', description: 'Expand POSHAN Abhiyaan reach.', category: 'WCD', dateMade: '2020-03-08', status: 'completed' },
    { ministerName: 'Pralhad Joshi', title: 'Legislative Efficiency', description: 'Improve session productivity and discussion time.', category: 'Parliamentary Affairs', dateMade: '2021-12-01', status: 'pending' },
    { ministerName: 'Gajendra Singh Shekhawat', title: 'Ensure Tap Water to All Households', description: 'Accelerate Jal Jeevan Mission implementation.', category: 'Water Resources', dateMade: '2019-08-15', status: 'completed' },
    { ministerName: 'Narayan Rane', title: 'MSME Cluster Development', description: 'Support cluster-based growth initiatives.', category: 'MSME', dateMade: '2022-01-20', status: 'pending' },
    { ministerName: 'Bhupender Yadav', title: 'Strengthen Environmental Compliance', description: 'Streamline clearances while safeguarding ecology.', category: 'Environment', dateMade: '2022-02-28', status: 'completed' },
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
    let allowedUrls = new Set();
    if (newsItems.length && ministerNames.length && GEMINI_API_KEY) {
      const clfPrompt = buildNewsClassifierPrompt(newsItems, ministerNames);
      const clf = await callGemini(clfPrompt);
      if (Array.isArray(clf) && clf.length) {
        for (const u of clf) if (typeof u === 'string') allowedUrls.add(u);
      }
      const filtered = allowedUrls.size ? newsItems.filter(n => allowedUrls.has(n.url)) : newsItems;
      const prompt = buildNewsToPromisesPrompt(filtered, ministerNames);
      const ai = await callGemini(prompt);
      if (Array.isArray(ai) && ai.length) {
        samples = ai;
      }
    }
    if (!samples.length) {
      source = 'heuristic';
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
      const COMMITMENT_PHRASES = [
        ' will ', 'will ', ' pledges', ' pledged', ' promises', ' promised', ' commit', ' commits to', ' intends to', ' plans to', ' announced that', ' aims to', ' target', ' introduce', ' implement', ' ensure', ' guarantee', ' launch', ' roll out', ' rolled out', ' unveiled', ' announced '
      ];
      const NEGATIONS = [' not ', ' never ', ' unlikely ', ' denied '];
      const SPECULATIVE = [' may ', ' might ', ' could '];

      function scoreTextForMinister(text, nameLower) {
        let score = 0;
        const reasons = [];
        const hasName = text.includes(nameLower);
        if (hasName) { score += 30; reasons.push('minister'); }
        const commitMatch = COMMITMENT_PHRASES.find(v => text.includes(v));
        if (commitMatch) { score += 30; reasons.push('verb'); }
        const deadline = /(by\s+\d{4}|next\s+year|this\s+year|within\s+\d+\s+(days|months|years))/i.test(text);
        if (deadline) { score += 10; reasons.push('deadline'); }
        const hasNeg = NEGATIONS.some(n => text.includes(n));
        if (hasNeg) { score -= 50; reasons.push('negation'); }
        const hasSpec = SPECULATIVE.some(s => text.includes(s));
        if (hasSpec) { score -= 20; reasons.push('speculative'); }
        if (hasName && commitMatch) {
          const nameIdx = text.indexOf(nameLower);
          const verbIdx = text.indexOf(commitMatch);
          const distance = Math.abs(nameIdx - verbIdx);
          if (distance > 100) { score -= 20; reasons.push('far'); }
        }
        return { score, reasons };
      }
      for (const n of newsItems) {
        const text = `${n.headline} ${n.summary}`.toLowerCase();
        let matched = ministerTokens.find(mt => text.includes(mt.nameLower));
        if (!matched) {
          if (text.includes('minister')) {
            matched = ministerTokens.find(mt => mt.ministryTokens.some(tok => text.includes(tok)));
          }
        }
        const inferredMinistry = MINISTRY_KEYWORDS.find(k => text.includes(k.token))?.value || '';
        if (!matched) continue;
        const s = scoreTextForMinister(text, matched.nameLower);
        const isCandidate = s.score >= 60;
        await NewsUpdate.updateOne({ url: n.url }, { $set: { isPromiseCandidate: isCandidate, promiseScore: s.score, candidateLog: s.reasons.join(','), candidateMinister: isCandidate ? matched.ref._id : undefined } });
        if (!isCandidate) continue;
        let status = 'pending';
        if (text.includes('launched') || text.includes('roll out') || text.includes('rolled out') || text.includes('unveiled') || text.includes('inaugurat')) {
          status = 'in_progress';
        }
        samples.push({
          ministerName: matched.ref.name,
          title: n.headline.slice(0, 180),
          description: n.summary || '',
          category: 'news',
          dateMade: (n.publishedAt ? new Date(n.publishedAt) : new Date()).toISOString().slice(0,10),
          status,
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
          await NewsUpdate.updateOne({ url: s.sourceUrl }, { $set: { promise: linkedPromise._id, isPromiseCandidate: true } });
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
      const completed = promises.filter(p => p.status === 'completed' || p.status === 'in_progress').length;
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