'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });
  }, []);

  if (!user) {
    return <div className="text-center py-10 text-slate-500">প্রোফাইল দেখতে দয়া করে লগইন করুন।</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
        <img 
          src={user.user_metadata?.avatar_url || 'https://via.placeholder.com/150'} 
          alt="Profile" 
          className="w-24 h-24 rounded-full mx-auto border-4 border-indigo-500 shadow-md mb-4"
        />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user.user_metadata?.full_name || 'ব্যবহারকারী'}</h2>
        <p className="text-sm text-slate-400 mb-6">{user.email}</p>
        
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-left space-y-2 text-sm text-slate-500">
          <div>• অ্যাকাউন্টের ধরণ: <span className="font-semibold text-slate-700 dark:text-slate-300">General User</span></div>
          <div>• লগইন মেথড: <span className="font-semibold text-slate-700 dark:text-slate-300">Google OAuth</span></div>
        </div>

        <button 
          onClick={() => { supabase.auth.signOut(); window.location.href = '/'; }}
          className="mt-6 w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          লগআউট করুন
        </button>
      </div>
    </div>
  );
}
