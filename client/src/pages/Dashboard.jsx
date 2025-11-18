import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api.js';
import CompletionChart from '../components/CompletionChart.jsx';
import StatsGrid from '../components/StatsGrid.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import StatusDistributionChart from '../components/StatusDistributionChart.jsx';
import PromiseTracker from '../components/PromiseTracker.jsx';
import GlassCard from '../components/GlassCard.jsx';

export default function Dashboard() {
  const [ministers, setMinisters] = useState([]);
  const [promises, setPromises] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const m = await apiGet('/api/ministers');
        const p = await apiGet('/api/promises');
        const s = await apiGet('/api/performance/summary');
        setMinisters(m);
        setPromises(p);
        setSummary(s);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-16">
      {/* Dashboard Stats */}
      <section>
        <h3 className="text-3xl font-bold text-center mb-12 text-black dark:text-slate-100">Dashboard Overview</h3>
        <StatsGrid ministers={ministers} promises={promises} />
      </section>

      {/* Analytics Charts */}
      <section>
        <h3 className="text-3xl font-bold text-center mb-12 text-black dark:text-slate-100">Performance Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6">
            <h4 className="text-xl font-semibold mb-4">Ministry Performance</h4>
            <CompletionChart summary={summary} />
          </GlassCard>
          <GlassCard className="p-6">
            <h4 className="text-xl font-semibold mb-4">Promise Status Distribution</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur p-4">
                <div className="text-sm text-gray-600 dark:text-slate-300">Pending</div>
                <div className="text-2xl font-bold text-orange-600">{promises.filter(p => p.status === 'pending').length}</div>
              </div>
              
              <div className="rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur p-4">
                <div className="text-sm text-gray-600 dark:text-slate-300">Completed</div>
                <div className="text-2xl font-bold text-green-600">{promises.filter(p => p.status === 'completed' || p.status === 'in_progress').length}</div>
              </div>
              <div className="rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur p-4">
                <div className="text-sm text-gray-600 dark:text-slate-300">Broken</div>
                <div className="text-2xl font-bold text-red-600">{promises.filter(p => p.status === 'broken').length}</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Top Ministers Leaderboard */}
      <section>
        <h3 className="text-3xl font-bold text-center mb-12 text-black dark:text-slate-100">Top Performing Ministers</h3>
        <Leaderboard summary={summary} />
      </section>

      {/* Analytics Charts */}
      <section>
        <h3 className="text-3xl font-bold text-center mb-12 text-black dark:text-slate-100">Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <CompletionChart summary={summary} />
          </GlassCard>
          <GlassCard className="p-6">
            <StatusDistributionChart promises={promises} />
          </GlassCard>
        </div>
      </section>

      {/* Promise Tracking Cards */}
      <section>
        <h3 className="text-3xl font-bold text-center mb-12 text-black dark:text-slate-100">Promise Tracking</h3>
        <PromiseTracker promises={promises} />
      </section>

      {/* Footer removed to avoid duplicate; global Footer remains in App.jsx */}
    </div>
  );
}