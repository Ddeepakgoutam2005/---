import { useEffect, useState, useRef } from 'react';
import { apiGet } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import ReportModal from '../components/ReportModal.jsx';
import { API_URL } from '../lib/api.js';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useLocation } from 'react-router-dom';

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(50);
  const [report, setReport] = useState(null);
  const [highlightedNewsId, setHighlightedNewsId] = useState(null);
  const { user } = useAuth();
  const location = useLocation();
  const newsRefs = useRef({});
  const targetNewsIdRef = useRef(null);

  async function loadNews() {
    const data = await apiGet('/api/news');
    let newsItems = Array.isArray(data) ? data : [];

    if (user) {
      try {
        const reports = await apiGet('/api/queries/my');
        const userReportStatus = new Map();
        reports.filter(r => r.relatedType === 'news').forEach(r => {
          userReportStatus.set(r.relatedId, r.status);
        });
        
        newsItems = newsItems.map(n => ({
          ...n,
          userReportStatus: userReportStatus.get(n._id) // 'open' or 'resolved' or undefined
        }));
      } catch (e) {
        console.error('Failed to fetch user reports', e);
      }
    }

    setItems(newsItems);

    // Check for highlight ID from navigation state or hash
    const highlightId = location.state?.highlightNewsId || 
                        (location.hash ? location.hash.replace('#news-', '') : null);
    
    if (highlightId) {
      targetNewsIdRef.current = highlightId;
      setHighlightedNewsId(highlightId);
      // Clear highlight after 4 seconds
      setTimeout(() => setHighlightedNewsId(null), 4000);
    }
  }

  useEffect(() => {
    AOS.init({ duration: 600, once: true, offset: 40 });
    loadNews().then(() => setTimeout(() => AOS.refresh(), 100)).catch(console.error);
  }, [user, location]);

  // Scroll to highlighted news when loaded
  useEffect(() => {
    if (highlightedNewsId && newsRefs.current[highlightedNewsId]) {
      setTimeout(() => {
        newsRefs.current[highlightedNewsId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  }, [highlightedNewsId, items]);

  async function fetchAndSave() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/refresh`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json', 
          ...(localStorage.getItem('authToken') ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` } : {}) 
        }, 
        body: JSON.stringify({ saveNews: true, recomputeMetrics: false, geminiSummarize: true }) 
      });
      if (!res.ok) throw new Error('Refresh failed');
      await loadNews();
    } finally {
      setLoading(false);
    }
  }

  const getSentimentBadge = (sentiment) => {
    if (!sentiment) return null;
    // Map sentiment to neutral colors/terms if possible, or keep it subtle
    const style = sentiment.toLowerCase().includes('positive') 
      ? 'bg-civic-teal/10 text-civic-teal border-civic-teal/20'
      : sentiment.toLowerCase().includes('negative')
      ? 'bg-red-50 text-red-600 border-red-100'
      : 'bg-civic-gray-100 text-civic-gray-600 border-civic-gray-200';
      
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${style}`}>
        {sentiment}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-civic-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-civic-blue dark:text-blue-400">Civic Updates & Analysis</h1>
          <p className="text-civic-gray-600 dark:text-gray-400 mt-2">Latest verified news and coverage regarding political promises and governance.</p>
        </div>
        
        {user && user.role === 'admin' && (
          <button 
            onClick={fetchAndSave} 
            disabled={loading} 
            className="flex items-center gap-2 bg-civic-blue text-white px-4 py-2 rounded-lg hover:bg-civic-blue/90 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Syncing Feed...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Update News Feed
              </>
            )}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl shadow-sm backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-civic-gray-50 dark:bg-white/10 mb-4">
            <svg className="w-8 h-8 text-civic-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
          </div>
          <h3 className="text-lg font-medium text-civic-gray-900 dark:text-white mb-1">No news records found</h3>
          <p className="text-civic-gray-500 dark:text-gray-400 max-w-sm mx-auto">The news feed is currently empty. Check back later for updates or trigger a refresh if you are an admin.</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.slice(0, visible).map((n) => (
              <article 
                key={n._id}
                ref={el => newsRefs.current[n._id] = el}
                className={`flex flex-col h-full bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden backdrop-blur-sm cursor-pointer group ${
                  highlightedNewsId === n._id 
                    ? 'ring-2 ring-civic-blue shadow-lg scale-[1.02] bg-blue-50/50 dark:bg-blue-900/10' 
                    : ''
                }`}
                data-aos={targetNewsIdRef.current === n._id ? null : "fade-up"}
                onClick={() => window.open(n.url, '_blank')}
              >
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-civic-gray-500 dark:text-gray-400 uppercase tracking-wide">{n.source || 'Source'}</span>
                    <span className="text-civic-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-civic-gray-500 dark:text-gray-400">{n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : '—'}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-civic-gray-900 dark:text-white mb-2 leading-tight line-clamp-3 group-hover:text-civic-blue dark:group-hover:text-blue-400 transition-colors">
                    {n.headline}
                  </h3>

                  {n.summary && <p className="text-sm text-civic-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-1">{n.summary}</p>}
                  
                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-civic-gray-100 dark:border-white/10">
                    {getSentimentBadge(n.sentiment)}
                    {n.relevanceScore && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-civic-gray-200 dark:border-white/10 bg-civic-gray-50 dark:bg-white/10 text-civic-gray-600 dark:text-gray-400" title="Relevance Score">
                        Rel: {n.relevanceScore}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="bg-civic-gray-50 dark:bg-white/5 px-5 py-3 border-t border-civic-gray-100 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-civic-blue dark:text-blue-400 group-hover:text-civic-blue/80 dark:group-hover:text-blue-300 flex items-center gap-1">
                    Read Full Article
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </span>
                  
                  {user && (
                    <button 
                      className={`text-xs transition-colors relative z-10 ${
                        n.userReportStatus 
                          ? 'cursor-default flex items-center gap-1 font-medium' 
                          : 'text-civic-gray-400 dark:text-gray-500 hover:text-red-600'
                      } ${
                        n.userReportStatus === 'resolved' 
                          ? 'text-civic-blue dark:text-blue-400' 
                          : n.userReportStatus 
                            ? 'text-civic-green dark:text-green-400'
                            : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!n.userReportStatus) {
                          setReport({ relatedType: 'news', relatedId: n._id, title: n.headline });
                        }
                      }}
                      disabled={!!n.userReportStatus}
                    >
                      {n.userReportStatus ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          {n.userReportStatus === 'resolved' ? 'Reported & Resolved' : 'Reported'}
                        </>
                      ) : (
                        'Report Issue'
                      )}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          
          {items.length > visible && (
            <div className="flex justify-center pt-8">
              <button 
                className="px-6 py-2.5 rounded-full bg-white dark:bg-white/10 border border-civic-gray-300 dark:border-white/20 text-civic-gray-700 dark:text-gray-200 hover:bg-civic-gray-50 dark:hover:bg-white/20 hover:border-civic-gray-400 transition-all font-medium text-sm shadow-sm" 
                onClick={() => setVisible(v => v + 50)}
              >
                Load More Updates
              </button>
            </div>
          )}
        </>
      )}
      
      {report && <ReportModal report={report} onClose={() => setReport(null)} />}
    </div>
  );
}
