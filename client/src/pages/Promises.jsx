import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api.js';

export default function Promises() {
  const [promises, setPromises] = useState([]);
  const [status, setStatus] = useState('');
  useEffect(() => {
    const fetchPromises = () => {
      apiGet('/api/promises').then(setPromises).catch(console.error);
    };
    fetchPromises();
    const handler = () => fetchPromises();
    window.addEventListener('promises:refresh', handler);
    return () => window.removeEventListener('promises:refresh', handler);
  }, []);

  const filtered = promises.filter((p) =>
    status ? p.status === status : true
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="broken">Broken</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="text-slate-800 dark:text-slate-300">No promises found</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <div key={p._id} className="rounded border border-white/30 dark:border-slate-700 p-3 bg-white dark:bg-slate-800/70">
              <div className="font-semibold text-black dark:text-slate-100">{p.title}</div>
              <div className="text-sm text-black dark:text-slate-300">Status: {p.status}</div>
              {p.minister ? <div className="text-sm text-slate-900 dark:text-slate-300">Minister: {p.minister.name}</div> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}