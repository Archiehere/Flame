import { fireEvent, render, screen } from '@testing-library/react-native';
import { StepChecklist } from './StepChecklist';

describe('StepChecklist', () => {
  const steps = ['Sit with a straight back.', 'Rest the guitar on your leg.'];

  it('renders every step with a numbered marker', () => {
    render(<StepChecklist steps={steps} />);

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('Sit with a straight back.')).toBeTruthy();
    expect(screen.getByText('Rest the guitar on your leg.')).toBeTruthy();
  });

  it('toggles a step to done when tapped', () => {
    render(<StepChecklist steps={steps} />);

    const firstStep = screen.getByText('Sit with a straight back.');
    fireEvent.press(firstStep);

    expect(screen.getByRole('checkbox', { checked: true })).toBeTruthy();
    expect(screen.getByText('✓')).toBeTruthy();
  });
});
