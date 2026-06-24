'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResultsHistory() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('typing_results')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if (data) setResults(data);
      }
      setLoading(false);
    }
    fetchHistory();
  }, []);

  if (loading) return <div className="text-center py-10">লোড হচ্ছে...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">টাইপিং পরীক্ষার ইতিহাস</h1>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 tracking-wider">
                <th className="p-4">তারিখ</th>
                <th className="p-4">গতি (WPM)</th>
                <th className="p-4">সঠিকতা</th>
                <th className="p-4">ভুল শব্দ</th>
                <th className="p-4">স্টেটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">এখনো কোনো পরীক্ষা দেওয়া হয়নি।</td>
                </tr>
              ) : (
                results.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4">{new Date(item.created_at).toLocaleDateString('bn-BD')}</td>
                    <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">{item.gross_wpm}</td>
                    <td className="p-4">{item.accuracy}%</td>
                    <td className="p-4 text-rose-500">{item.wrong_words}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.is_completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
                        {item.is_completed ? 'সম্পন্ন' : 'আগে শেষকৃত'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
              }
