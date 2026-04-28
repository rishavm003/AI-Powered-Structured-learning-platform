import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoadmapStore } from '../store/roadmapStore';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { clearRoadmap } = useRoadmapStore();

  const clearAll = () => {
    if (!window.confirm('This will permanently delete ALL your progress, roadmap, and preferences. Are you sure?')) return;
    // Remove all learnforge keys
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('learnforge:')) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    clearRoadmap();
    navigate('/');
  };

  const replayOnboarding = () => {
    // Reset onboarding flag so it shows again
    const raw = localStorage.getItem('learnforge:prefs');
    if (raw) {
      try {
        const prefs = JSON.parse(raw);
        prefs.state = { ...prefs.state, onboardingDone: false };
        localStorage.setItem('learnforge:prefs', JSON.stringify(prefs));
        window.location.reload();
      } catch { window.location.reload(); }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your LearnForge data and preferences.</p>
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        <div className="p-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Replay Onboarding</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Show the welcome tour again.</p>
          </div>
          <button
            onClick={replayOnboarding}
            className="px-4 py-2 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Show Tour
          </button>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Export & Share</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Use the buttons on your Dashboard.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="p-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-red-600">Clear All Data</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Permanently deletes your roadmap, progress, and all cached data.</p>
          </div>
          <button
            onClick={clearAll}
            className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Clear & Reset
          </button>
        </div>
      </section>

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
        LearnForge v1.0 · All data stored locally in your browser.
      </p>
    </div>
  );
};
