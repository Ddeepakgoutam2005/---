import { useState } from 'react';
import { apiPost, API_URL } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login, user } = useAuth();

  async function loginAdmin(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.token, data.user);
      setStatus(`Logged in as ${data.user?.email} (${data.user?.role})`);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function fetchNews() {
    try {
      setLoading(true);
      const result = await apiPost('/api/admin/fetch-news', { limitPerFeed: 10 });
      setStatus(`Fetched ${result.savedCount} new articles (Total checked: ${result.totalFetched}).`);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function runGeminiClassifier() {
    try {
      setLoading(true);
      const result = await apiPost('/api/admin/classify-news', { limit: 50 });
      setStatus(`Gemini processed ${result.processedCount || 0} items.`);
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-civic-blue dark:text-blue-400">Admin Access</h2>
            <p className="mt-2 text-sm text-civic-gray-600 dark:text-gray-400">Restricted area for system administrators.</p>
          </div>
          
          <div className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl shadow-sm p-8 backdrop-blur-sm">
            <form className="space-y-6" onSubmit={loginAdmin}>
              <div>
                <label className="block text-sm font-medium text-civic-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  className="appearance-none block w-full px-3 py-2 border border-civic-gray-300 dark:border-white/20 rounded-md shadow-sm placeholder-civic-gray-400 focus:outline-none focus:ring-civic-blue focus:border-civic-blue sm:text-sm bg-white dark:bg-black/40 dark:text-white"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-civic-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input 
                  type="password" 
                  className="appearance-none block w-full px-3 py-2 border border-civic-gray-300 dark:border-white/20 rounded-md shadow-sm placeholder-civic-gray-400 focus:outline-none focus:ring-civic-blue focus:border-civic-blue sm:text-sm bg-white dark:bg-black/40 dark:text-white"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
              
              {status && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">{status}</div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-civic-blue hover:bg-civic-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-civic-blue disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-12">
      <div className="flex items-center justify-between border-b border-civic-gray-200 dark:border-white/10 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-civic-blue dark:text-blue-400">System Administration</h1>
          <p className="text-civic-gray-600 dark:text-gray-400 mt-2">Manage data pipelines and system status.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/admin/queries')}
            className="px-4 py-2 bg-white dark:bg-white/10 border border-civic-gray-300 dark:border-white/20 rounded-lg text-civic-gray-700 dark:text-gray-200 hover:bg-civic-gray-50 dark:hover:bg-white/20 text-sm font-medium transition-colors"
          >
            Manage Queries
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl shadow-sm p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-civic-gray-900 dark:text-white mb-4">Data Ingestion</h3>
          <p className="text-sm text-civic-gray-500 dark:text-gray-400 mb-6">Trigger manual updates for news feeds and data processing pipelines.</p>
          
          <div className="space-y-4">
            <button 
              onClick={fetchNews} 
              disabled={loading} 
              className="w-full flex items-center justify-between px-4 py-3 bg-civic-gray-50 dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-lg hover:bg-civic-gray-100 dark:hover:bg-white/10 transition-colors text-left"
            >
              <div>
                <span className="block font-medium text-civic-gray-900 dark:text-white">Fetch News Feeds</span>
                <span className="block text-xs text-civic-gray-500 dark:text-gray-400">Crawls RSS feeds for new articles</span>
              </div>
              <svg className="w-5 h-5 text-civic-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </button>

            <button 
              onClick={runGeminiClassifier} 
              disabled={loading} 
              className="w-full flex items-center justify-between px-4 py-3 bg-civic-blue/5 dark:bg-blue-500/10 border border-civic-blue/10 dark:border-blue-400/20 rounded-lg hover:bg-civic-blue/10 dark:hover:bg-blue-500/20 transition-colors text-left"
            >
              <div>
                <span className="block font-medium text-civic-blue dark:text-blue-400">Run AI Classification</span>
                <span className="block text-xs text-civic-blue/60 dark:text-blue-400/60">Extracts promises & criticism using Gemini</span>
              </div>
              <svg className="w-5 h-5 text-civic-blue dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl shadow-sm p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-civic-gray-900 dark:text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-civic-gray-100 dark:border-white/10">
              <span className="text-sm text-civic-gray-600 dark:text-gray-400">Admin User</span>
              <span className="text-sm font-medium text-civic-gray-900 dark:text-white">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-civic-gray-100 dark:border-white/10">
              <span className="text-sm text-civic-gray-600 dark:text-gray-400">Role</span>
              <span className="text-xs font-semibold px-2 py-1 bg-civic-blue/10 dark:bg-blue-500/20 text-civic-blue dark:text-blue-400 rounded-full uppercase">{user.role}</span>
            </div>
            
            {status && (
              <div className="mt-4 p-3 bg-civic-gray-50 dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded text-sm text-civic-gray-700 dark:text-gray-300">
                <span className="font-medium block mb-1">Last Action Output:</span>
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
