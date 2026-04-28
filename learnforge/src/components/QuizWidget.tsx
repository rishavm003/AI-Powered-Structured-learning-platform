import React, { useState } from 'react';
import type { Question } from '../types';

interface Props {
  questions: Question[];
  onComplete: (score: number) => void;
}

type QuizState = 'waiting' | 'in-progress' | 'complete';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function getScoreMessage(score: number): string {
  if (score === 5) return 'Perfect! 🏆';
  if (score === 4) return 'Excellent! 🎉';
  if (score === 3) return 'Good job! 👍';
  return 'Keep practicing! 💪';
}

export const QuizWidget: React.FC<Props> = ({ questions, onComplete }) => {
  const [state, setState] = useState<QuizState>('waiting');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [hasCalledOnComplete, setHasCalledOnComplete] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 text-center text-gray-500 italic">
        Quiz not available for this day.
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  const handleOptionClick = (optionIdx: number) => {
    if (selectedOption !== null) return; // already answered
    setSelectedOption(optionIdx);
    if (optionIdx === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (isLastQuestion) {
      setState('complete');
      if (!hasCalledOnComplete) {
        // Use the updated score — we need to track it accurately
        const finalScore = selectedOption === currentQuestion.correctIndex ? score : score;
        onComplete(finalScore);
        setHasCalledOnComplete(true);
      }
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setState('in-progress');
    // Do NOT reset hasCalledOnComplete — retakes don't trigger onComplete again
  };

  const getOptionClass = (optionIdx: number): string => {
    const base = 'w-full text-left p-3 rounded-lg border-2 font-medium transition-all flex items-center space-x-3';
    if (selectedOption === null) {
      return `${base} border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-pointer`;
    }
    if (optionIdx === currentQuestion.correctIndex) {
      return `${base} border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 cursor-default`;
    }
    if (optionIdx === selectedOption) {
      return `${base} border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 cursor-default`;
    }
    return `${base} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600 cursor-default`;
  };

  // ─── WAITING ───────────────────────────────────────────
  if (state === 'waiting') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Day Quiz</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">5 questions · Tests today's concepts</p>
        <button
          onClick={() => setState('in-progress')}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
        >
          Take the Day Quiz
        </button>
      </div>
    );
  }

  // ─── COMPLETE ───────────────────────────────────────────
  if (state === 'complete') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{score}/5</div>
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">{getScoreMessage(score)}</p>
        <button
          onClick={handleRetake}
          className="w-full py-2 border-2 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-medium transition-colors"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  // ─── IN-PROGRESS ─────────────────────────────────────────
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-800 dark:text-gray-100">Day Quiz</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">Question {currentIdx + 1} of {questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-5">
        <div
          className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question */}
      <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">{currentQuestion.question}</p>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            className={getOptionClass(idx)}
            onClick={() => handleOptionClick(idx)}
            disabled={selectedOption !== null}
          >
            <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {OPTION_LABELS[idx]}
            </span>
            <span>{option}</span>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {selectedOption !== null && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          <span className="font-bold">Explanation: </span>
          {currentQuestion.explanation}
        </div>
      )}

      {/* Next / See Results button */}
      {selectedOption !== null && (
        <button
          onClick={handleNext}
          className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors"
        >
          {isLastQuestion ? 'See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  );
};
