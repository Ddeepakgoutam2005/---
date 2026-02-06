export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiGet(path) {
  const headers = {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  
  // Add timestamp to prevent caching
  const separator = path.includes('?') ? '&' : '?';
  const url = `${API_URL}${path}${separator}_t=${Date.now()}`;
  
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

let authToken = '';
export function setToken(token) { authToken = token || ''; }
export function getToken() { return authToken; }
export function clearToken() { authToken = ''; }

export async function apiPost(path, body = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}