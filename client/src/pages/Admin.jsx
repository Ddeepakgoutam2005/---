import { useState } from 'react';
import { apiPost, API_URL } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Admin() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  async function loginAdmin() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.token, data.user);
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
  async function fetchMinisterImages() {
    try {
      setLoading(true);
      const result = await apiPost('/api/admin/fetch-minister-images', {});
      setStatus(`Processed ${result.processed}: updated=${result.updated}, placeholders=${result.placeholders}`);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function cleanupNewsDryRun() {
    try {
      setLoading(true);
      const result = await apiPost('/api/admin/cleanup-news', { dryRun: true, threshold: 60 });
      setStatus(`Found ${result.count} non-genuine linked news. Review and confirm cleanup.`);
      window.__cleanupNewsItems = result.items || [];
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function cleanupNewsConfirm() {
    try {
      setLoading(true);
      const result = await apiPost('/api/admin/cleanup-news', { dryRun: false, threshold: 60 });
      setStatus(`Unlinked ${result.unlinked} non-genuine news from promises.`);
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
          <button onClick={loginAdmin} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Login'}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={refreshAll} disabled={loading} className="bg-saffron text-white px-4 py-2 rounded">{loading ? '...' : 'Refresh Data (News + Metrics)'}</button>
          <button onClick={importMinisters} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Import Ministers'}</button>
          <button onClick={importPromisesFromNews} disabled={loading} className="bg-purple-700 text-white px-4 py-2 rounded">{loading ? '...' : 'Import Promises from News'}</button>
          <button onClick={fetchMinisterImages} disabled={loading} className="bg-teal-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Fetch Minister Images'}</button>
          <button onClick={cleanupNewsDryRun} disabled={loading} className="bg-orange-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Cleanup Non-Genuine News (Dry Run)'}</button>
          <button onClick={cleanupNewsConfirm} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Confirm Cleanup'}</button>
        </div>
        {status && <div className="text-sm text-slate-700 dark:text-slate-300">{status}</div>}
      </div>
    </div>
  );
}