import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { API_URL } from '../lib/api.js';

export default function ReportModal({ report, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const { user } = useAuth();

  async function submit() {
    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('authToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/queries`, { method: 'POST', headers, body: JSON.stringify({ relatedType: report.relatedType, relatedId: report.relatedId, message }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setStatus('Submitted');
      onClose();
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-civic-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-xl border border-civic-gray-200 dark:border-white/20 p-6 w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-civic-blue dark:text-civic-blue-light">Submit Report</h3>
            <p className="text-sm text-civic-gray-500 dark:text-gray-400 mt-1">Help us maintain data accuracy.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-civic-gray-400 hover:text-civic-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="bg-civic-gray-50 dark:bg-white/5 rounded-lg p-3 mb-4 border border-civic-gray-100 dark:border-white/10">
          <div className="text-xs font-semibold text-civic-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Related To</div>
          <div className="text-sm font-medium text-civic-gray-800 dark:text-white line-clamp-2">{report.title}</div>
        </div>

        {user && (
          <div className="flex items-center gap-2 mb-4 text-xs text-civic-gray-500 dark:text-gray-400">
            <div className="w-5 h-5 rounded-full bg-civic-blue/10 dark:bg-blue-500/20 flex items-center justify-center text-civic-blue dark:text-blue-400 font-bold">
              {user.name?.[0]}
            </div>
            <span>Reporting as <span className="font-medium text-civic-gray-700 dark:text-gray-300">{user.name}</span></span>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-civic-gray-700 dark:text-gray-300 mb-2">Description of Issue</label>
          <textarea 
            className="w-full border border-civic-gray-300 dark:border-white/20 rounded-lg p-3 text-civic-gray-800 dark:text-white bg-white dark:bg-black/50 placeholder-civic-gray-400 focus:outline-none focus:ring-2 focus:ring-civic-blue/20 focus:border-civic-blue transition-colors min-h-[120px]" 
            placeholder="Please provide details about the inaccuracy or issue..." 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button 
            className="px-4 py-2 rounded-lg text-civic-gray-600 dark:text-gray-400 hover:bg-civic-gray-100 dark:hover:bg-white/10 transition-colors font-medium text-sm" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 rounded-lg bg-civic-blue text-white hover:bg-civic-blue/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
            onClick={submit} 
            disabled={loading || !message.trim()}
          >
            {loading && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            Submit Report
          </button>
        </div>
        
        {status && (
          <div className={`mt-4 text-sm p-2 rounded ${status.includes('failed') ? 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400'}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}