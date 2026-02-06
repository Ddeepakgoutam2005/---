import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-200 bg-civic-gray-100 text-civic-gray-600 hover:text-civic-blue dark:bg-white/10 dark:text-gray-300 dark:hover:text-white"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
    </button>
  );
}
