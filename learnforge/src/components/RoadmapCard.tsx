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
      return "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/10";
    } else if (isInProgress) {
      return "border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10";
    } else {
      return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 shadow hover:shadow-md cursor-pointer transition-all duration-300 ${getCardStyle()}`}
      onClick={() => navigate(`/day/${day.dayNumber}`)}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Day {day.dayNumber}</h3>
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            <span className={`px-2 py-1 text-xs rounded-full ${
              isCompleted
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : isInProgress
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
            }`}>
              {completionPercent}%
            </span>
          </div>
        </div>
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">{day.title}</h4>
      </div>
      <div className="mt-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${completionPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{day.subtopics.length} topics</span>
          <span>{day.quiz.length} quiz questions</span>
        </div>
      </div>
    </div>
  );
};
