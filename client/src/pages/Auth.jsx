import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function doLogin(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.token, data.user);
      setStatus(`Logged in as ${data.user?.email}`);
      navigate(data.user?.role === 'admin' ? '/admin' : '/');
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function doSignup(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      login(data.token, data.user);
      setStatus(`Signed up as ${data.user?.email}`);
      navigate('/');
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-civic-blue dark:text-blue-400">
            {mode === 'login' ? 'Access Portal' : 'Citizen Registration'}
          </h2>
          <p className="mt-2 text-sm text-civic-gray-600 dark:text-gray-400">
            {mode === 'login' ? 'Sign in to access your dashboard and reports.' : 'Join the platform to track promises and submit reports.'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-white/5 border border-civic-gray-200 dark:border-white/10 rounded-xl shadow-sm p-8 backdrop-blur-sm">
          <div className="flex border-b border-civic-gray-200 dark:border-white/10 mb-6">
            <button 
              onClick={() => setMode('login')} 
              className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${mode === 'login' ? 'border-civic-blue dark:border-blue-400 text-civic-blue dark:text-blue-400' : 'border-transparent text-civic-gray-500 dark:text-gray-400 hover:text-civic-gray-700 dark:hover:text-gray-200'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setMode('signup')} 
              className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 ${mode === 'signup' ? 'border-civic-blue dark:border-blue-400 text-civic-blue dark:text-blue-400' : 'border-transparent text-civic-gray-500 dark:text-gray-400 hover:text-civic-gray-700 dark:hover:text-gray-200'}`}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-6" onSubmit={mode === 'login' ? doLogin : doSignup}>
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-civic-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-civic-gray-300 dark:border-white/20 placeholder-civic-gray-400 text-civic-gray-900 rounded-md focus:outline-none focus:ring-civic-blue focus:border-civic-blue sm:text-sm bg-white dark:bg-black/40 dark:text-white"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-civic-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-civic-gray-300 dark:border-white/20 placeholder-civic-gray-400 text-civic-gray-900 rounded-md focus:outline-none focus:ring-civic-blue focus:border-civic-blue sm:text-sm bg-white dark:bg-black/40 dark:text-white"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-civic-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-civic-gray-300 dark:border-white/20 placeholder-civic-gray-400 text-civic-gray-900 rounded-md focus:outline-none focus:ring-civic-blue focus:border-civic-blue sm:text-sm bg-white dark:bg-black/40 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {status && (
              <div className={`text-sm p-3 rounded-md ${status.includes('failed') || status.includes('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                {status}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-civic-blue hover:bg-civic-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-civic-blue disabled:opacity-70 transition-colors"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : null}
              {mode === 'login' ? 'Sign in' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
