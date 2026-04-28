import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProgressStore } from '../store/progressStore';
import { useRoadmapStore } from '../store/roadmapStore';

export const QuizResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { progress } = useProgressStore();
  const { roadmap } = useRoadmapStore();

  const { quizScores } = progress;

  // Build chart data — one bar per day that has a score
  const chartData = Object.entries(quizScores)
    .map(([dayNum, score]) => {
      const day = roadmap.find(d => d.dayNumber === parseInt(dayNum));
      return {
        dayNumber: parseInt(dayNum),
        title: day?.title ?? `Day ${dayNum}`,
        score,
      };
    })
    .sort((a, b) => a.dayNumber - b.dayNumber);

  const allScores = Object.values(quizScores);
  const avgScore = allScores.length > 0
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : null;

  // Sorted for weakest / strongest
  const sortedByScore = [...chartData].sort((a, b) => a.score - b.score);
  const weakest = sortedByScore.slice(0, 3);
  const strongest = sortedByScore.slice(-3).reverse();

  if (chartData.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Quiz Results</h1>
        <p className="text-gray-500 mb-6">No quiz scores yet. Complete a day's quiz to see results here.</p>
        <button onClick={() => navigate('/dashboard')} className="text-indigo-600 underline">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quiz Results</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{chartData.length} day{chartData.length !== 1 ? 's' : ''} completed</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">
          ← Dashboard
        </button>
      </div>

      {/* Average badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl px-6 py-4 text-center">
          <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{avgScore}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Score / 5</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-6 py-4 text-center">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400">
            {allScores.filter(s => s >= 3).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Days Passed</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-6 py-4 text-center">
          <div className="text-4xl font-bold text-red-500 dark:text-red-400">
            {allScores.filter(s => s < 3).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Days to Review</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Score per Day</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="dayNumber" 
              label={{ value: 'Day', position: 'insideBottom', offset: -2, fill: '#6b7280' }} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              stroke="#9ca3af"
            />
            <YAxis 
              domain={[0, 5]} 
              ticks={[0, 1, 2, 3, 4, 5]} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [`${value}/5`, 'Score']}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.dayNumber} fill={entry.score >= 3 ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Score table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white p-5 border-b dark:border-gray-700">Score Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Day</th>
                <th className="text-left p-3 font-semibold text-gray-600 dark:text-gray-400">Title</th>
                <th className="text-center p-3 font-semibold text-gray-600 dark:text-gray-400">Score</th>
                <th className="text-center p-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {chartData.map((row) => (
                <tr key={row.dayNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 font-medium text-gray-700 dark:text-gray-300">Day {row.dayNumber}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{row.title}</td>
                  <td className="p-3 text-center font-bold text-gray-800 dark:text-gray-200">{row.score}/5</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.score >= 3 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                      {row.score >= 3 ? 'Pass' : 'Fail'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weakest / Strongest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-5">
          <h2 className="font-bold text-red-800 dark:text-red-400 mb-3">Weakest Topics</h2>
          <ul className="space-y-2">
            {weakest.map((entry) => {
              const day = roadmap.find(d => d.dayNumber === entry.dayNumber);
              return (
                <li key={entry.dayNumber} className="text-sm">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Day {entry.dayNumber} ({entry.score}/5):</span>
                  <span className="text-gray-600 dark:text-gray-400"> {day?.subtopics.slice(0, 2).map(s => s.name).join(', ')}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg p-5">
          <h2 className="font-bold text-green-800 dark:text-green-400 mb-3">Strongest Topics</h2>
          <ul className="space-y-2">
            {strongest.map((entry) => {
              const day = roadmap.find(d => d.dayNumber === entry.dayNumber);
              return (
                <li key={entry.dayNumber} className="text-sm">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Day {entry.dayNumber} ({entry.score}/5):</span>
                  <span className="text-gray-600 dark:text-gray-400"> {day?.subtopics.slice(0, 2).map(s => s.name).join(', ')}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
};
