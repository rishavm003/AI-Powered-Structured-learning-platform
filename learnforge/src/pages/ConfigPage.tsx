import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useRoadmapStore } from '../store/roadmapStore';
import { generateRoadmap } from '../agents/roadmapAgent';
import { PROMPT_VERSION } from '../utils/promptVersions';

const configSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  days: z.number().min(1).max(90),
  hoursPerDay: z.number().min(0.5).max(8),
  depth: z.enum(['beginner', 'intermediate', 'expert'])
});

type ConfigFormData = z.infer<typeof configSchema>;

export const ConfigPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      days: 14,
      hoursPerDay: 2,
      depth: 'beginner'
    }
  });

  const navigate = useNavigate();
  const { setConfig, setRoadmap, setLoading, setError, isLoading, error } = useRoadmapStore();
  const [loadingStatus, setLoadingStatus] = React.useState('');

  React.useEffect(() => {
    // Clear any "ghost" errors loaded from localStorage when the page opens
    setError(null);
  }, [setError]);

  const onSubmit = async (data: ConfigFormData) => {
    setLoading(true);
    setError(null);
    setLoadingStatus('');
    
    const config = {
      ...data,
      promptVersion: PROMPT_VERSION,
      createdAt: Date.now()
    };

    try {
      setConfig(config);
      const roadmap = await generateRoadmap(config, setLoadingStatus);
      setRoadmap(roadmap);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-transparent dark:border-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700 dark:text-indigo-400">LearnForge Roadmap Setup</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">What do you want to learn?</label>
          <input 
            {...register('topic')} 
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g., React.js, Python for Data Science"
            disabled={isLoading}
          />
          {errors.topic && <p className="text-red-500 text-sm mt-1">{errors.topic.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Days)</label>
            <input 
              type="number" 
              {...register('days', { valueAsNumber: true })} 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              disabled={isLoading}
            />
            {errors.days && <p className="text-red-500 text-sm mt-1">{errors.days.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hours / Day</label>
            <select 
              {...register('hoursPerDay', { valueAsNumber: true })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              disabled={isLoading}
            >
              {[0.5, 1, 1.5, 2, 3, 4, 6, 8].map(h => (
                <option key={h} value={h} className="dark:bg-gray-800">{h} {h === 1 ? 'hour' : 'hours'}</option>
              ))}
            </select>
            {errors.hoursPerDay && <p className="text-red-500 text-sm mt-1">{errors.hoursPerDay.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Depth</label>
          <div className="flex space-x-4">
            {['beginner', 'intermediate', 'expert'].map((d) => (
              <label key={d} className="flex items-center text-gray-700 dark:text-gray-300">
                <input 
                  type="radio" 
                  {...register('depth')} 
                  value={d} 
                  className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <span className="capitalize">{d}</span>
              </label>
            ))}
          </div>
          {errors.depth && <p className="text-red-500 text-sm mt-1">{errors.depth.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900/50 transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {loadingStatus || 'Generating Roadmap...'}
            </span>
          ) : 'Generate Roadmap'}
        </button>
        {isLoading && loadingStatus && (
          <p className="text-center text-sm text-indigo-600 dark:text-indigo-400 animate-pulse mt-2">{loadingStatus}</p>
        )}
      </form>
    </div>
  );
};
