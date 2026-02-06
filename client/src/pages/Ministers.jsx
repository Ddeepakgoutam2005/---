import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../lib/api.js';
import { Link } from 'react-router-dom';

export default function Ministers() {
  const [ministers, setMinisters] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    ministry: '',
    party: '',
    sort: 'name'
  });

  useEffect(() => {
    apiGet('/api/ministers').then(setMinisters).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    let list = ministers.filter((m) => m.name.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.ministry) list = list.filter(m => (m.ministry || '').toLowerCase().includes(filters.ministry.toLowerCase()));
    if (filters.party) list = list.filter(m => (m.party || '').toLowerCase().includes(filters.party.toLowerCase()));
    
    if (filters.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [ministers, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const ministries = [...new Set(ministers.map(m => m.ministry).filter(Boolean))];
  const parties = [...new Set(ministers.map(m => m.party).filter(Boolean))];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-civic-blue dark:text-blue-400 mb-2">Ministers Directory</h1>
        <p className="text-civic-gray-600 dark:text-gray-400">Profiles and performance records of serving ministers.</p>
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-24 z-30 bg-white/80 dark:bg-black/60 backdrop-blur-md border border-civic-gray-200 dark:border-white/10 rounded-xl shadow-sm p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black/40 border border-civic-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue dark:text-gray-200 transition-colors"
              placeholder="Search ministers..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <svg className="w-4 h-4 text-civic-gray-400 dark:text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            className="w-full px-4 py-2 bg-white dark:bg-black/40 border border-civic-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue dark:text-gray-200"
            value={filters.ministry}
            onChange={(e) => handleFilterChange('ministry', e.target.value)}
          >
            <option value="">All Ministries</option>
            {ministries.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            className="w-full px-4 py-2 bg-white dark:bg-black/40 border border-civic-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue dark:text-gray-200"
            value={filters.party}
            onChange={(e) => handleFilterChange('party', e.target.value)}
          >
            <option value="">All Parties</option>
            {parties.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            className="w-full px-4 py-2 bg-white dark:bg-black/40 border border-civic-gray-300 dark:border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue dark:text-gray-200"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-civic-gray-500 dark:text-gray-400">No ministers found matching your criteria.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <Link key={m._id} to={`/ministers/${m._id}`} className="block group">
              <div className="bg-white dark:bg-white/5 rounded-xl border border-civic-gray-200 dark:border-white/10 p-6 hover:shadow-md transition-all duration-200 flex items-start gap-4 h-full backdrop-blur-sm">
                <img
                  src={m.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`}
                  alt={m.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-civic-gray-100 dark:border-white/10 group-hover:border-civic-blue transition-colors"
                  onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-civic-gray-900 dark:text-white group-hover:text-civic-blue dark:group-hover:text-blue-400 transition-colors truncate">{m.name}</h3>
                  <p className="text-sm text-civic-gray-600 dark:text-gray-400 mb-1">{m.ministry || 'Minister'}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {m.party && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-civic-gray-100 dark:bg-white/10 text-civic-gray-600 dark:text-gray-300 border border-civic-gray-200 dark:border-white/10">
                        {m.party}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
