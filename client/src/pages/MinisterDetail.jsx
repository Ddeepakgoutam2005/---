import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, API_URL } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import ReportModal from '../components/ReportModal.jsx';
import MonthlyTrendChart from '../components/MonthlyTrendChart.jsx';

export default function MinisterDetail() {
  const { id } = useParams();
  const [minister, setMinister] = useState(null);
  const [promises, setPromises] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [myReports, setMyReports] = useState({});
  const [criticismNews, setCriticismNews] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const m = await apiGet(`/api/ministers/${id}`);
        const p = await apiGet(`/api/promises?minister=${id}`);
        const t = await apiGet(`/api/performance/trends?minister=${id}&months=12`);
        setMinister(m);
        setPromises(p);
        setTrend(t);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    async function loadMyQueries() {
      try {
        if (!user) return;
        const items = await apiGet('/api/queries/my');
        const map = {};
        for (const q of items) {
          if (q.relatedType === 'promise') map[String(q.relatedId)] = q.status;
        }
        setMyReports(map);
      } catch (e) {
        console.warn('Failed to load user queries', e);
      }
    }
    loadMyQueries();
  }, [user]);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch(`${API_URL}/api/news/related?minister=${id}&limit=25`);
        const items = await res.json();
        const arr = Array.isArray(items) ? items : [];
        setCriticismNews(arr);
      } catch (e) {
        console.warn('Failed to load promise-related news', e);
      }
    }
    loadNews();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!minister) return <p>Minister not found</p>;

  const completed = promises.filter(p => (p.status === 'completed' || p.status === 'in_progress')).length;
  const total = promises.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-10">
      <section className="bg-slate-800/70 rounded-lg shadow p-6">
        <div className="flex items-center gap-6">
          <img
            src={minister.photoUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="#111827">Minister</text></svg>'}
            alt={minister.name}
            className="w-24 h-24 rounded-full object-cover"
            onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="#111827">Minister</text></svg>'; }}
          />
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-slate-100">{minister.name}</h2>
            <div className="text-slate-900 dark:text-slate-300">{minister.ministry}{minister.party ? ` • ${minister.party}` : ''}</div>
            {minister.constituency ? <div className="text-slate-600 dark:text-slate-300">Constituency: {minister.constituency}</div> : null}
          </div>
        </div>
        {minister.bio ? <p className="mt-4 text-slate-900 dark:text-slate-300">{minister.bio}</p> : null}
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Performance Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800/70 rounded-lg p-4 shadow">
            <div className="text-sm text-slate-600 dark:text-slate-300">Total Promises</div>
            <div className="text-2xl font-bold">{total}</div>
          </div>
          <div className="bg-white dark:bg-slate-800/70 rounded-lg p-4 shadow">
            <div className="text-sm text-slate-600 dark:text-slate-300">Completed</div>
            <div className="text-2xl font-bold text-green-600">{completed}</div>
          </div>
          <div className="bg-white dark:bg-slate-800/70 rounded-lg p-4 shadow">
            <div className="text-sm text-slate-600 dark:text-slate-300">Completion Rate</div>
            <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
          </div>
          <div className="bg-white dark:bg-slate-800/70 rounded-lg p-4 shadow">
            <div className="text-sm text-slate-600 dark:text-slate-300">Broken</div>
            <div className="text-2xl font-bold text-red-600">{promises.filter(p=>p.status==='broken').length}</div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Monthly Trends</h3>
        <MonthlyTrendChart trend={trend} />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Promises</h3>
        {promises.length === 0 ? (
          <p className="dark:text-slate-300">No promises found</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {promises.map((p) => (
              <div key={p._id} className="rounded border border-slate-700 p-3 bg-slate-800/70">
                <div className="font-semibold">{p.title}</div>
                {p.description ? <div className="text-sm text-slate-300">{p.description}</div> : null}
                <div className="text-sm">Status: {p.status}</div>
                {p.sourceUrl ? <a className="text-blue-300 text-sm" href={p.sourceUrl} target="_blank" rel="noreferrer">Source</a> : null}
                {p.verificationUrl ? <a className="text-blue-300 text-sm ml-2" href={p.verificationUrl} target="_blank" rel="noreferrer">Verification</a> : null}
                {user && (
                  <div className="mt-2 flex items-center gap-2">
                    <button className="px-3 py-1 rounded bg-saffron text-white" onClick={() => setReport({ relatedType: 'promise', relatedId: p._id, title: p.title })}>Report</button>
                    {myReports[p._id] && (
                      <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-200">Reported — {myReports[p._id]}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-4">Promise Related News</h3>
        {criticismNews.length === 0 ? (
          <p className="dark:text-slate-300">No promise-related news found</p>
        ) : (
          <div className="space-y-3">
            {criticismNews.map(n => (
              <div key={n._id} className="rounded border border-slate-700 p-3 bg-slate-800/70">
                <div className="font-semibold">{n.headline}</div>
                {n.summary ? <div className="text-sm text-slate-300">{n.summary}</div> : null}
                <div className="text-xs text-slate-400">Score: {n.promiseScore} {n.candidateLog ? `• ${n.candidateLog}` : ''}</div>
                {n.url ? <a className="text-blue-300 text-sm" href={n.url} target="_blank" rel="noreferrer">Source</a> : null}
              </div>
            ))}
          </div>
        )}
      </section>
      {report && <ReportModal report={report} onClose={() => setReport(null)} />}
    </div>
  );
}