import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8">
      <p className="text-7xl font-black text-indigo-100 dark:text-indigo-900 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">This page doesn't exist or was moved.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        Go Home
      </button>
    </div>
  );
};
