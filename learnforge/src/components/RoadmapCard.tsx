import React from 'react';
import type { Day } from '../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  day: Day;
  completionPercent: number;
}

export const RoadmapCard: React.FC<Props> = ({ day, completionPercent }) => {
  const navigate = useNavigate();

  // Calculate the status of the day
  const isCompleted = completionPercent >= 100;
  const isInProgress = completionPercent > 0 && completionPercent < 100;

  // Determine card styling based on completion status
  const getCardStyle = () => {
    if (isCompleted) {
      return "border-green-400/50 dark:border-green-500/30 bg-green-50/80 dark:bg-green-900/10 shadow-[0_4px_20px_-4px_rgba(34,197,94,0.15)]";
    } else if (isInProgress) {
      return "border-indigo-400/50 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-900/10 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)]";
    } else {
      return "glass-card";
    }
  };

  return (
    <div
      className={`group relative overflow-hidden p-5 cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${getCardStyle()}`}
      onClick={() => navigate(`/day/${day.dayNumber}`)}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 opacity-50 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            Day {day.dayNumber}
            {isCompleted && (
              <svg className="w-5 h-5 text-green-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </h3>
          <div className="flex items-center">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-md shadow-sm ${
              isCompleted
                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                : isInProgress
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'bg-gray-100 dark:bg-[#0b0f19] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/5'
            }`}>
              {completionPercent}%
            </span>
          </div>
        </div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 line-clamp-2 leading-snug">{day.title}</h4>
      </div>
      
      <div className="mt-4 relative z-10">
        <div className="w-full bg-gray-100 dark:bg-[#0b0f19] rounded-full h-2 mb-3 border border-gray-200 dark:border-white/5 shadow-inner p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isCompleted ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
            }`}
            style={{ width: `${completionPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            {day.subtopics.length} topics
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {day.quiz.length} Qs
          </span>
        </div>
      </div>
    </div>
  );
};
