import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsAdmin(!!user && user.role === 'admin');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, [user]);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron via-white to-green rounded-full flex items-center justify-center shadow-sm">
              <i className="fas fa-flag text-slate-200"></i>
            </div>
            <Link to="/" className="text-xl font-bold text-slate-100">Political Promise Tracker</Link>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex space-x-6">
              <NavLink to="/" className={({ isActive }) => `text-slate-200 hover:text-blue-300 transition-colors ${isActive ? 'text-blue-300 font-semibold' : ''}`}>Dashboard</NavLink>
              <NavLink to="/ministers" className={({ isActive }) => `text-slate-200 hover:text-blue-300 transition-colors ${isActive ? 'text-blue-300 font-semibold' : ''}`}>Ministers</NavLink>
              <NavLink to="/promises" className={({ isActive }) => `text-slate-200 hover:text-blue-300 transition-colors ${isActive ? 'text-blue-300 font-semibold' : ''}`}>Promises</NavLink>
              <NavLink to="/news" className={({ isActive }) => `text-slate-200 hover:text-blue-300 transition-colors ${isActive ? 'text-blue-300 font-semibold' : ''}`}>News</NavLink>
              <NavLink to="/privacy" className={({ isActive }) => `text-slate-200 hover:text-blue-300 transition-colors ${isActive ? 'text-blue-300 font-semibold' : ''}`}>Privacy</NavLink>
              {isAdmin && <NavLink to="/admin" className={({ isActive }) => `text-slate-200 hover:text-blue-300 transition-colors ${isActive ? 'text-blue-300 font-semibold' : ''}`}>Admin</NavLink>}
              {isAdmin && <NavLink to="/admin/queries" className={({ isActive }) => `text-slate-200 hover:text-blue-300 transition-colors ${isActive ? 'text-blue-300 font-semibold' : ''}`}>Queries</NavLink>}
              {user && <NavLink to="/my/queries" className={({ isActive }) => `text-slate-200 hover:text-blue-300 transition-colors ${isActive ? 'text-blue-300 font-semibold' : ''}`}>My Queries</NavLink>}
            </nav>
            <div className="flex items-center gap-3">
              {!user ? (
                <NavLink to="/auth" className={({ isActive }) => `text-slate-200 hover:text-blue-300 transition-colors ${isActive ? 'text-blue-300 font-semibold' : ''}`}>Login</NavLink>
              ) : (
                <button onClick={logout} className="text-slate-200 hover:text-blue-300 transition-colors">Logout</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}