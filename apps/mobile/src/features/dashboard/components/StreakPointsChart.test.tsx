import { render, screen } from '@testing-library/react-native';
import { StreakPointsChart } from './StreakPointsChart';

describe('StreakPointsChart', () => {
  it('renders a label for every data point', () => {
    render(<StreakPointsChart labels={['M', 'T', 'W']} points={[-1, 0, 1]} />);

    expect(screen.getByText('M')).toBeTruthy();
    expect(screen.getByText('T')).toBeTruthy();
    expect(screen.getByText('W')).toBeTruthy();
  });

  it('renders without crashing for a single data point', () => {
    render(<StreakPointsChart labels={['M']} points={[1]} />);

    expect(screen.getByText('M')).toBeTruthy();
  });
});
