import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet } from '../lib/api.js';
import MonthlyTrendChart from '../components/MonthlyTrendChart.jsx';

export default function MinisterDetail() {
  const { id } = useParams();
  const [minister, setMinister] = useState(null);
  const [promises, setPromises] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading...</p>;
  if (!minister) return <p>Minister not found</p>;

  const completed = promises.filter(p => p.status === 'completed').length;
  const total = promises.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-10">
      <section className="bg-slate-800/70 rounded-lg shadow p-6">
        <div className="flex items-center gap-6">
          {minister.photoUrl ? (
            <img src={minister.photoUrl} alt={minister.name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200" />
          )}
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
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}