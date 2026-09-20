import { renderHook, waitFor } from '@testing-library/react-native';
import { getLearningPlan } from '../../../services/learningPlanApi';
import { useCourseDetail } from './useCourseDetail';

jest.mock('../../../services/learningPlanApi');
jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]),
}));

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
      description: 'd',
      order: 0,
      timeEstimateDays: 2,
      status: 'completed' as const,
      checklistItems: [],
    },
    {
      _id: 'c2',
      title: 'Chords',
      description: 'd',
      order: 1,
      timeEstimateDays: 3,
      status: 'current' as const,
      checklistItems: [],
    },
  ],
};

describe('useCourseDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the plan for the given id', async () => {
    mockGetLearningPlan.mockResolvedValue(plan);

    const { result } = renderHook(() => useCourseDetail('plan-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetLearningPlan).toHaveBeenCalledWith('plan-1');
    expect(result.current.plan).toEqual(plan);
    expect(result.current.errorMessage).toBeNull();
  });

  it('surfaces an error message when loading fails', async () => {
    mockGetLearningPlan.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useCourseDetail('plan-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.plan).toBeNull();
    expect(result.current.errorMessage).toBeTruthy();
  });
});
