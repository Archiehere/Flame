import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { CourseSummary } from '../hooks/useDashboard';
import { FeaturedCoursesSection } from './FeaturedCoursesSection';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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
  afterEach(() => jest.restoreAllMocks());

  it('previews a course and adds it from the sheet', async () => {
    const onAddCourse = jest.fn().mockResolvedValue(undefined);
    render(<FeaturedCoursesSection courses={[]} onAddCourse={onAddCourse} />);
    fireEvent.press(screen.getByLabelText('Preview Guitar'));
    expect(screen.getByText('Your learning journey')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Add Guitar from preview'));
    await waitFor(() => expect(screen.queryByText('COURSE PREVIEW')).toBeNull());
    expect(onAddCourse).toHaveBeenCalledWith('Guitar', 'beginner');
  });

  it('blocks adding at five courses from the card and preview', () => {
    const alert = jest.spyOn(Alert, 'alert');
    const onAddCourse = jest.fn();
    render(<FeaturedCoursesSection courses={Array.from({ length: 5 }, (_, i) => course(`Hobby ${i}`))} onAddCourse={onAddCourse} />);
    const button = screen.getByLabelText('Add Guitar to your courses');
    expect(button).toHaveStyle({ opacity: 0.4 });
    fireEvent.press(button);
    fireEvent.press(screen.getByLabelText('Preview Guitar'));
    fireEvent.press(screen.getByLabelText('Add Guitar from preview'));
    expect(alert).toHaveBeenCalledTimes(2);
    expect(alert).toHaveBeenCalledWith('Course limit reached', 'Maximum 5 courses allowed at a time.');
    expect(onAddCourse).not.toHaveBeenCalled();
  });

  it('dismisses a preview without adding a course', () => {
    const onAddCourse = jest.fn();
    render(<FeaturedCoursesSection courses={[]} onAddCourse={onAddCourse} />);
    fireEvent.press(screen.getByLabelText('Preview Guitar'));
    fireEvent.press(screen.getByLabelText('Close course preview'));
    expect(screen.queryByText('COURSE PREVIEW')).toBeNull();
    expect(onAddCourse).not.toHaveBeenCalled();
  });

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

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Add Guitar to your courses'));
    });

    expect(onAddCourse).toHaveBeenCalledWith('Guitar', 'beginner');
  });
});
