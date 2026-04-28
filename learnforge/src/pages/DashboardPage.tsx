import React, { useState } from 'react';
import { useRoadmapStore } from '../store/roadmapStore';
import { useProgressStore } from '../store/progressStore';
import { RoadmapCard } from '../components/RoadmapCard';
import { HeatmapChart } from '../components/HeatmapChart';
import { RoadmapCardSkeleton } from '../components/Skeleton';
import { exportRoadmapToPDF } from '../utils/pdfExport';
import { exportRoadmapToMarkdown } from '../utils/markdownExport';
import { generateShareURL } from '../utils/share';
import toast, { Toaster } from 'react-hot-toast';

const FlameIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 23C7.03 23 3 19.19 3 14.5c0-2.84 1.36-5.36 3.62-7.14.44-.35 1.08-.05 1.12.51.08 1.11.47 2.17 1.11 3.06C9.41 8.96 10 6.36 10 3.5c0-.55.45-1 1-1 .28 0 .52.11.71.29C14.12 4.93 15.5 7.89 15.5 11c0 .63-.06 1.24-.18 1.83A4.5 4.5 0 0 0 17 9.5c0-.45.3-.85.73-.97.43-.13.89.07 1.1.46C19.58 10.7 20 12.6 20 14.5 20 19.19 15.97 23 12 23z"/>
  </svg>
);

function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
        Start your streak today
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-sm font-bold px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800 shadow-sm">
      <FlameIcon className="w-4 h-4 text-orange-500" />
      <span>{streak} day streak{streak >= 7 ? ' · On fire!' : ''}</span>
    </span>
  );
}

export const DashboardPage: React.FC = () => {
  const { config, roadmap } = useRoadmapStore();
  const { progress, getCompletionPercent, getTotalCompletionPercent } = useProgressStore();
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (!config || roadmap.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <RoadmapCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const totalDays = roadmap.length;
  const overallProgress = getTotalCompletionPercent(totalDays);

  const handlePDFExport = async () => {
    setIsPdfExporting(true);
    setShowExportMenu(false);
    try {
      await exportRoadmapToPDF(roadmap, config);
      toast.success('PDF downloaded!');
    } catch (e) {
      toast.error('PDF export failed. Please try again.');
    } finally {
      setIsPdfExporting(false);
    }
  };

  const handleMarkdownExport = () => {
    setShowExportMenu(false);
    exportRoadmapToMarkdown(roadmap, config);
    toast.success('Markdown file downloaded!');
  };

  const handleShare = () => {
    setShowExportMenu(false);
    const url = generateShareURL(roadmap, config);
    if (!url) {
      toast.error('Roadmap too large to share as URL. Use Export Markdown instead.');
      return;
    }
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Share link copied to clipboard!');
    }).catch(() => {
      toast.error('Could not copy to clipboard. URL: ' + url);
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{config.topic}</h1>
            <StreakBadge streak={progress.currentStreak} />
          </div>
          <p className="text-gray-500 dark:text-gray-400">{totalDays} Days · {config.hoursPerDay} hrs/day · {config.depth}</p>
        </div>

        {/* Export menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            aria-label="Export options"
            aria-expanded={showExportMenu}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <span>Export / Share</span>
            <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 overflow-hidden">
              <button
                onClick={handlePDFExport}
                disabled={isPdfExporting}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
              >
                <span>📄</span>
                <span>{isPdfExporting ? 'Exporting…' : 'Export PDF'}</span>
              </button>
              <button
                onClick={handleMarkdownExport}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 border-t border-gray-100 dark:border-gray-700 transition-colors"
              >
                <span>📝</span>
                <span>Export Markdown</span>
              </button>
              <button
                onClick={handleShare}
                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 border-t border-gray-100 dark:border-gray-700 transition-colors"
              >
                <span>🔗</span>
                <span>Share Link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between mb-2">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</span>
        </div>
        <div
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3"
          role="progressbar"
          aria-valuenow={overallProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall roadmap progress"
        >
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Heatmap */}
      <HeatmapChart weeks={12} />

      {/* Day Cards */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Your Roadmap</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {roadmap.map((day) => (
            <RoadmapCard
              key={day.dayNumber}
              day={day}
              completionPercent={getCompletionPercent(day.dayNumber)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
