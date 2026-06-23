// src/app/admin/page.tsx
'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('literature');
  const [author, setAuthor] = useState('');

  const handleInsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    const { error } = await supabase.from('paragraphs').insert({
      text, category, author: author || 'Unknown'
    });

    if (!error) {
      alert('নতুন অনুচ্ছেদটি সফলভাবে লাইব্রেরিতে যুক্ত হয়েছে!');
      setText('');
      setAuthor('');
    } else {
      alert('ত্রুটি: ' + error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">নতুন অনুচ্ছেদ যুক্ত করুন (Admin Portal)</h1>
        <form onSubmit={handleInsert} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-500">অনুচ্ছেদ (Bangla Content)</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full border dark:border-slate-800 bg-transparent rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="এখানে বাংলা প্যারাগ্রাফ লিখুন..." required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-500">ক্যাটাগরি</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border dark:border-slate-800 bg-transparent rounded-xl p-2.5 text-sm">
              <option value="literature">সাহিত্য (Literature)</option>
              <option value="news">সংবাদ (News)</option>
              <option value="blog">ব্লগ (Blog)</option>
              <option value="essay">প্রবন্ধ (Essay)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-500">লেখক / সোর্স</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full border dark:border-slate-800 bg-transparent rounded-xl p-2.5 text-sm" placeholder="লেখকের নাম লিখুন" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md">প্যারাগ্রাফ যুক্ত করুন</button>
        </form>
      </div>
    </div>
  );
}
