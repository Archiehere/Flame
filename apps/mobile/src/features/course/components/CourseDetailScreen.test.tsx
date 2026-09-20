import { fireEvent, render, screen } from '@testing-library/react-native';
import { getLearningPlan } from '../../../services/learningPlanApi';
import { CourseDetailScreen } from './CourseDetailScreen';

jest.mock('../../../services/learningPlanApi');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), canGoBack: () => false }),
  useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]),
}));

const mockPush = jest.fn();
const mockGetLearningPlan = getLearningPlan as jest.Mock;

const plan = {
  _id: 'plan-1',
  hobby: 'Guitar',
  level: 'beginner' as const,
  targetDate: new Date().toISOString(),
  status: 'active' as const,
  chapters: [
    {
      _id: 'c1',
      title: 'Basics',
      description: 'Learn the basics',
      order: 0,
      timeEstimateDays: 2,
      status: 'completed' as const,
      checklistItems: [],
    },
    {
      _id: 'c2',
      title: 'Chords',
      description: 'Learn chords',
      order: 1,
      timeEstimateDays: 3,
      status: 'current' as const,
      checklistItems: [],
    },
    {
      _id: 'c3',
      title: 'Strumming',
      description: 'Learn strumming',
      order: 2,
      timeEstimateDays: 3,
      status: 'locked' as const,
      checklistItems: [],
    },
  ],
};

describe('CourseDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the progress ring, resume button, and chapter list', async () => {
    mockGetLearningPlan.mockResolvedValue(plan);

    render(<CourseDetailScreen planId="plan-1" />);

    expect(await screen.findByText('Learning Guitar')).toBeTruthy();
    expect(screen.getByText('33%')).toBeTruthy();
    expect(screen.getByText('1/3 chapters')).toBeTruthy();
    expect(screen.getByText('Resume: Chords')).toBeTruthy();
    expect(screen.getByText('Basics')).toBeTruthy();
    expect(screen.getByText('Chords')).toBeTruthy();
    expect(screen.getByText('Strumming')).toBeTruthy();
  });

  it('navigates to a chapter when an unlocked chapter is tapped', async () => {
    mockGetLearningPlan.mockResolvedValue(plan);

    render(<CourseDetailScreen planId="plan-1" />);

    fireEvent.press(await screen.findByText('Basics'));

    expect(mockPush).toHaveBeenCalledWith('/chapter/plan-1/c1');
  });

  it('does not navigate when a locked chapter is tapped', async () => {
    mockGetLearningPlan.mockResolvedValue(plan);

    render(<CourseDetailScreen planId="plan-1" />);

    fireEvent.press(await screen.findByText('Strumming'));

    expect(mockPush).not.toHaveBeenCalledWith('/chapter/plan-1/c3');
  });

  it('shows an error state with a retry option when loading fails', async () => {
    mockGetLearningPlan.mockRejectedValue(new Error('network error'));

    render(<CourseDetailScreen planId="plan-1" />);

    expect(await screen.findByText(/Couldn't load this course/)).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
