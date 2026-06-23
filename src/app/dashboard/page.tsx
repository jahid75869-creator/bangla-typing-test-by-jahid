// src/app/dashboard/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardView() {
  const [stats, setStats] = useState({ totalTests: 0, avgWpm: 0, bestWpm: 0, avgAcc: 0 });

  useEffect(() => {
    async function loadStats() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data } = await supabase.from('typing_results').select('*').eq('user_id', session.user.id);
      if (data && data.length > 0) {
        const total = data.length;
        const highestWpm = Math.max(...data.map(item => item.gross_wpm));
        const avgWpm = Math.round(data.reduce((acc, item) => acc + item.gross_wpm, 0) / total);
        const avgAcc = (data.reduce((acc, item) => acc + Number(item.accuracy), 0) / total).toFixed(2);
        setStats({ totalTests: total, avgWpm, bestWpm: highestWpm, avgAcc: Number(avgAcc) });
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6">User Progress Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm text-center">
          <div className="text-3xl font-black text-indigo-600">{stats.totalTests}</div>
          <div className="text-xs font-semibold text-slate-400 uppercase mt-1">Total Tests</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm text-center">
          <div className="text-3xl font-black text-emerald-600">{stats.avgWpm}</div>
          <div className="text-xs font-semibold text-slate-400 uppercase mt-1">Average WPM</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm text-center">
          <div className="text-3xl font-black text-purple-600">{stats.bestWpm}</div>
          <div className="text-xs font-semibold text-slate-400 uppercase mt-1">Best Speed</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm text-center">
          <div className="text-3xl font-black text-amber-500">{stats.avgAcc}%</div>
          <div className="text-xs font-semibold text-slate-400 uppercase mt-1">Avg Accuracy</div>
        </div>
      </div>
    </div>
  );
}
