// Types for the stores
export interface PrefsState {
  theme: 'light' | 'dark';
  onboardingDone: boolean;
  aiModel: string;
  setTheme: (theme: 'light' | 'dark') => void;
  completeOnboarding: () => void;
  setAiModel: (model: string) => void;
}

export interface RoadmapState {
  // Define the roadmap store state structure here
}

export interface ProgressState {
  // Define the progress store state structure here
}