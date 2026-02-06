import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api.js';
import { Link } from 'react-router-dom';

export default function MyQueries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [replyMessage, setReplyMessage] = useState({});
  const [sendingReply, setSendingReply] = useState({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiGet('/api/queries/my');
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setStatus(String(e.message || e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function promiseLink(q) {
    const mid = q?.meta?.ministerId;
    if (!mid) return null;
    return {
      pathname: `/ministers/${mid}`,
      hash: `#promise-${q.relatedId}`,
      state: { highlightPromiseId: q.relatedId }
    };
  }

  function newsLink(q) {
    if (q.relatedType !== 'news') return null;
    return {
      pathname: '/news',
      hash: `#news-${q.relatedId}`,
      state: { highlightNewsId: q.relatedId }
    };
  }

  const handleReply = async (queryId) => {
    if (!replyMessage[queryId]?.trim()) return;
    
    try {
      setSendingReply({ ...sendingReply, [queryId]: true });
      const res = await apiPost(`/api/queries/${queryId}/reply`, { message: replyMessage[queryId] });
      
      // Update local state with new message
      setItems(items.map(item => 
        item._id === queryId 
          ? { ...item, status: 'open', updates: [...(item.updates || []), res.update] } 
          : item
      ));
      
      setReplyMessage({ ...replyMessage, [queryId]: '' });
    } catch (e) {
      alert('Failed to send reply: ' + e.message);
    } finally {
      setSendingReply({ ...sendingReply, [queryId]: false });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-green/10 dark:bg-green-500/20 text-civic-green dark:text-green-400 border border-civic-green/20 dark:border-green-400/20">Resolved</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-amber/10 dark:bg-amber-500/20 text-civic-amber dark:text-amber-400 border border-civic-amber/20 dark:border-amber-400/20">Pending Review</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-civic-gray-100 dark:bg-white/10 text-civic-gray-600 dark:text-gray-300 border border-civic-gray-200 dark:border-white/10">{status}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pb-12">
      <div className="flex items-center justify-between border-b border-civic-gray-200 dark:border-white/10 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-civic-blue dark:text-blue-400">My Reports</h1>
          <p className="text-civic-gray-600 dark:text-gray-400 mt-2">Track the status of your submitted reports and queries.</p>
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
            <svg className="w-8 h-8 text-civic-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          </div>
          <h3 className="text-lg font-medium text-civic-gray-900 dark:text-white mb-1">No reports submitted</h3>
          <p className="text-civic-gray-500 dark:text-gray-400 max-w-sm mx-auto">You haven't reported any issues or asked any queries yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((q) => (
            <div key={q._id} className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-civic-gray-500 dark:text-gray-400 bg-civic-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">
                      {q.relatedType.charAt(0).toUpperCase() + q.relatedType.slice(1)}
                    </span>
                    <span className="text-civic-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-civic-gray-500 dark:text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-civic-gray-900 dark:text-white">
                    {q?.meta?.promiseTitle || q?.meta?.headline || q?.meta?.title || 'Untitled Report'}
                  </h3>
                </div>
                {getStatusBadge(q.status)}
              </div>
              
              <div className="bg-civic-gray-50 dark:bg-white/5 rounded-lg p-4 mb-4 border border-civic-gray-100 dark:border-white/10">
                <p className="text-civic-gray-700 dark:text-gray-300 text-sm leading-relaxed">{q.message}</p>
                
                {/* Previous updates/replies */}
                {q.updates && q.updates.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-civic-gray-200 dark:border-white/10 space-y-3">
                    {q.updates.map((update, idx) => (
                      <div key={idx} className={`text-sm p-3 rounded-lg ${update.sender === 'admin' ? 'bg-civic-blue/10 dark:bg-blue-900/20 ml-4' : 'bg-white dark:bg-white/5 mr-4'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-xs opacity-75">{update.sender === 'admin' ? 'Support Team' : 'You'}</span>
                          <span className="text-xs opacity-50">{new Date(update.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-civic-gray-700 dark:text-gray-300">{update.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {/* Re-open / Reply Section */}
                {q.status === 'resolved' && (
                  <div className="bg-civic-gray-50 dark:bg-white/5 p-4 rounded-lg border border-civic-gray-100 dark:border-white/10">
                    <h4 className="text-sm font-semibold text-civic-gray-700 dark:text-gray-300 mb-2">Not satisfied with the resolution?</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={replyMessage[q._id] || ''}
                        onChange={(e) => setReplyMessage({ ...replyMessage, [q._id]: e.target.value })}
                        placeholder="Add a new message to re-open this report..."
                        className="flex-1 px-3 py-2 text-sm border border-civic-gray-300 dark:border-white/20 rounded-md bg-white dark:bg-black/20 text-civic-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-civic-blue"
                      />
                      <button 
                        onClick={() => handleReply(q._id)}
                        disabled={sendingReply[q._id] || !replyMessage[q._id]}
                        className="px-4 py-2 bg-civic-blue text-white text-sm font-medium rounded-md hover:bg-civic-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingReply[q._id] ? 'Sending...' : 'Re-open'}
                      </button>
                    </div>
                  </div>
                )}

                {promiseLink(q) && (
                  <div className="flex justify-end">
                    <Link 
                      to={promiseLink(q).pathname}
                      state={promiseLink(q).state}
                      className="text-sm font-medium text-civic-blue dark:text-blue-400 hover:text-civic-blue/80 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      View Related Minister
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                )}

                {newsLink(q) && (
                  <div className="flex justify-end">
                    <Link 
                      to={newsLink(q).pathname}
                      state={newsLink(q).state}
                      className="text-sm font-medium text-civic-blue dark:text-blue-400 hover:text-civic-blue/80 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      View Reported News
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
