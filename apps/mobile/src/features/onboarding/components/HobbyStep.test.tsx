import { fireEvent, render, screen } from '@testing-library/react-native';
import { extractHobby } from '../../../services/learningPlanApi';
import { HobbyStep } from './HobbyStep';

jest.mock('../../../services/learningPlanApi');

const mockExtractHobby = extractHobby as jest.Mock;

describe('HobbyStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('selects a suggested hobby directly, without calling the extraction API', () => {
    const onSelect = jest.fn();
    render(<HobbyStep name="Ada" isReturningUser={false} onSelect={onSelect} />);

    fireEvent.press(screen.getByText('Guitar'));

    expect(onSelect).toHaveBeenCalledWith('Guitar');
    expect(mockExtractHobby).not.toHaveBeenCalled();
  });

  it('extracts a clean hobby name and notes from free-text input', async () => {
    mockExtractHobby.mockResolvedValue({
      hobby: 'Skating',
      notes: undefined,
    });
    const onSelect = jest.fn();
    render(<HobbyStep name="Ada" isReturningUser={false} onSelect={onSelect} />);

    const input = screen.getByPlaceholderText('Or type your own...');
    fireEvent.changeText(input, "Lets go with skating");
    fireEvent(input, 'submitEditing');

    expect(mockExtractHobby).toHaveBeenCalledWith("Lets go with skating");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSelect).toHaveBeenCalledWith('Skating', undefined, "Lets go with skating");
  });

  it('passes along extracted notes when the user volunteers extra context', async () => {
    mockExtractHobby.mockResolvedValue({
      hobby: 'Skateboarding',
      notes: 'Wants skateboarding specifically, not rollerblading',
    });
    const onSelect = jest.fn();
    render(<HobbyStep name="Ada" isReturningUser={false} onSelect={onSelect} />);

    const input = screen.getByPlaceholderText('Or type your own...');
    fireEvent.changeText(input, 'I want to learn skateboarding, not rollerblading');
    fireEvent(input, 'submitEditing');

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSelect).toHaveBeenCalledWith(
      'Skateboarding',
      'Wants skateboarding specifically, not rollerblading',
      'I want to learn skateboarding, not rollerblading',
    );
  });

  it('falls back to the raw trimmed text when extraction fails', async () => {
    mockExtractHobby.mockRejectedValue(new Error('network error'));
    const onSelect = jest.fn();
    render(<HobbyStep name="Ada" isReturningUser={false} onSelect={onSelect} />);

    const input = screen.getByPlaceholderText('Or type your own...');
    fireEvent.changeText(input, '  skating  ');
    fireEvent(input, 'submitEditing');

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onSelect).toHaveBeenCalledWith('skating');
  });
});
