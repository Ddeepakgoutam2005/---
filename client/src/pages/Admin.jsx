import { useState } from 'react';
import { apiPost, API_URL, setToken } from '../lib/api.js';

export default function Admin() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token);
      setStatus(`Logged in as ${data.user?.email} (${data.user?.role})`);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function refreshAll() {
    try {
      setLoading(true);
      const result = await apiPost('/api/admin/refresh', { saveNews: true, recomputeMetrics: true, geminiSummarize: true });
      setStatus(`Refresh done: ${result.articlesSaved} articles, AI summaries ${result.aiSummarized || 0}, ${result.metricsUpdated} metrics.`);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function importMinisters() {
    try {
      setLoading(true);
      const result = await apiPost('/api/import/ministers', {});
      setStatus(`Imported/updated ${result.upserted} ministers.`);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  // Removed legacy Import Promises action per updated workflow

  async function importPromisesFromNews() {
    try {
      setLoading(true);
      const result = await apiPost('/api/import/promises-from-news', { limit: 60 });
      setStatus(`News→Promises: upserted ${result.upserted}, linked ${result.linked}, metrics ${result.metricsUpdated} (source: ${result.source}).`);
      window.dispatchEvent(new Event('promises:refresh'));
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black dark:text-slate-100">Admin Controls</h2>
      <div className="bg-white dark:bg-slate-800/70 rounded-lg shadow p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <input className="border rounded px-3 py-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" className="border rounded px-3 py-2 w-full" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={login} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Login'}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={refreshAll} disabled={loading} className="bg-saffron text-white px-4 py-2 rounded">{loading ? '...' : 'Refresh Data (News + Metrics)'}</button>
          <button onClick={importMinisters} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Import Ministers'}</button>
          <button onClick={importPromisesFromNews} disabled={loading} className="bg-purple-700 text-white px-4 py-2 rounded">{loading ? '...' : 'Import Promises from News'}</button>
        </div>
        {status && <div className="text-sm text-slate-700 dark:text-slate-300">{status}</div>}
      </div>
    </div>
  );
}