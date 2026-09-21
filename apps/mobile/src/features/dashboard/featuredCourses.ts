import { HobbyLevel } from '../onboarding/types';

export interface FeaturedCourse {
  hobby: string;
  level: HobbyLevel;
  title: string;
  description: string;
}

export const FEATURED_COURSES: FeaturedCourse[] = [
  {
    hobby: 'Guitar',
    level: 'beginner',
    title: 'Guitar',
    description: 'Chords, strumming, and your first songs — no reading music required.',
  },
  {
    hobby: 'Watercolor painting',
    level: 'beginner',
    title: 'Watercolor Painting',
    description: 'Build up from basic washes and color mixing to your first finished pieces.',
  },
  {
    hobby: 'Chess',
    level: 'beginner',
    title: 'Chess',
    description: 'Openings, tactics, and endgame basics to start winning more games.',
  },
  {
    hobby: 'Creative writing',
    level: 'beginner',
    title: 'Creative Writing',
    description: 'Character, voice, and structure — write your first complete short story.',
  },
  {
    hobby: 'Photography',
    level: 'beginner',
    title: 'Photography',
    description: 'Composition, light, and camera basics using whatever camera you already own.',
  },
  {
    hobby: 'Cooking',
    level: 'beginner',
    title: 'Cooking',
    description: 'Core knife skills and techniques that unlock hundreds of recipes.',
  },
  {
    hobby: 'Yoga',
    level: 'beginner',
    title: 'Yoga',
    description: 'Foundational poses and breathing, paced for a body that has never done yoga.',
  },
  {
    hobby: 'Piano',
    level: 'beginner',
    title: 'Piano',
    description: 'Hand position, scales, and reading enough music to play simple songs.',
  },
];


export function hobbiesMatch(a: string, b: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase();
  return normalize(a) === normalize(b);
}

const DEFAULT_TARGET_DAYS = 90;

export function defaultFeaturedTargetDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_TARGET_DAYS);
  return date.toISOString();
}
