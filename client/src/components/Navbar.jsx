import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getToken } from '../lib/api.js';

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const hasToken = !!getToken();
    setIsAdmin(hasToken);
    // Force dark mode
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

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
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}