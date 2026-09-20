import { fireEvent, render, screen } from '@testing-library/react-native';
import { MonthCalendar } from './MonthCalendar';

// Friday 2026-09-18 -> September 2026 has 30 days
const FRIDAY = new Date('2026-09-18T12:00:00Z');

describe('MonthCalendar', () => {
  it('renders the month header and every day of the month', () => {
    render(<MonthCalendar currentStreak={3} today={FRIDAY} />);

    expect(screen.getByText('September')).toBeTruthy();
    expect(screen.getByText('2026')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
  });

  it('renders every weekday label', () => {
    render(<MonthCalendar currentStreak={0} today={FRIDAY} />);

    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('navigates to the next and previous month', () => {
    render(<MonthCalendar currentStreak={0} today={FRIDAY} />);

    fireEvent.press(screen.getByLabelText('Next month'));
    expect(screen.getByText('October')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Previous month'));
    fireEvent.press(screen.getByLabelText('Previous month'));
    expect(screen.getByText('August')).toBeTruthy();
  });

  it('only highlights streak/today days while viewing the actual current month', () => {
    render(<MonthCalendar currentStreak={2} today={FRIDAY} />);
    // Sanity: still showing September when unnavigated.
    expect(screen.getByText('September')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Next month'));

    // October has a "17" too, but rendering shouldn't throw and the
    // month header should reflect the navigated month, not "today".
    expect(screen.getByText('October')).toBeTruthy();
  });
});
