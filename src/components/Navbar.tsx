// src/components/Navbar.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between relative">
        <Link href="/" className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Bangla Typing Test by Jahid
        </Link>
        
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm">
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          
          {/* 3-Dot Dropdown Trigger Menu */}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-xl font-bold tracking-widest focus:outline-none">
            •••
          </button>
        </div>

        {isOpen && (
          <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 rounded-2xl w-48 py-2 z-50">
            <Link href="/" className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">Home</Link>
            <Link href="/dashboard" className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">Dashboard</Link>
            <Link href="/results" className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">Result Summary</Link>
            <Link href="/account" className="block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">Account</Link>
            <Link href="/admin" className="block px-4 py-2 text-rose-500 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 text-sm">Admin Control</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
