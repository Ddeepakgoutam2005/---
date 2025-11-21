import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import ReportModal from '../components/ReportModal.jsx';

export default function Promises() {
  const [promises, setPromises] = useState([]);
  const [status, setStatus] = useState('');
  const [news, setNews] = useState([]);
  const [report, setReport] = useState(null);
  const { user } = useAuth();
  useEffect(() => {
    const fetchPromises = () => {
      apiGet('/api/promises').then(setPromises).catch(console.error);
    };
    fetchPromises();
    const handler = () => fetchPromises();
    window.addEventListener('promises:refresh', handler);
    return () => window.removeEventListener('promises:refresh', handler);
  }, []);

  useEffect(() => {
    const fetchNews = () => {
      apiGet('/api/news?promiseOnly=true').then((items) => setNews(Array.isArray(items) ? items : [])).catch(console.error);
    };
    fetchNews();
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
              {user && (
                <div className="mt-2">
                  <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => setReport({ relatedType: 'promise', relatedId: p._id, title: p.title })}>Report</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 mt-8">
        <h3 className="text-xl font-semibold text-black dark:text-slate-100">Recent Promise-related News</h3>
        {news.length === 0 ? (
          <p className="text-slate-800 dark:text-slate-300">No recent promise-related news</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {news.map((n) => (
              <a key={n._id} href={n.url} target="_blank" rel="noreferrer" className="rounded border border-white/30 dark:border-slate-700 p-3 bg-white dark:bg-slate-800/70">
                <div className="font-semibold text-black dark:text-slate-100">{n.headline}</div>
                <div className="text-xs text-slate-900 dark:text-slate-300 flex gap-2 mt-1">
                  <span>{n.source || 'Source'}</span>
                  {n.publishedAt ? <span>{new Date(n.publishedAt).toLocaleDateString()}</span> : null}
                </div>
                {n.classificationEvidence ? (
                  <div className="text-xs text-slate-700 dark:text-slate-400 mt-1">{n.classificationEvidence}{typeof n.promiseConfidence === 'number' ? ` • conf ${n.promiseConfidence.toFixed(2)}` : ''}</div>
                ) : null}
                {n.summary ? <div className="text-sm text-black dark:text-slate-300 mt-2">{n.summary}</div> : null}
              </a>
            ))}
          </div>
        )}
      </div>
      {report && <ReportModal report={report} onClose={() => setReport(null)} />}
    </div>
  );
}