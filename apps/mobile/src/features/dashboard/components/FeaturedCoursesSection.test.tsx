import { fireEvent, render, screen } from '@testing-library/react-native';
import { CourseSummary } from '../hooks/useDashboard';
import { FeaturedCoursesSection } from './FeaturedCoursesSection';

function course(hobby: string): CourseSummary {
  return {
    planId: hobby,
    hobby,
    levelLabel: 'Complete beginner',
    percentComplete: 0,
    currentChapterId: null,
    currentChapterTitle: null,
  };
}

describe('FeaturedCoursesSection', () => {
  it('shows an add button for a featured course not already added', () => {
    render(<FeaturedCoursesSection courses={[]} onAddCourse={jest.fn()} />);

    expect(screen.getByLabelText('Add Guitar to your courses')).toBeTruthy();
  });

  it('hides the add button and shows an added badge when the hobby exactly matches an active course', () => {
    render(<FeaturedCoursesSection courses={[course('Guitar')]} onAddCourse={jest.fn()} />);

    expect(screen.queryByLabelText('Add Guitar to your courses')).toBeNull();
    expect(screen.getAllByText('✓ In your courses').length).toBeGreaterThan(0);
  });

  it('still shows the add button when the active course hobby only loosely resembles a featured one', () => {
    render(
      <FeaturedCoursesSection
        courses={[course('Learn acoustic guitar')]}
        onAddCourse={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Add Guitar to your courses')).toBeTruthy();
  });

  it('calls onAddCourse with the featured hobby and level when the add button is pressed', async () => {
    const onAddCourse = jest.fn().mockResolvedValue(undefined);
    render(<FeaturedCoursesSection courses={[]} onAddCourse={onAddCourse} />);

    fireEvent.press(screen.getByLabelText('Add Guitar to your courses'));

    expect(onAddCourse).toHaveBeenCalledWith('Guitar', 'beginner');
  });
});
