import React from 'react';
import type { Day } from '../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  day: Day;
  completionPercent: number;
}

export const RoadmapCard: React.FC<Props> = ({ day, completionPercent }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow hover:shadow-md cursor-pointer transition-shadow bg-white dark:bg-gray-800 flex flex-col justify-between"
      onClick={() => navigate(`/day/${day.dayNumber}`)}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Day {day.dayNumber}</h3>
          <div className="flex items-center space-x-2">
            {completionPercent >= 100 && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            <span className={`px-2 py-1 text-xs rounded-full ${completionPercent === 100 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
              {completionPercent}%
            </span>
          </div>
        </div>
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{day.title}</h4>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
          <div className={`h-1.5 rounded-full ${completionPercent === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${completionPercent}%` }}></div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {day.subtopics.length} subtopics
        </div>
      </div>
    </div>
  );
};
