import { fireEvent, render, screen } from '@testing-library/react-native';
import { CounterScreen } from './CounterScreen';

describe('CounterScreen', () => {
  it('renders starting count and increments on press', () => {
    render(<CounterScreen />);

    expect(screen.getByText('0')).toBeTruthy();

    fireEvent.press(screen.getByText('+'));

    expect(screen.getByText('1')).toBeTruthy();
  });

  it('does not go below zero', () => {
    render(<CounterScreen />);

    fireEvent.press(screen.getByText('-'));

    expect(screen.getByText('0')).toBeTruthy();
  });
});
