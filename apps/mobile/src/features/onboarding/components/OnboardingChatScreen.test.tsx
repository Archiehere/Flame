import { fireEvent, render, screen } from '@testing-library/react-native';
import { getCurrentUser, updateUserName } from '../../../services/userApi';
import { OnboardingChatScreen } from './OnboardingChatScreen';

jest.mock('../../../services/userApi');

const mockGetCurrentUser = getCurrentUser as jest.Mock;

describe('OnboardingChatScreen', () => {
  beforeEach(() => {
    (updateUserName as jest.Mock).mockResolvedValue({ name: 'Ada' });
  });

  it('starts on the name step and walks through to the hobby step', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: null, currentStreak: 0 });
    render(<OnboardingChatScreen />);

    expect(await screen.findByText(/What should I call you/)).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Your name'), 'Ada');
    fireEvent.press(screen.getByLabelText('Send'));

    expect(await screen.findByText(/What hobby do you want to learn/)).toBeTruthy();

    fireEvent.press(screen.getByText('Guitar'));

    expect(await screen.findByText(/current level/)).toBeTruthy();
  });

  it('skips the name question for a returning user', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 2 });
    render(<OnboardingChatScreen />);

    expect(await screen.findByText(/Welcome back, Ada/)).toBeTruthy();
    expect(screen.queryByText(/What should I call you/)).toBeNull();
  });
});
