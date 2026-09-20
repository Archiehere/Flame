import { buildStreakDays, toCumulativePoints, WeekDay } from './weekDays';

describe('buildStreakDays', () => {
  it('fills only the most recent `currentStreak` days, ending today', () => {
    // Friday 2026-09-18
    const friday = new Date('2026-09-18T12:00:00Z');

    const days = buildStreakDays(4, 2, friday);

    expect(days).toHaveLength(4);
    expect(days.map((d) => d.dayLetter)).toEqual(['T', 'W', 'T', 'F']);
    expect(days[0]).toEqual({ dayLetter: 'T', state: 'miss', delta: null });
    expect(days[1]).toEqual({ dayLetter: 'W', state: 'miss', delta: null });
    expect(days[2]).toEqual({ dayLetter: 'T', state: 'done', delta: '+1' });
    expect(days[3]).toEqual({ dayLetter: 'F', state: 'streak', delta: '+1' });
  });

  it('marks nothing as filled when the current streak is 0', () => {
    const friday = new Date('2026-09-18T12:00:00Z');

    const days = buildStreakDays(4, 0, friday);

    expect(days.every((d) => d.state === 'miss' && d.delta === null)).toBe(true);
  });

  it('never fills more than the window size even for a long streak', () => {
    const friday = new Date('2026-09-18T12:00:00Z');

    const days = buildStreakDays(4, 30, friday);

    expect(days.every((d) => d.delta === '+1')).toBe(true);
    expect(days[3].state).toBe('streak');
  });
});

describe('toCumulativePoints', () => {
  it('produces a flat line at 0 when nothing is filled', () => {
    const days: WeekDay[] = [
      { dayLetter: 'T', state: 'miss', delta: null },
      { dayLetter: 'W', state: 'miss', delta: null },
      { dayLetter: 'F', state: 'miss', delta: null },
    ];

    const { labels, points } = toCumulativePoints(days);

    expect(labels).toEqual(['T', 'W', 'F']);
    expect(points).toEqual([0, 0, 0]);
  });

  it('ramps up across the filled trailing days', () => {
    const days: WeekDay[] = [
      { dayLetter: 'T', state: 'miss', delta: null },
      { dayLetter: 'W', state: 'done', delta: '+1' },
      { dayLetter: 'F', state: 'streak', delta: '+1' },
    ];

    const { points } = toCumulativePoints(days);

    expect(points).toEqual([0, 1, 2]);
  });
});
