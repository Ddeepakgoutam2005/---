import { useEffect, useState } from 'react';
import { API_URL } from '../lib/api.js';
 

export default function AdminQueries() {
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  async function load() {
    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('authToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/queries`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data.items || []);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load().catch(() => {}); }, []);

  async function markResolved(id) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('authToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/queries/${id}/status`, { method: 'PUT', headers, body: JSON.stringify({ status: 'resolved' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      await load();
    } catch (e) {
      setStatus(String(e.message || e));
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black dark:text-slate-100">User Queries</h2>
      {status && <div className="text-sm text-slate-700 dark:text-slate-300">{status}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div>No queries</div>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q._id} className="rounded border border-white/30 dark:border-slate-700 p-3 bg-white dark:bg-slate-800/70">
              <div className="text-sm text-black dark:text-slate-300">{q.user?.name} ({q.user?.email})</div>
              <div className="font-semibold text-black dark:text-slate-100">{q.relatedType}: {q.meta?.headline || q.meta?.title}</div>
              <div className="text-sm text-black dark:text-slate-300">{q.message}</div>
              <div className="text-xs text-slate-700 dark:text-slate-400">Status: {q.status} • {new Date(q.createdAt).toLocaleString()}</div>
              {q.status !== 'resolved' && (
                <button className="mt-2 px-3 py-1 rounded bg-green-600 text-white" onClick={() => markResolved(q._id)}>Mark resolved</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}