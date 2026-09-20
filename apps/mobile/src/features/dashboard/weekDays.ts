import { DayTileState } from './components/DayTile';

export interface WeekDay {
  dayLetter: string;
  state: DayTileState;
  delta: string | null;
}

const SUNDAY_FIRST_LETTERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

export interface MonthGrid {
  daysInMonth: number;
  /** 0 = Monday .. 6 = Sunday, for laying out the leading blanks. */
  startWeekday: number;
}

/** Pure calendar geometry for any month — no streak data attached. */
export function getMonthGrid(year: number, month: number): MonthGrid {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const jsWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const startWeekday = (jsWeekday + 6) % 7; // convert to 0 = Monday
  return { daysInMonth, startWeekday };
}

export function getMonthLabel(month: number): string {
  return new Date(2000, month, 1).toLocaleString('en-US', { month: 'long' });
}

export interface MonthCalendar extends MonthGrid {
  year: number;
  month: number;
  monthLabel: string;
  todayDate: number;
  /** Day-of-month numbers that fall within the current streak's run. */
  filledDates: Set<number>;
}

/**
 * Builds the current calendar month, marking which dates fall within the
 * trailing currentStreak run (ending today). A streak that started in a
 * previous month is clipped at the 1st — we only have a single running
 * count, not real per-day history, so we can't know which earlier-month
 * dates were actually active.
 */
export function buildMonthCalendar(
  currentStreak: number,
  today: Date = new Date(),
): MonthCalendar {
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  const filledDates = new Set<number>();
  for (let i = 0; i < currentStreak; i += 1) {
    const date = todayDate - i;
    if (date < 1) {
      break;
    }
    filledDates.add(date);
  }

  return {
    year,
    month,
    monthLabel: getMonthLabel(month),
    todayDate,
    filledDates,
    ...getMonthGrid(year, month),
  };
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
