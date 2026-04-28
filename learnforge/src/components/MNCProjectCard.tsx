import React, { useState } from 'react';
import type { Project } from '../types';

interface Props {
  project: Project;
}

export const MNCProjectCard: React.FC<Props> = ({ project }) => {
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  const visibleMilestones = showAllMilestones
    ? project.milestones
    : project.milestones.slice(0, 2);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-white text-base leading-tight">{project.title}</h3>
          <span className="flex-shrink-0 ml-3 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
            MNC Challenge
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Problem Statement */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{project.problemStatement}</p>

        {/* Tech Stack */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Tech Stack</h4>
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Milestones</h4>
          <ol className="space-y-1.5">
            {visibleMilestones.map((milestone, i) => (
              <li key={i} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{milestone}</span>
              </li>
            ))}
          </ol>
          {project.milestones.length > 2 && (
            <button
              onClick={() => setShowAllMilestones(!showAllMilestones)}
              className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              {showAllMilestones
                ? '▲ Show less'
                : `▼ Show all ${project.milestones.length} milestones`}
            </button>
          )}
        </div>

        {/* Rubric */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Evaluation Criteria</h4>
          <ul className="space-y-1.5">
            {project.rubric.map((criterion, i) => (
              <li key={i} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
