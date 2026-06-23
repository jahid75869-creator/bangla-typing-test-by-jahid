// src/app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { processUnijoyInput, finalizeBanglaWordTokens } from '@/engine/unijoyEngine';
import { supabase } from '@/lib/supabase';

export default function TypingHomePage() {
  // Session States
  const [user, setUser] = useState<any>(null);
  const [paragraphsPool, setParagraphsPool] = useState<any[]>([]);
  const [sourceText, setSourceText] = useState('আমাদের সোনার বাংলা আমি তোমায় ভালোবাসি।');
  const [sourceWords, setSourceWords] = useState<string[]>([]);
  
  // Input Handling
  const [rawInput, setRawInput] = useState('');
  const [typedWords, setTypedWords] = useState<string[]>([]);
  
  // Timer Configurations
  const [selectedDuration, setSelectedDuration] = useState(300); // 5 mins in secs default
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  
  // Metrics Summary
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [mistakes, setMistakes] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    fetchParagraphs();
  }, []);

  const fetchParagraphs = async () => {
    const { data } = await supabase.from('paragraphs').select('*').eq('is_active', true);
    if (data && data.length > 0) {
      setParagraphsPool(data);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  // Triggers when user clicks "Start Typing"
  const startTypingSession = () => {
    if (paragraphsPool.length > 0) {
      const randIndex = Math.floor(Math.random() * paragraphsPool.length);
      const text = paragraphsPool[randIndex].text;
      setSourceText(text);
      setSourceWords(text.split(' '));
    } else {
      setSourceWords(sourceText.split(' '));
    }
    setRawInput('');
    setTypedWords([]);
    setTimeLeft(selectedDuration);
    setIsTestRunning(true);
    setHasStartedTyping(false);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
  };

  // Core Real-time Typing Interceptor & Parser
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isTestRunning) return;
    
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
      startCountdown();
    }

    if (e.key === 'Backspace') {
      // Allow browser to handle delete natively inside structural processing
      return;
    }

    if (e.key === 'Spacebar' || e.key === ' ') {
      // Space triggers Word Evaluation - Commit the current finalized token string
      e.preventDefault();
      const currentWords = rawInput.trim().split(' ');
      const lastWordIdx = currentWords.length - 1;
      if (lastWordIdx >= 0) {
        currentWords[lastWordIdx] = finalizeBanglaWordTokens(currentWords[lastWordIdx]);
      }
      setTypedWords([...currentWords]);
      setRawInput((prev) => prev + ' ');
      return;
    }

    // Capture explicit single character mappings
    if (e.key.length === 1) {
      e.preventDefault();
      const nextChar = processUnijoyInput('', e.key, e.shiftKey);
      setRawInput((prev) => prev + nextChar);
    }
  };

  // Real-time Metrics Engine
  useEffect(() => {
    if (!hasStartedTyping) return;
    const wordsArray = rawInput.trim().split(' ').map(w => finalizeBanglaWordTokens(w));
    
    let correctCount = 0;
    let errorCount = 0;

    wordsArray.forEach((word, idx) => {
      if (!sourceWords[idx]) return;
      if (word === sourceWords[idx]) {
        correctCount++;
      } else {
        errorCount++;
      }
    });

    setMistakes(errorCount);
    
    // Calculate metrics using formula
    const minutesElapsed = (selectedDuration - timeLeft) / 60 || 0.01;
    const calculatedGrossWpm = Math.round((rawInput.length / 5) / minutesElapsed);
    setWpm(calculatedGrossWpm >= 0 ? calculatedGrossWpm : 0);

    const totalCalculatedWords = correctCount + errorCount;
    const calculatedAcc = totalCalculatedWords > 0 ? (correctCount / totalCalculatedWords) * 100 : 100;
    setAccuracy(parseFloat(calculatedAcc.toFixed(2)));
  }, [rawInput, timeLeft]);

  const startCountdown = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endTypingSession(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endTypingSession = async (completedAutomatically = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTestRunning(false);
    setHasStartedTyping(false);

    // Save Results to Database if Logged In
    if (user) {
      await supabase.from('typing_results').insert({
        user_id: user.id,
        duration_selected: selectedDuration,
        time_spent: selectedDuration - timeLeft,
        gross_wpm: wpm,
        net_wpm: Math.max(0, wpm - mistakes),
        accuracy: accuracy,
        total_words: rawInput.trim().split(' ').length,
        correct_words: Math.max(0, rawInput.trim().split(' ').length - mistakes),
        wrong_words: mistakes,
        characters_typed: rawInput.length,
        is_completed: completedAutomatically
      });
      alert('পরীক্ষার ফলাফল সফলভাবে সংরক্ষিত হয়েছে!');
    }
  };

  // Dynamic live tracking representation template
  const renderSourceWord = (word: string, index: number) => {
    const currentWords = rawInput.trim().split(' ').map(w => finalizeBanglaWordTokens(w));
    let colorClass = 'text-slate-700 dark:text-slate-300'; // Default un-typed state

    if (index < currentWords.length) {
      if (currentWords[index] === word) {
        colorClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-medium px-1 rounded';
      } else {
        colorClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 font-medium px-1 rounded';
      }
    } else if (index === currentWords.length && rawInput.endsWith(' ') === false && rawInput.length > 0) {
      colorClass = 'border-b-2 border-indigo-500 animate-pulse';
    }

    return (
      <span key={index} className={`transition-all duration-150 inline-block mx-1 my-0.5 text-lg md:text-xl`}>
        {word}
      </span>
    );
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {!user && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-center">
          <p className="text-amber-800 dark:text-amber-400 font-medium mb-3">আপনার টাইপিং প্রগ্রেস ট্র্যাক এবং সেভ করতে গুগল দিয়ে লগইন করুন।</p>
          <button onClick={handleGoogleLogin} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium shadow-md transition-all">Google দিয়ে লগইন</button>
        </div>
      )}

      {/* 5. Two Equal-sized Boxes Stacked Vertically */}
      <div className="space-y-6">
        
        {/* TOP BOX: Source View */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-500">সময় নির্ধারণ:</label>
              <select 
                disabled={isTestRunning}
                value={selectedDuration}
                onChange={(e) => { setSelectedDuration(Number(e.target.value)); setTimeLeft(Number(e.target.value)); }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={300}>৫ মিনিট</option>
                <option value={600}>১০ মিনিট</option>
                <option value={900}>১৫ মিনিট</option>
                <option value={1200}>২০ মিনিট</option>
                <option value={1500}>২৫ মিনিট</option>
                <option value={1800}>৩০ মিনিট</option>
              </select>
            </div>
            <button 
              onClick={startTypingSession}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-colors shadow-sm shadow-indigo-100 dark:shadow-none"
            >
              Start Typing
            </button>
          </div>
          
          {/* Paragraph Context Area */}
          <div className="leading-relaxed tracking-wide select-none min-h-[140px] max-h-[220px] overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900">
            {sourceWords.length > 0 ? sourceWords.map(renderSourceWord) : sourceText}
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-md grid grid-cols-3 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-bold">{wpm}</div>
            <div className="text-xs text-indigo-100 uppercase tracking-wider font-semibold">গতি (WPM)</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold">{accuracy}%</div>
            <div className="text-xs text-indigo-100 uppercase tracking-wider font-semibold">সঠিকতা (Accuracy)</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-amber-300">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-indigo-100 uppercase tracking-wider font-semibold">বাকি সময়</div>
          </div>
          <div className="hidden md:block">
            <div className="text-2xl md:text-3xl font-bold">{mistakes}</div>
            <div className="text-xs text-indigo-100 uppercase tracking-wider font-semibold">ভুল শব্দ</div>
          </div>
        </div>

        {/* BOTTOM BOX: Input Terminal Area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">এখানে টাইপ করুন</span>
            <button 
              onClick={() => endTypingSession(false)}
              disabled={!isTestRunning}
              className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold text-sm px-4 py-1.5 rounded-xl transition-colors"
            >
              End Typing
            </button>
          </div>
          
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isTestRunning}
            placeholder={isTestRunning ? "এখানে Unijoy কীবোর্ড লেআউট নিয়মে টাইপ করা শুরু করুন..." : "টাইপিং শুরু করতে উপরে 'Start Typing' বোতামে চাপুন।"}
            className="w-full min-h-[140px] text-lg p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono resize-none transition-all text-slate-800 dark:text-slate-200"
          />
        </div>

      </div>
    </main>
  );
}
