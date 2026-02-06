import { useEffect, useState } from 'react';
import { API_URL } from '../lib/api.js';

export default function AdminQueries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  async function load() {
    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('authToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/queries`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data.items || []);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load().catch(() => {}); }, []);

  async function markResolved(id) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('authToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/queries/${id}/status`, { method: 'PUT', headers, body: JSON.stringify({ status: 'resolved' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      await load();
    } catch (e) {
      setStatus(String(e.message || e));
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-green/10 dark:bg-green-500/20 text-civic-green dark:text-green-400 border border-civic-green/20 dark:border-green-400/20">Resolved</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-amber/10 dark:bg-amber-500/20 text-civic-amber dark:text-amber-400 border border-civic-amber/20 dark:border-amber-400/20">Pending Action</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-gray-100 dark:bg-white/10 text-civic-gray-600 dark:text-gray-300 border border-civic-gray-200 dark:border-white/10">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-12">
      <div className="flex items-center justify-between border-b border-civic-gray-200 dark:border-white/10 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-civic-blue dark:text-blue-400">Citizen Queries & Reports</h1>
          <p className="text-civic-gray-600 dark:text-gray-400 mt-2">Manage and respond to user-submitted issues.</p>
        </div>
      </div>

      {status && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
          {status}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-civic-blue dark:border-blue-400"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl shadow-sm backdrop-blur-sm">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-civic-gray-50 dark:bg-white/10 mb-4">
            <svg className="w-8 h-8 text-civic-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-lg font-medium text-civic-gray-900 dark:text-white mb-1">All Caught Up</h3>
          <p className="text-civic-gray-500 dark:text-gray-400 max-w-sm mx-auto">There are no pending queries or reports to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((q) => (
            <div key={q._id} className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-civic-gray-500 dark:text-gray-400 bg-civic-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">
                      {q.relatedType}
                    </span>
                    <span className="text-civic-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-civic-gray-500 dark:text-gray-400">{new Date(q.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-civic-gray-900 dark:text-white flex items-center gap-2">
                    {q.meta?.headline || q.meta?.title || 'Untitled Issue'}
                  </h3>
                  <div className="text-sm text-civic-gray-500 dark:text-gray-400 mt-1">
                    Submitted by: <span className="font-medium text-civic-gray-700 dark:text-gray-300">{q.user?.name}</span> ({q.user?.email})
                  </div>
                </div>
                {getStatusBadge(q.status)}
              </div>
              
              <div className="bg-civic-gray-50 dark:bg-white/5 rounded-lg p-4 mb-4 border border-civic-gray-100 dark:border-white/10">
                <p className="text-civic-gray-700 dark:text-gray-300 text-sm leading-relaxed">{q.message}</p>
              </div>
              
              {q.status !== 'resolved' && (
                <div className="flex justify-end pt-4 border-t border-civic-gray-100 dark:border-white/10">
                  <button 
                    onClick={() => markResolved(q._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-civic-green dark:bg-green-600 text-white rounded-lg hover:bg-civic-green/90 dark:hover:bg-green-500 transition-colors text-sm font-medium shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
