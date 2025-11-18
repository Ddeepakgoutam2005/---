import { createContext, useEffect, useState } from 'react';
import { apiGet, setToken as setApiToken } from '../lib/api.js';

const AuthContext = createContext({ user: null, token: '', login: () => {}, logout: () => {} });

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('authToken') || '';
    if (t) {
      setApiToken(t);
      setToken(t);
      apiGet('/api/auth/me').then((u) => setUser(u)).catch(() => {
        localStorage.removeItem('authToken');
        setApiToken('');
        setToken('');
        setUser(null);
      });
    }
  }, []);

  function login(newToken, newUser) {
    localStorage.setItem('authToken', newToken);
    setApiToken(newToken);
    setToken(newToken);
    setUser(newUser || null);
  }

  function logout() {
    localStorage.removeItem('authToken');
    setApiToken('');
    setToken('');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export { AuthContext };