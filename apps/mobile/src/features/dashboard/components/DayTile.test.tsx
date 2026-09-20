import { render, screen } from '@testing-library/react-native';
import { DayTile } from './DayTile';

describe('DayTile', () => {
  it('renders the weekday letter and label for a done day', () => {
    render(<DayTile dayLetter="M" state="done" />);

    expect(screen.getByText('M')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('renders the streak label for the streak day', () => {
    render(<DayTile dayLetter="T" state="streak" />);

    expect(screen.getByText('Streak')).toBeTruthy();
  });

  it('renders the miss label', () => {
    render(<DayTile dayLetter="F" state="miss" />);

    expect(screen.getByText('Miss')).toBeTruthy();
  });
});
