import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { OngoingCourseSection } from './OngoingCourseSection';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

it('blocks new courses at the limit and enables adding after a course is removed', () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const courses = Array.from({ length: 5 }, (_, i) => ({
    planId: `${i}`, hobby: `Hobby ${i}`, levelLabel: 'Beginner', percentComplete: 0,
    currentChapterId: null, currentChapterTitle: null,
  }));
  const onRemoveCourse = jest.fn();
  const { rerender } = render(<OngoingCourseSection courses={courses} onRemoveCourse={onRemoveCourse} />);
  expect(screen.getByLabelText('Start a new course')).toHaveStyle({ opacity: 0.4 });
  fireEvent.press(screen.getByLabelText('Start a new course'));
  expect(mockPush).not.toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith('Course limit reached', 'Maximum 5 courses allowed at a time.');
  rerender(<OngoingCourseSection courses={courses.slice(0, 4)} onRemoveCourse={onRemoveCourse} />);
  fireEvent.press(screen.getByLabelText('Start a new course'));
  expect(mockPush).toHaveBeenCalledWith('/new-course');
  alert.mockRestore();
});
