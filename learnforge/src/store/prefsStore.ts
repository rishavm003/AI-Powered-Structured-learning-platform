import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PrefsState {
  theme: 'light' | 'dark';
  onboardingDone: boolean;
  aiModel: string;
  setTheme: (theme: 'light' | 'dark') => void;
  completeOnboarding: () => void;
  setAiModel: (model: string) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      theme: 'light',
      onboardingDone: false,
      aiModel: 'nvidia_nim/moonshotai/kimi-k2-instruct',
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ onboardingDone: true }),
      setAiModel: (aiModel) => set({ aiModel }),
    }),
    {
      name: 'learnforge:prefs',
    }
  )
);
