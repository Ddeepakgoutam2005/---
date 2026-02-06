import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api.js';
import CompletionChart from '../components/CompletionChart.jsx';
import StatsGrid from '../components/StatsGrid.jsx';
import Leaderboard from '../components/Leaderboard.jsx';
import StatusDistributionChart from '../components/StatusDistributionChart.jsx';
import PromiseTracker from '../components/PromiseTracker.jsx';
import TrustSection from '../components/TrustSection.jsx';
import Hero from '../components/Hero.jsx';

export default function Dashboard() {
  const [ministers, setMinisters] = useState([]);
  const [promises, setPromises] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const m = await apiGet('/api/ministers');
        // Fetch promises sorted by createdAt descending to ensure "Recent Updates" shows latest data
        const p = await apiGet('/api/promises?sort=createdAt&order=desc');
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-pulse text-civic-blue font-medium">Loading civic data...</div>
    </div>
  );

  return (
    <div>
      <Hero />
      
      <div className="container mx-auto px-4 py-12 space-y-24 pb-24">
        <TrustSection />

        {/* High-level Stats */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-civic-blue dark:text-white">National Overview</h2>
            <span className="text-sm text-civic-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          <StatsGrid ministers={ministers} promises={promises} />
        </section>

        {/* Analytics Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-white/5 p-8 rounded-xl border border-civic-gray-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
            <h3 className="text-xl font-bold text-civic-gray-800 dark:text-white mb-6">Completion Ratio by Ministry</h3>
            <CompletionChart summary={summary} />
          </div>
          <div className="bg-white dark:bg-white/5 p-8 rounded-xl border border-civic-gray-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
            <h3 className="text-xl font-bold text-civic-gray-800 dark:text-white mb-6">Promise Status Distribution</h3>
            <StatusDistributionChart promises={promises} />
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <h3 className="text-2xl font-bold text-civic-blue dark:text-white mb-8">Ministerial Performance</h3>
          <Leaderboard summary={summary} />
        </section>

        {/* Recent Activity / Promises */}
        <section>
          <h3 className="text-2xl font-bold text-civic-blue dark:text-white mb-8">Recent Updates</h3>
          <PromiseTracker promises={promises} />
        </section>
      </div>
    </div>
  );
}
