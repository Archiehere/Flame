import { HobbyLevel } from '../onboarding/types';

export interface FeaturedCourse {
  hobby: string;
  level: HobbyLevel;
  title: string;
  description: string;
}

/**
 * A curated set of hobbies picked for how well they map onto Flame's
 * chapter + checklist structure: each has a clear skill progression, a mix
 * of text and demonstrable/video-friendly techniques, and a realistic
 * beginner starting point. Levels are set to whatever makes the most common
 * first-time learner successful for that hobby.
 */
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

/**
 * Matches two hobby strings so a course already in "Your courses" hides its
 * "+ Add" button in the featured list. Exact (case/whitespace-insensitive)
 * match only — substring/fuzzy matching caused false positives between
 * distinct hobbies, so a chat-created course only counts as the same hobby
 * when its name matches a featured course's name exactly.
 */
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
