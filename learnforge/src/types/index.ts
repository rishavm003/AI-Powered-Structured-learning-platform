export type DepthLevel = 'beginner' | 'intermediate' | 'expert';

export interface RoadmapConfig {
  topic: string;
  days: number;
  hoursPerDay: number;
  depth: DepthLevel;
  promptVersion: string;
  createdAt: number;
}

export interface Subtopic {
  name: string;
  description: string;
  estimatedMinutes: number;
  theory?: string;
}

export interface Resource {
  url: string;
  title: string;
  type: 'doc' | 'github' | 'video' | 'article';
}

export interface Project {
  title: string;
  problemStatement: string;
  techStack: string[];
  milestones: string[];
  rubric: string[];
}

export interface Question {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface Day {
  dayNumber: number;
  title: string;
  subtopics: Subtopic[];
  goals: string[];
  resources: Resource[];
  mncProjects: Project[];
  quiz: Question[];
}

export interface SessionLog {
  date: string;
  dayNumber: number;
  minutesSpent: number;
}

export interface Progress {
  dayCompletionMap: Record<number, number>; // percent completion
  sessionLogs: SessionLog[];
  quizScores: Record<number, number>;
  currentStreak: number;
  lastActiveDate: string | null;
  storageVersion: string;
}
