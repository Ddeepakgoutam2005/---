import { useEffect, useState, useMemo } from 'react';
import { apiGet } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import ReportModal from '../components/ReportModal.jsx';

export default function Promises() {
  const [promises, setPromises] = useState([]);
  const [ministers, setMinisters] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    ministerId: '',
    search: '',
  });
  
  const [report, setReport] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      apiGet('/api/promises'),
      apiGet('/api/ministers')
    ]).then(([pData, mData]) => {
      setPromises(pData || []);
      setMinisters(mData || []);
    }).catch(console.error);
  }, []);

  const filteredPromises = useMemo(() => {
    return promises.filter(p => {
      if (filters.status && p.status !== filters.status) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.ministerId && (p.minister?._id !== filters.ministerId && p.minister !== filters.ministerId)) return false;
      if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [promises, filters]);

  const categories = [...new Set(promises.map(p => p.category).filter(Boolean))];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', category: '', ministerId: '', search: '' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-civic-green/10 text-civic-green border-civic-green/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/20';
      case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/20';
      case 'broken': return 'bg-civic-red/10 text-civic-red border-civic-red/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-civic-blue dark:text-blue-400 mb-2">Promise Registry</h1>
        <p className="text-civic-gray-600 dark:text-gray-400">Track and verify official commitments made by public representatives.</p>
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-24 z-40 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-civic-gray-200 dark:border-white/10 rounded-xl shadow-sm p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search promises..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black/40 border border-civic-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue dark:text-gray-200 transition-colors"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <svg className="w-4 h-4 text-civic-gray-400 dark:text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Filter */}
          <select
            className="w-full px-4 py-2 bg-white dark:bg-black/40 border border-civic-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue dark:text-gray-200"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="broken">Broken</option>
          </select>

          {/* Category Filter */}
          <select
            className="w-full px-4 py-2 bg-white dark:bg-black/40 border border-civic-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue dark:text-gray-200"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Minister Filter */}
          <select
            className="w-full px-4 py-2 bg-white dark:bg-black/40 border border-civic-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue dark:text-gray-200"
            value={filters.ministerId}
            onChange={(e) => handleFilterChange('ministerId', e.target.value)}
          >
            <option value="">All Ministers</option>
            {ministers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      {filteredPromises.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-xl border border-civic-gray-200 dark:border-white/10 border-dashed">
          <p className="text-civic-gray-500 dark:text-gray-400">No promises match your filters.</p>
          <button 
            onClick={clearFilters}
            className="mt-4 text-civic-blue font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPromises.map((p) => (
            <div 
              key={p._id} 
              className="group bg-white dark:bg-white/5 rounded-xl border border-civic-gray-200 dark:border-white/10 p-6 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-6 items-start backdrop-blur-sm"
            >
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide ${getStatusColor(p.status)}`}>
                    {p.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-gray-100 dark:bg-white/10 text-civic-gray-600 dark:text-gray-300 border border-civic-gray-200 dark:border-white/10">
                    {p.category || 'General'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-civic-gray-900 dark:text-white mb-2 group-hover:text-civic-blue dark:group-hover:text-blue-400 transition-colors">
                  {p.title}
                </h3>
                
                {p.description && (
                  <p className="text-civic-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {p.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-civic-gray-500 dark:text-gray-400">
                  {p.minister && (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-civic-gray-200 dark:bg-white/20 flex items-center justify-center text-xs font-bold text-civic-gray-600 dark:text-gray-300">
                        {p.minister.name?.[0]}
                      </div>
                      <span>{p.minister.name}</span>
                    </div>
                  )}
                  {p.sourceUrl && (
                    <a 
                      href={p.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-civic-blue dark:hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Source
                    </a>
                  )}
                </div>
              </div>

              {user && (
                <button 
                  onClick={() => setReport({ relatedType: 'promise', relatedId: p._id, title: p.title })}
                  className="px-4 py-2 text-sm font-medium text-civic-gray-500 dark:text-gray-400 hover:text-civic-red border border-transparent hover:border-civic-red/20 rounded-lg transition-colors whitespace-nowrap"
                >
                  Report Issue
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {report && <ReportModal report={report} onClose={() => setReport(null)} />}
    </div>
  );
}
