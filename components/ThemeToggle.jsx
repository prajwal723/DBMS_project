'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateState = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateState();
    window.addEventListener('1tapfix_theme_changed', updateState);
    window.addEventListener('fixmate_theme_changed', updateState);
    return () => {
      window.removeEventListener('1tapfix_theme_changed', updateState);
      window.removeEventListener('fixmate_theme_changed', updateState);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains('dark');
    if (nextDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('1tapfix_theme', 'dark');
        localStorage.setItem('fixmate_theme', 'dark');
      } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('1tapfix_theme', 'light');
        localStorage.setItem('fixmate_theme', 'light');
      } catch (e) {}
    }
    setIsDark(nextDark);
    window.dispatchEvent(new Event('1tapfix_theme_changed'));
    window.dispatchEvent(new Event('fixmate_theme_changed'));
  };

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center p-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-amber-400 shadow-sm'
          : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}

