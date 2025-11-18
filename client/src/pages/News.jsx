import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import ReportModal from '../components/ReportModal.jsx';
import { API_URL } from '../lib/api.js';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(9);
  const [report, setReport] = useState(null);
  const { user } = useAuth();

  async function loadNews() {
    const data = await apiGet('/api/news?promiseOnly=true');
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    AOS.init({ duration: 600, once: true, offset: 80 });
    loadNews().then(() => setTimeout(() => AOS.refresh(), 100)).catch(console.error);
  }, []);

  async function fetchAndSave() {
    try {
      setLoading(true);
      // Admin-only button shown via role; server enforces auth
      const res = await fetch(`${API_URL}/api/admin/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {}) }, body: JSON.stringify({ saveNews: true, recomputeMetrics: false, geminiSummarize: true }) });
      if (!res.ok) throw new Error('Refresh failed');
      await loadNews();
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black dark:text-slate-100">Latest Political News</h2>
        {user && user.role === 'admin' && (
          <button onClick={fetchAndSave} disabled={loading} className="bg-saffron text-white px-4 py-2 rounded hover:opacity-90">
            {loading ? 'Fetching…' : 'Admin: Refresh News'}
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="text-center text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-800/70 rounded-lg shadow p-8" data-aos="fade-up">
          <div className="text-xl font-semibold mb-2">No news yet</div>
          <div className="text-slate-800 dark:text-slate-300 mb-4">Try fetching latest updates or check back later.</div>
          <div className="text-sm text-slate-700 dark:text-slate-400">Pro tip: Use the "Fetch & Save News" button above.</div>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.slice(0, visible).map((n) => (
              <div key={n._id} className="rounded-xl border border-slate-700 bg-slate-800/70 backdrop-blur shadow-sm hover:shadow-md p-4" data-aos="fade-up">
                <div className="font-semibold mb-1 dark:text-slate-100">{n.headline}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-100">{n.source || 'Source'}</span>
                  {n.sentiment && <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{n.sentiment}</span>}
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">{n.relevanceScore ? `Score ${n.relevanceScore}` : 'General'}</span>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">{n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : '—'}</span>
                </div>
                {n.classificationEvidence ? (
                  <div className="text-xs text-slate-400 mb-1">{n.classificationEvidence}{typeof n.promiseConfidence === 'number' ? ` • conf ${n.promiseConfidence.toFixed(2)}` : ''}</div>
                ) : null}
                {n.summary && <div className="text-sm text-slate-700 dark:text-slate-200 line-clamp-3">{n.summary}</div>}
                <div className="mt-3 flex items-center gap-3">
                  <a href={n.url} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">Open source</a>
                  {user && (
                    <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => setReport({ relatedType: 'news', relatedId: n._id, title: n.headline })}>Report</button>
                  )}
                </div>
              </div>
            ))}
          {report && <ReportModal report={report} onClose={() => setReport(null)} />}
          </div>
          {items.length > visible && (
            <div className="flex justify-center">
              <button className="mt-2 px-4 py-2 rounded bg-blue-600 text-white" onClick={() => setVisible(v => v + 9)}>Load More</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}