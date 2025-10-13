import dotenv from 'dotenv';

dotenv.config();

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Minimal prompt asking for strict JSON arrays that match our schemas
const MINISTERS_PROMPT = process.env.GEMINI_MINISTERS_PROMPT || `
Return ONLY a JSON array (no prose) of Indian Union ministers. Each item must include:
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
Return ONLY a JSON array (no prose) of political promises mapped to Indian ministers. Each item must include:
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

async function loginAdmin() {
  let res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  let data = await res.json();
  if (!res.ok) {
    // Try signup then login again
    await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    data = await res.json();
    if (!res.ok) throw new Error(`Login failed: ${data.error || res.status}`);
  }
  return data.token;
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) return null;
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
  // Try to extract text content and parse JSON
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    const jsonText = text.trim().replace(/^```json\n?|```$/g, '');
    return JSON.parse(jsonText);
  } catch (e) {
    console.error('Failed to parse Gemini JSON:', e, '\nRaw:', text.slice(0, 500));
    return null;
  }
}

async function importMinisters(token, ministers) {
  const res = await fetch(`${API_BASE}/api/import/ministers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ ministers })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Import ministers failed: ${data.error || res.status}`);
  return data;
}

async function importPromises(token, promises) {
  const res = await fetch(`${API_BASE}/api/import/promises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ promises })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Import promises failed: ${data.error || res.status}`);
  return data;
}

async function run() {
  const token = await loginAdmin();

  // Try Gemini for ministers; fallback to shared dataset if missing/unparseable
  let ministers = await callGemini(MINISTERS_PROMPT);
  if (!Array.isArray(ministers) || ministers.length === 0) {
    const mod = await import('../src/data/indianMinisters.js');
    ministers = mod.indianMinisters;
  }

  // Normalize minister fields
  ministers = ministers.map(m => ({
    name: String(m.name || '').trim(),
    ministry: String(m.ministry || '').trim(),
    party: m.party || '',
    constituency: m.constituency || '',
    photoUrl: m.photoUrl || '',
    bio: m.bio || ''
  })).filter(m => m.name && m.ministry);

  const minResult = await importMinisters(token, ministers);
  console.log('Ministers upserted:', minResult.upserted);

  // Try Gemini for promises; fallback to shared samples
  let promises = await callGemini(PROMISES_PROMPT);
  if (!Array.isArray(promises) || promises.length === 0) {
    const mod = await import('../src/data/indianMinisters.js');
    promises = mod.samplePromises;
  }

  // Normalize promise fields
  promises = promises.map(p => ({
    ministerName: String(p.ministerName || '').trim(),
    title: String(p.title || '').trim(),
    description: p.description || '',
    category: p.category || '',
    dateMade: p.dateMade || '2022-01-01',
    status: ['pending','in_progress','completed','broken'].includes(p.status) ? p.status : 'pending',
    sourceUrl: p.sourceUrl || ''
  })).filter(p => p.ministerName && p.title);

  const promResult = await importPromises(token, promises);
  console.log('Promises upserted:', promResult.upserted);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});