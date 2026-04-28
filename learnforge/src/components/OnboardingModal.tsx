import React, { useState } from 'react';
import { usePrefsStore } from '../store/prefsStore';

const slides = [
  {
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-24 h-24 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="64" height="64" rx="16" fill="#eef2ff"/>
        <rect x="20" y="22" width="40" height="6" rx="3" fill="#6366f1"/>
        <rect x="20" y="34" width="28" height="4" rx="2" fill="#a5b4fc"/>
        <rect x="20" y="44" width="32" height="4" rx="2" fill="#a5b4fc"/>
        <rect x="20" y="54" width="20" height="4" rx="2" fill="#c7d2fe"/>
      </svg>
    ),
    title: 'Welcome to LearnForge',
    body: 'Your AI-powered study companion. Enter any topic and get a personalized, structured learning roadmap — with quizzes, resources, and project challenges built in.',
  },
  {
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-24 h-24 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="40" r="10" fill="#e0e7ff"/>
        <circle cx="40" cy="40" r="10" fill="#c7d2fe"/>
        <circle cx="60" cy="40" r="10" fill="#818cf8"/>
        <rect x="30" y="38" width="10" height="4" rx="2" fill="#6366f1"/>
        <rect x="50" y="38" width="10" height="4" rx="2" fill="#6366f1"/>
        <text x="15" y="44" fontSize="10" fill="#4f46e5" fontWeight="bold">1</text>
        <text x="35" y="44" fontSize="10" fill="#4f46e5" fontWeight="bold">2</text>
        <text x="55" y="44" fontSize="10" fill="white" fontWeight="bold">3</text>
      </svg>
    ),
    title: 'How It Works',
    body: '',
    steps: [
      { n: '1', label: 'Enter topic', desc: 'Choose what you want to learn and set your timeline.' },
      { n: '2', label: 'Get your roadmap', desc: 'Phi-4 AI generates a day-by-day plan with quizzes.' },
      { n: '3', label: 'Study & track', desc: 'Use the timer, complete quizzes, and watch your streak grow.' },
    ],
  },
  {
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-24 h-24 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="32" fill="#f0fdf4"/>
        <path d="M25 40l10 10 20-20" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '100% Free Stack',
    body: 'LearnForge uses free services: Vite, React, Cloudflare Pages, and DuckDuckGo for resources. By using a local Phi-4 model via Ollama, your learning is 100% private and free. Everything is stored locally in your browser.',
  },
];

export const OnboardingModal: React.FC = () => {
  const { completeOnboarding } = usePrefsStore();
  const [current, setCurrent] = useState(0);

  const isLast = current === slides.length - 1;
  const slide = slides[current];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Skip */}
        <button
          onClick={completeOnboarding}
          className="absolute top-4 right-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Skip onboarding"
        >
          Skip
        </button>

        {/* Slide content */}
        <div className="text-center">
          {slide.icon}
          <h2 id="onboarding-title" className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
            {slide.title}
          </h2>

          {slide.body && (
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{slide.body}</p>
          )}

          {slide.steps && (
            <div className="space-y-3 text-left mb-6">
              {slide.steps.map(step => (
                <div key={step.n} className="flex items-start space-x-3">
                  <span className="w-7 h-7 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center mt-0.5">
                    {step.n}
                  </span>
                  <div>
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{step.label}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-indigo-600 w-4' : 'bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>

        {/* Next / Finish */}
        <button
          onClick={() => isLast ? completeOnboarding() : setCurrent(c => c + 1)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {isLast ? "Let's Start!" : 'Next →'}
        </button>
      </div>
    </div>
  );
};
