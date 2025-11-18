import { useEffect, useState } from 'react';
import { apiGet, API_URL } from '../lib/api.js';

export default function MyQueries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiGet('/api/queries/my');
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setStatus(String(e.message || e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function promiseLink(q) {
    const mid = q?.meta?.ministerId;
    if (!mid) return null;
    return `/ministers/${mid}`;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black dark:text-slate-100">My Queries</h2>
      {status && <div className="text-sm text-slate-700 dark:text-slate-300">{status}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div>No queries submitted</div>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q._id} className="rounded border border-white/30 dark:border-slate-700 p-3 bg-white dark:bg-slate-800/70">
              <div className="font-semibold text-black dark:text-slate-100">{q?.meta?.promiseTitle || 'Promise'}</div>
              <div className="text-sm text-black dark:text-slate-300">{q.message.length > 140 ? q.message.slice(0,140)+'…' : q.message}</div>
              <div className="text-xs text-slate-700 dark:text-slate-400">Status: {q.status} • {new Date(q.createdAt).toLocaleString()}</div>
              {promiseLink(q) && <a className="text-blue-600 dark:text-blue-300 text-sm" href={promiseLink(q)}>View minister</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}