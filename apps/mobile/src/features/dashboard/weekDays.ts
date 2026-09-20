import { DayTileState } from './components/DayTile';

export interface WeekDay {
  dayLetter: string;
  state: DayTileState;
  delta: string | null;
}

const SUNDAY_FIRST_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Builds a rolling window of `count` days ending today, from the real
 * currentStreak count. The window only ever looks backward (it always ends
 * on today), so every day in it that isn't part of the current streak is a
 * real past day — shown as "miss" rather than an ambiguous "pending",
 * since there's no such thing as a future day in this window.
 */
export function buildStreakDays(
  count: number,
  currentStreak: number,
  today: Date = new Date(),
): WeekDay[] {
  const filledCount = Math.max(0, Math.min(currentStreak, count));

  return Array.from({ length: count }, (_, i) => {
    const offsetFromToday = count - 1 - i;
    const date = new Date(today);
    date.setDate(date.getDate() - offsetFromToday);
    const dayLetter = SUNDAY_FIRST_LETTERS[date.getDay()];
    const isFilled = offsetFromToday < filledCount;

    if (!isFilled) {
      return { dayLetter, state: 'miss' as const, delta: null };
    }
    return {
      dayLetter,
      state: offsetFromToday === 0 ? ('streak' as const) : ('done' as const),
      delta: '+1',
    };
  });
}

/**
 * Turns a day-by-day delta preview (+1/miss) into a cumulative streak
 * points series. Every day in the window is kept (missed days simply add
 * 0), so the chart always has multiple points — a flat line at 0 when the
 * streak is 0, ramping up only across the real streak days — rather than
 * collapsing to a single dot with nothing to draw a line between.
 */
export function toCumulativePoints(days: WeekDay[]): { labels: string[]; points: number[] } {
  let total = 0;
  const points = days.map((day) => {
    total += day.delta === '+1' ? 1 : 0;
    return total;
  });
  return { labels: days.map((d) => d.dayLetter), points };
}
