import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { apiGet } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import ReportModal from '../components/ReportModal.jsx';
import MonthlyTrendChart from '../components/MonthlyTrendChart.jsx';
import PromiseCard from '../components/PromiseCard.jsx';

export default function MinisterDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [minister, setMinister] = useState(null);
  const [promises, setPromises] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [highlightedPromiseId, setHighlightedPromiseId] = useState(null);
  const { user } = useAuth();
  
  // Create refs map to scroll to specific promise
  const promiseRefs = useRef({});

  useEffect(() => {
    async function load() {
      try {
        const m = await apiGet(`/api/ministers/${id}`);
        const p = await apiGet(`/api/promises?minister=${id}`);
        const t = await apiGet(`/api/performance/trends?minister=${id}&months=12`);
        
        // Fetch user's reports to check which promises are reported
        let userReportStatus = new Map();
        if (user) {
          try {
            const reports = await apiGet('/api/queries/my');
            if (Array.isArray(reports)) {
              reports.forEach(r => {
                if (r.relatedType === 'promise') {
                  userReportStatus.set(r.relatedId, r.status);
                }
              });
            }
          } catch (e) {
            console.error('Failed to fetch user reports', e);
          }
        }

        setMinister(m);
        // Add reported status to promises
        setPromises(p.map(promise => ({
          ...promise,
          userReportStatus: userReportStatus.get(promise._id)
        })));
        setTrend(t);
        
        // Check for highlight ID from navigation state or hash
        const highlightId = location.state?.highlightPromiseId || 
                            (location.hash ? location.hash.replace('#promise-', '') : null);
        
        if (highlightId) {
          setHighlightedPromiseId(highlightId);
          // Clear highlight after 3 seconds
          setTimeout(() => setHighlightedPromiseId(null), 3000);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, location, user]);

  // Scroll to highlighted promise when promises are loaded and highlightId is set
  useEffect(() => {
    if (!loading && highlightedPromiseId && promiseRefs.current[highlightedPromiseId]) {
      setTimeout(() => {
        promiseRefs.current[highlightedPromiseId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500); // Small delay to ensure rendering
    }
  }, [loading, highlightedPromiseId]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-civic-blue"></div>
    </div>
  );
  
  if (!minister) return <p className="text-center text-civic-gray-600 mt-10">Minister not found</p>;

  const completed = promises.filter(p => (p.status === 'completed' || p.status === 'in_progress')).length;
  const total = promises.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl pb-12">
      {/* Profile Header */}
      <section className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl p-8 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-civic-gray-100 to-civic-gray-200 dark:from-white/10 dark:to-white/5">
              <img
                src={minister.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(minister.name)}&background=1e3a8a&color=fff&size=128`}
                alt={minister.name}
                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-white/10"
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(minister.name)}&background=1e3a8a&color=fff&size=128`; }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-civic-blue text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white dark:border-black shadow-sm">
              {completionRate}%
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-civic-blue dark:text-blue-400 mb-2">{minister.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-civic-gray-600 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1 bg-civic-gray-50 dark:bg-white/10 px-3 py-1 rounded-full border border-civic-gray-100 dark:border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {minister.ministry}
              </span>
              {minister.party && (
                <span className="flex items-center gap-1 bg-civic-gray-50 dark:bg-white/10 px-3 py-1 rounded-full border border-civic-gray-100 dark:border-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  {minister.party}
                </span>
              )}
              {minister.constituency && (
                <span className="flex items-center gap-1 bg-civic-gray-50 dark:bg-white/10 px-3 py-1 rounded-full border border-civic-gray-100 dark:border-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {minister.constituency}
                </span>
              )}
            </div>
            {minister.bio && <p className="text-civic-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">{minister.bio}</p>}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Chart */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-civic-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Performance Overview</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-civic-gray-50 dark:bg-white/10 rounded-lg border border-civic-gray-100 dark:border-white/10">
                <div className="text-xs text-civic-gray-500 dark:text-gray-400 mb-1">Total Promises</div>
                <div className="text-2xl font-bold text-civic-blue dark:text-blue-400">{total}</div>
              </div>
              <div className="p-4 bg-civic-gray-50 dark:bg-white/10 rounded-lg border border-civic-gray-100 dark:border-white/10">
                <div className="text-xs text-civic-gray-500 dark:text-gray-400 mb-1">Completion Rate</div>
                <div className="text-2xl font-bold text-civic-teal dark:text-teal-400">{completionRate}%</div>
              </div>
            </div>
            <MonthlyTrendChart trend={trend} />
          </div>
        </div>

        {/* Right Column: Promises List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-civic-blue dark:text-blue-400">Tracked Promises</h2>
             <span className="text-sm text-civic-gray-500 dark:text-gray-400">Showing {promises.length} records</span>
          </div>

          <div className="space-y-4">
            {promises.length === 0 ? (
              <div className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl p-8 text-center backdrop-blur-sm">
                <p className="text-civic-gray-500 dark:text-gray-400">No promises tracked for this minister yet.</p>
              </div>
            ) : (
              promises.map(p => (
                <div 
                  key={p._id} 
                  ref={el => promiseRefs.current[p._id] = el}
                  className={`transition-all duration-500 rounded-xl ${
                    highlightedPromiseId === p._id 
                      ? 'ring-2 ring-civic-blue shadow-lg scale-[1.02] bg-blue-50/50 dark:bg-blue-900/10' 
                      : ''
                  }`}
                >
                  <PromiseCard 
                    promise={p} 
                    user={user} 
                    onReport={(r) => setReport(r)}
                    userReports={promises.filter(promise => promise.isReportedByCurrentUser)} // Assuming this flag or logic needs to be passed
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {report && <ReportModal report={report} onClose={() => setReport(null)} />}
    </div>
  );
}
