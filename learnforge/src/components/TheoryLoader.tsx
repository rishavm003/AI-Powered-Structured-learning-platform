import React, { useEffect, useState } from 'react';

const MESSAGES = [
  '🤖 Consulting the AI tutor...',
  '📚 Gathering core concepts...',
  '✍️ Drafting explanations...',
  '🔍 Adding examples & code...',
  '✨ Polishing the lesson...',
  '🏁 Almost ready...',
];

export const TheoryLoader: React.FC<{ topicName: string }> = ({ topicName }) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 overflow-hidden shadow-inner">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        {/* Animated brain icon */}
        <div className="relative flex-shrink-0 w-10 h-10">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 dark:bg-indigo-400/20 animate-ping" />
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-0.5">AI Tutor is preparing</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{topicName}</p>
        </div>
      </div>

      {/* Cycling status message */}
      <div className="px-5 pb-4">
        <p
          key={msgIdx}
          className="text-xs text-purple-600 dark:text-purple-400 font-medium animate-fade-in"
        >
          {MESSAGES[msgIdx]}
        </p>
      </div>

      {/* Skeleton lines */}
      <div className="px-5 pb-5 space-y-3">
        {/* Simulated heading */}
        <div className="h-4 w-2/5 bg-indigo-200/60 dark:bg-indigo-700/40 rounded-full animate-pulse" />

        {/* Simulated body lines */}
        {[100, 95, 88, 100, 72].map((w, i) => (
          <div
            key={i}
            className="h-3 bg-gray-200/70 dark:bg-white/10 rounded-full animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
          />
        ))}

        {/* Simulated code block */}
        <div className="mt-4 rounded-lg bg-gray-900/10 dark:bg-black/30 p-3 space-y-2 border border-gray-200/50 dark:border-white/5">
          {[60, 80, 45, 70].map((w, i) => (
            <div
              key={i}
              className="h-2.5 bg-green-300/50 dark:bg-green-700/40 rounded animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* More body lines */}
        {[92, 85, 55].map((w, i) => (
          <div
            key={i}
            className="h-3 bg-gray-200/70 dark:bg-white/10 rounded-full animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${(i + 5) * 120}ms` }}
          />
        ))}
      </div>

      {/* Progress bar at bottom */}
      <div className="h-1 w-full bg-indigo-100 dark:bg-indigo-900/30">
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-loading-bar" />
      </div>
    </div>
  );
};
