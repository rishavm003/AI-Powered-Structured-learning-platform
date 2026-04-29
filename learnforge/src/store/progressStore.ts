import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Progress, SessionLog } from '../types';
import { checkAndWarn } from '../utils/storageGuard';
import { getUserId } from '../utils/userId';
import { ENV } from '../utils/envCheck';

interface ProgressState {
  progress: Progress;
  markDayComplete: (dayNum: number, percent: number) => void;
  logSession: (log: SessionLog) => void;
  saveQuizScore: (dayNum: number, score: number) => void;
  updateStreak: () => void;
  getCompletionPercent: (dayNum: number) => number;
  getTotalCompletionPercent: (totalDays: number) => number;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

const initialProgress: Progress = {
  dayCompletionMap: {},
  sessionLogs: [],
  quizScores: {},
  currentStreak: 0,
  lastActiveDate: null,
  storageVersion: '1.0',
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,
      markDayComplete: (dayNum, percent) => {
        set((state) => ({
          progress: {
            ...state.progress,
            dayCompletionMap: { ...state.progress.dayCompletionMap, [dayNum]: percent }
          }
        }));
        get().updateStreak();
        get().syncToCloud();
      },
      logSession: (log) => {
        set((state) => ({
          progress: {
            ...state.progress,
            sessionLogs: [...state.progress.sessionLogs, log]
          }
        }));
        checkAndWarn();
        get().syncToCloud();
      },
      saveQuizScore: (dayNum, score) => {
        set((state) => ({
          progress: {
            ...state.progress,
            quizScores: { ...state.progress.quizScores, [dayNum]: score }
          }
        }));
        get().syncToCloud();
      },
      updateStreak: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const last = state.progress.lastActiveDate;
        let newStreak = state.progress.currentStreak;

        if (last !== today) {
          if (last) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (last === yesterdayStr) {
              newStreak++;
            } else {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }
        }

        return {
          progress: {
            ...state.progress,
            currentStreak: newStreak,
            lastActiveDate: today
          }
        };
      }),
      getCompletionPercent: (dayNum: number) => {
        return get().progress.dayCompletionMap[dayNum] ?? 0;
      },
      getTotalCompletionPercent: (totalDays: number) => {
        if (totalDays === 0) return 0;
        const sum = Object.values(get().progress.dayCompletionMap).reduce((a, b) => a + b, 0);
        return Math.round(sum / totalDays);
      },
      
      syncToCloud: async () => {
        try {
          await fetch(`${ENV.PROXY_URL}/api/save-progress`, {
            method: 'POST',
            body: JSON.stringify({
              user_id: getUserId(),
              data: get().progress
            })
          });
        } catch (e) {
          console.error("Failed to sync progress to D1", e);
        }
      },

      loadFromCloud: async () => {
        try {
          const res = await fetch(`${ENV.PROXY_URL}/api/load-progress?user_id=${getUserId()}`);
          const result = await res.json();
          if (result && result.data) {
            set({ progress: JSON.parse(result.data) });
          }
        } catch (e) {
          console.error("Failed to load progress from D1", e);
        }
      }
    }),
    {
      name: 'learnforge:progress',
    }
  )
);
