import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoadmapStore } from '../store/roadmapStore';
import { useProgressStore } from '../store/progressStore';
import { TimerWidget } from '../components/TimerWidget';
import { QuizWidget } from '../components/QuizWidget';
import { QAChat } from '../components/QAChat';
import { ResourceCard } from '../components/ResourceCard';
import { MNCProjectCard } from '../components/MNCProjectCard';
import toast, { Toaster } from 'react-hot-toast';

export const DayViewPage: React.FC = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  
  const { roadmap } = useRoadmapStore();
  const { markDayComplete, saveQuizScore } = useProgressStore();
  
  const currentDayNum = parseInt(dayNumber || '1', 10);
  const day = roadmap.find(d => d.dayNumber === currentDayNum);
  
  const [checkedTopics, setCheckedTopics] = useState<Record<number, boolean>>({});

  if (!day) {
    return (
      <div className="p-8 text-center text-xl">
        Day not found. 
        <br />
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 underline">Return to Dashboard</button>
      </div>
    );
  }

  const handleToggleTopic = (idx: number) => {
    setCheckedTopics(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleMarkComplete = () => {
    const total = day.subtopics.length;
    if (total === 0) {
      markDayComplete(currentDayNum, 100);
    } else {
      const checkedCount = Object.values(checkedTopics).filter(Boolean).length;
      const percent = Math.round((checkedCount / total) * 100);
      markDayComplete(currentDayNum, percent);
    }
    
    // Read the latest committed state using static getState() AFTER markDayComplete has run
    const currentStreak = useProgressStore.getState().progress.currentStreak;
    toast.success(`Day ${currentDayNum} marked complete! 🔥 Streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''}`);
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const isFirstDay = currentDayNum === 1;
  const isLastDay = currentDayNum === roadmap.length;

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      <Toaster position="top-center" />
      
      {/* 1. Breadcrumb */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center space-x-2">
        <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dashboard</button>
        <span>&gt;</span>
        <span className="font-medium text-gray-800 dark:text-gray-200">Day {day.dayNumber}: {day.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. Goals section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">Goals</h2>
            <ul className="list-disc pl-5 space-y-2">
              {day.goals.map((goal, idx) => (
                <li key={idx} className="text-gray-700 dark:text-gray-300">{goal}</li>
              ))}
            </ul>
          </section>

          {/* 3. Subtopics section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">Topics to Cover</h2>
            <div className="space-y-4">
              {day.subtopics.map((topic, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600">
                  <input 
                    type="checkbox" 
                    className="mt-1.5 h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={!!checkedTopics[idx]}
                    onChange={() => handleToggleTopic(idx)}
                  />
                  <div className="flex-1">
                    <h3 className={`font-semibold transition-colors ${checkedTopics[idx] ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                      {topic.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{topic.description}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">
                      {topic.estimatedMinutes} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Resources section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">Resources</h2>
            {day.resources && day.resources.length > 0 ? (
              <div className="space-y-2">
                {day.resources.map((resource, idx) => (
                  <ResourceCard key={idx} resource={resource} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic text-sm">No resources found for this day.</p>
            )}
          </section>

          {/* 5. MNC Projects section */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">MNC Project Challenges</h2>
            {day.mncProjects && day.mncProjects.length > 0 ? (
              <div className="space-y-4">
                {day.mncProjects.slice(0, 3).map((project, idx) => (
                  <MNCProjectCard key={idx} project={project} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic text-sm">No projects available.</p>
            )}
          </section>

          {/* 6. Q&A section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-0">
              <QAChat day={day} />
            </div>
          </section>

          {/* 9. Quiz section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <QuizWidget
                questions={day.quiz}
                onComplete={(score) => saveQuizScore(currentDayNum, score)}
              />
            </div>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* 7. Session Timer */}
          <TimerWidget dayNumber={currentDayNum} />

          {/* 8. Mark Day Complete */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <h3 className="font-bold text-lg mb-4">Finish Day</h3>
            <button 
              onClick={handleMarkComplete}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors shadow-sm"
            >
              Mark Day Complete
            </button>
          </div>

          {/* Navigation */}
          <div className="flex justify-between space-x-2">
            <button 
              disabled={isFirstDay}
              onClick={() => navigate(`/day/${currentDayNum - 1}`)}
              className={`flex-1 py-2 rounded font-medium border ${isFirstDay ? 'text-gray-400 bg-gray-50 border-gray-200' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50 bg-white'}`}
            >
              &larr; Prev
            </button>
            <button 
              disabled={isLastDay}
              onClick={() => navigate(`/day/${currentDayNum + 1}`)}
              className={`flex-1 py-2 rounded font-medium border ${isLastDay ? 'text-gray-400 bg-gray-50 border-gray-200' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50 bg-white'}`}
            >
              Next &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
