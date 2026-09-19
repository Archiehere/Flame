import { fireEvent, render, screen } from '@testing-library/react-native';
import { updateUserName } from '../../../services/userApi';
import { OnboardingChatScreen } from './OnboardingChatScreen';

jest.mock('../../../services/userApi');

describe('OnboardingChatScreen', () => {
  beforeEach(() => {
    (updateUserName as jest.Mock).mockResolvedValue({ name: 'Ada' });
  });

  it('starts on the name step and walks through to the hobby step', async () => {
    render(<OnboardingChatScreen />);

    expect(screen.getByText(/What should I call you/)).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText('Your name'), 'Ada');
    fireEvent.press(screen.getByLabelText('Send'));

    expect(await screen.findByText(/What hobby do you want to learn/)).toBeTruthy();

    fireEvent.press(screen.getByText('Guitar'));

    expect(await screen.findByText(/current level/)).toBeTruthy();
  });
});
