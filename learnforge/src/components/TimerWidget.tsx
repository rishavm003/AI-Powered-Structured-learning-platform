import React, { useState, useEffect, useRef } from 'react';
import { useProgressStore } from '../store/progressStore';

interface Props {
  dayNumber: number;
}

export const TimerWidget: React.FC<Props> = ({ dayNumber }) => {
  const { logSession } = useProgressStore();
  // Store logSession in a ref to avoid stale closures inside the timer interval
  const logSessionRef = useRef(logSession);
  useEffect(() => { logSessionRef.current = logSession; }, [logSession]);
  const WORK_TIME = 1500; // 25 minutes
  const BREAK_TIME = 300; // 5 minutes

  // Attempt to recover state from sessionStorage
  const sessionKey = `learnforge:timer:${dayNumber}`;
  const getInitialState = () => {
    const saved = sessionStorage.getItem(sessionKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      mode: 'work' as 'work' | 'break',
      timeLeft: WORK_TIME,
      sessionsCompleted: 0
    };
  };

  const initialState = getInitialState();
  const [mode, setMode] = useState<'work' | 'break'>(initialState.mode);
  const [timeLeft, setTimeLeft] = useState<number>(initialState.timeLeft);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(initialState.sessionsCompleted);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Persist state when it changes
  useEffect(() => {
    sessionStorage.setItem(sessionKey, JSON.stringify({ mode, timeLeft, sessionsCompleted }));
  }, [mode, timeLeft, sessionsCompleted, sessionKey]);

  const playBeep = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      playBeep();
      if (mode === 'work') {
        const newSessions = sessionsCompleted + 1;
        setSessionsCompleted(newSessions);
        setMode('break');
        setTimeLeft(BREAK_TIME);
        
        logSessionRef.current({
          date: new Date().toISOString(),
          dayNumber,
          minutesSpent: 25
        });
      } else {
        setMode('work');
        setTimeLeft(WORK_TIME);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, dayNumber, sessionsCompleted]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(WORK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {mode === 'work' ? "Work session" : "Break time"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Sessions completed today: {sessionsCompleted}</p>
      </div>
      
      <div className="flex justify-center items-center my-6">
        <div className={`text-5xl font-mono font-bold ${mode === 'work' ? 'text-indigo-600 dark:text-indigo-400' : 'text-green-500 dark:text-green-400'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button 
          onClick={toggleTimer}
          className={`px-6 py-2 rounded font-bold text-white transition-colors ${
            isRunning 
              ? 'bg-yellow-500 hover:bg-yellow-600' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          className="px-6 py-2 rounded font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
