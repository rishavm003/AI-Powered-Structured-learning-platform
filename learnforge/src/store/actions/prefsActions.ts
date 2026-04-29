import { PrefsState } from '../types';

// Actions for prefs store
export const prefsActions = {
  setTheme: (theme: 'light' | 'dark') => void;
  completeOnboarding: () => void;
  setAiModel: (model: string) => void;
};