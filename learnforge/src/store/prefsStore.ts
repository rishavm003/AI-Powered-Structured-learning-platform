import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PrefsState {
  theme: 'light' | 'dark';
  onboardingDone: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  completeOnboarding: () => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      theme: 'light',
      onboardingDone: false,
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ onboardingDone: true }),
    }),
    {
      name: 'learnforge:prefs',
    }
  )
);
