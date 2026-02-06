import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsAdmin(!!user && user.role === 'admin');
  }, [user]);

  const navLinkClass = ({ isActive }) => 
    `text-sm font-medium transition-colors duration-200 hover:underline hover:underline-offset-4 ${isActive ? 'text-civic-blue font-bold dark:text-white underline underline-offset-4' : 'text-civic-gray-600 hover:text-civic-blue dark:text-gray-300 dark:hover:text-white'}`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-2 text-base font-medium transition-colors duration-200 rounded-md ${isActive ? 'bg-civic-blue/10 text-civic-blue font-bold dark:text-white dark:bg-white/10' : 'text-civic-gray-600 hover:bg-civic-gray-50 hover:text-civic-blue dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'}`;

  return (
    <header className="sticky top-4 z-50 mx-4 mt-4">
      <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md border border-civic-gray-200 dark:border-white/20 rounded-2xl shadow-sm px-6 py-3 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-civic-blue dark:bg-civic-red rounded-lg flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
            <Link to="/" className="text-lg font-bold text-civic-blue dark:text-white tracking-tight">Promise Tracker</Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex space-x-6">
              <NavLink to="/" className={navLinkClass}>Dashboard</NavLink>
              <NavLink to="/ministers" className={navLinkClass}>Ministers</NavLink>
              <NavLink to="/promises" className={navLinkClass}>Promises</NavLink>
              <NavLink to="/news" className={navLinkClass}>News</NavLink>
              <NavLink to="/privacy" className={navLinkClass}>Privacy</NavLink>
              {isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>}
              {isAdmin && <NavLink to="/admin/queries" className={navLinkClass}>Queries</NavLink>}
              {user && <NavLink to="/my/queries" className={navLinkClass}>My Queries</NavLink>}
            </nav>
            
            <div className="pl-6 border-l border-civic-gray-200 dark:border-white/10 flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              {!user ? (
                <NavLink to="/auth" className="text-sm font-medium text-civic-blue dark:text-white hover:text-civic-blue-light hover:underline hover:underline-offset-4 transition-colors">Login</NavLink>
              ) : (
                <button onClick={logout} className="text-sm font-medium text-civic-gray-500 dark:text-gray-300 hover:text-civic-red hover:underline hover:underline-offset-4 transition-colors">Logout</button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-civic-gray-600 dark:text-gray-300 hover:text-civic-blue dark:hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-civic-gray-200 dark:border-white/10 pt-4 animate-fadeIn">
            <nav className="flex flex-col space-y-2">
              <NavLink to="/" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to="/ministers" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Ministers</NavLink>
              <NavLink to="/promises" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Promises</NavLink>
              <NavLink to="/news" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>News</NavLink>
              <NavLink to="/privacy" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Privacy</NavLink>
              {isAdmin && <NavLink to="/admin" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Admin</NavLink>}
              {isAdmin && <NavLink to="/admin/queries" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Queries</NavLink>}
              {user && <NavLink to="/my/queries" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>My Queries</NavLink>}
              
              <div className="pt-4 mt-2 border-t border-civic-gray-200 dark:border-white/10 flex items-center justify-between px-4">
                {!user ? (
                  <NavLink 
                    to="/auth" 
                    className="text-base font-medium text-civic-gray-600 hover:text-civic-blue dark:text-gray-300 dark:hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </NavLink>
                ) : (
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }} 
                    className="text-base font-medium text-civic-gray-600 hover:text-civic-red dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                )}
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
