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

  async function doLogin() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      login(data.token, data.user);
      setStatus(`Logged in as ${data.user?.email}`);
      navigate(data.user?.role === 'admin' ? '/admin' : '/promises');
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function doSignup() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      login(data.token, data.user);
      setStatus(`Signed up as ${data.user?.email}`);
      navigate('/promises');
    } catch (e) {
      setStatus(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black dark:text-slate-100">Account</h2>
      <div className="bg-white dark:bg-slate-800/70 rounded-lg shadow p-4 space-y-4">
        <div className="flex gap-2">
          <button onClick={() => setMode('login')} className={`px-4 py-2 rounded ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>Login</button>
          <button onClick={() => setMode('signup')} className={`px-4 py-2 rounded ${mode === 'signup' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-200'}`}>Sign up</button>
        </div>
        {mode === 'signup' ? (
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <input className="border rounded px-3 py-2 w-full" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" className="border rounded px-3 py-2 w-full" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={doSignup} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Create account'}</button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <input className="border rounded px-3 py-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" className="border rounded px-3 py-2 w-full" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={doLogin} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Login'}</button>
          </div>
        )}
        {status && <div className="text-sm text-slate-700 dark:text-slate-300">{status}</div>}
      </div>
    </div>
  );
}