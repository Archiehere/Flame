import { render, screen } from '@testing-library/react-native';
import { getCurrentUser } from '../../../services/userApi';
import { StreakScreen } from './StreakScreen';

jest.mock('../../../services/userApi');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), canGoBack: () => false }),
}));

const mockGetCurrentUser = getCurrentUser as jest.Mock;

describe('StreakScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the current streak count and points chart when the streak is active', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 5 });

    render(<StreakScreen />);

    expect(await screen.findByText('5')).toBeTruthy();
    expect(screen.getByText('day streak')).toBeTruthy();
    expect(screen.getByText("You're on a roll — keep it going!")).toBeTruthy();
  });

  it('shows a reset message when there is no active streak', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 0 });

    render(<StreakScreen />);

    expect(await screen.findByText('0')).toBeTruthy();
    expect(
      screen.getByText('Your streak reset. Finish a lesson today to start a new one.'),
    ).toBeTruthy();
  });
});
