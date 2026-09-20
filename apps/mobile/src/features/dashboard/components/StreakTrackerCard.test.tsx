import { fireEvent, render, screen } from '@testing-library/react-native';
import { StreakTrackerCard } from './StreakTrackerCard';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), canGoBack: () => false }),
}));

describe('StreakTrackerCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the streak screen when pressed', () => {
    render(<StreakTrackerCard currentStreak={0} />);

    fireEvent.press(screen.getByLabelText('View your streak'));

    expect(mockPush).toHaveBeenCalledWith('/streak');
  });

  it('fills in as many of the 7 tiles as the current streak, capped at 7', () => {
    render(<StreakTrackerCard currentStreak={2} />);

    expect(screen.getByText('Streak')).toBeTruthy();
    expect(screen.getAllByText('Done')).toHaveLength(1);
    expect(screen.getAllByText('Miss')).toHaveLength(5);
  });

  it('shows no filled tiles when there is no active streak', () => {
    render(<StreakTrackerCard currentStreak={0} />);

    expect(screen.queryByText('Streak')).toBeNull();
    expect(screen.queryByText('Done')).toBeNull();
    expect(screen.getAllByText('Miss')).toHaveLength(7);
  });

  it('never fills more than the 7 visible tiles', () => {
    render(<StreakTrackerCard currentStreak={30} />);

    expect(screen.getByText('Streak')).toBeTruthy();
    expect(screen.getAllByText('Done')).toHaveLength(6);
    expect(screen.queryByText('Miss')).toBeNull();
  });
});
