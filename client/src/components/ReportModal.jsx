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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded shadow p-4 w-full max-w-lg">
        <div className="font-semibold mb-2 text-black dark:text-slate-100">Report</div>
        <div className="text-sm text-black dark:text-slate-300 mb-2">{report.title}</div>
        {user && (
          <div className="text-xs mb-2 text-black dark:text-slate-300">Reporting as: {user.name} ({user.email})</div>
        )}
        <textarea className="w-full border rounded p-2" rows={4} placeholder="Describe your concern" value={message} onChange={e => setMessage(e.target.value)} />
        <div className="mt-3 flex gap-2">
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={submit} disabled={loading || !message.trim() }>{loading ? '...' : 'Submit'}</button>
          <button className="px-4 py-2 rounded bg-slate-600 text-white" onClick={onClose}>Cancel</button>
        </div>
        {status && <div className="text-sm mt-2 text-slate-700 dark:text-slate-300">{status}</div>}
      </div>
    </div>
  );
}