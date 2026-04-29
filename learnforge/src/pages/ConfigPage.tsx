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
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="dark-bg-glow hidden dark:block"></div>
      
      <div className="w-full max-w-2xl glass-card p-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-gradient">LearnForge Setup</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl flex justify-between items-start shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">What do you want to master?</label>
            <input 
              {...register('topic')} 
              className="w-full p-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm"
              placeholder="e.g., Python, UI/UX Design, Quantum Computing"
              disabled={isLoading}
            />
            {errors.topic && <p className="text-red-500 text-xs font-bold mt-2">{errors.topic.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Duration (Days)</label>
              <input 
                type="number" 
                {...register('days', { valueAsNumber: true })} 
                className="w-full p-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm"
                disabled={isLoading}
              />
              {errors.days && <p className="text-red-500 text-xs font-bold mt-2">{errors.days.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pace (Hours / Day)</label>
              <select 
                {...register('hoursPerDay', { valueAsNumber: true })}
                className="w-full p-3.5 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm appearance-none"
                disabled={isLoading}
              >
                {[0.5, 1, 1.5, 2, 3, 4, 6, 8].map(h => (
                  <option key={h} value={h} className="dark:bg-[#151c2c]">{h} {h === 1 ? 'hour' : 'hours'}</option>
                ))}
              </select>
              {errors.hoursPerDay && <p className="text-red-500 text-xs font-bold mt-2">{errors.hoursPerDay.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Target Depth</label>
            <div className="flex flex-wrap gap-3">
              {['beginner', 'intermediate', 'expert'].map((d) => (
                <label key={d} className="flex-1 relative">
                  <input 
                    type="radio" 
                    {...register('depth')} 
                    value={d} 
                    className="peer sr-only"
                    disabled={isLoading}
                  />
                  <div className="p-3 text-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0b0f19] text-gray-500 dark:text-gray-400 cursor-pointer transition-all duration-300 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-400 font-bold capitalize hover:bg-gray-100 dark:hover:bg-white/5">
                    {d}
                  </div>
                </label>
              ))}
            </div>
            {errors.depth && <p className="text-red-500 text-xs font-bold mt-2">{errors.depth.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 px-6 mt-4 bg-gradient-primary rounded-xl font-extrabold text-lg shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {loadingStatus || 'Generating...'}
                </>
              ) : 'Forging Your Roadmap'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
