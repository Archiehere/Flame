export type HobbyLevel = 'beginner' | 'some_experience' | 'intermediate';

export interface ChapterInput {
  title: string;
  description: string;
  order: number;
  timeEstimateDays: number;
}

export interface Chapter extends ChapterInput {
  _id: string;
  status: 'locked' | 'current' | 'completed';
}

export interface LearningPlan {
  _id: string;
  hobby: string;
  level: HobbyLevel;
  targetDate: string;
  status: 'draft' | 'active' | 'completed' | 'abandoned';
  chapters: Chapter[];
}

export interface TargetDatePreset {
  label: string;
  days: number;
}

export const TARGET_DATE_PRESETS: TargetDatePreset[] = [
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
];

export const HOBBY_LEVEL_OPTIONS: { label: string; value: HobbyLevel }[] = [
  { label: 'Complete beginner', value: 'beginner' },
  { label: 'Some experience', value: 'some_experience' },
  { label: 'Intermediate, want to go deeper', value: 'intermediate' },
];
