'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'admin-theme';

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') setTheme(saved);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  if (!mounted) return null;

  return (
    <div data-admin-theme={theme} className="min-h-screen bg-[var(--adm-bg)] text-[var(--adm-text)]">
      {children}

      {/* Theme toggle – fixed bottom-right */}
      <button
        onClick={toggle}
        title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
          border border-[var(--adm-border-input)] text-[var(--adm-text-40)]
          hover:bg-[var(--adm-surface-lg)] hover:text-[var(--adm-text)] transition-all"
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        {theme === 'dark' ? 'Clair' : 'Sombre'}
      </button>
    </div>
  );
}
