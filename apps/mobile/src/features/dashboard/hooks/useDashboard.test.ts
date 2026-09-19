import { renderHook, waitFor } from '@testing-library/react-native';
import { getActiveLearningPlans } from '../../../services/learningPlanApi';
import { getCurrentUser } from '../../../services/userApi';
import { useDashboard } from './useDashboard';

jest.mock('../../../services/learningPlanApi');
jest.mock('../../../services/userApi');

const mockGetActiveLearningPlans = getActiveLearningPlans as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;

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
      status: 'current' as const,
    },
    {
      _id: 'c2',
      title: 'Chords',
      description: 'd',
      order: 1,
      timeEstimateDays: 3,
      status: 'locked' as const,
    },
  ],
};

const secondPlan = {
  ...plan,
  _id: 'plan-2',
  hobby: 'Chess',
};

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the user and derives a course summary from the active plan', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 0 });
    mockGetActiveLearningPlans.mockResolvedValue([plan]);

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toEqual({ name: 'Ada', currentStreak: 0 });
    expect(result.current.courses).toEqual([
      {
        planId: 'plan-1',
        hobby: 'Guitar',
        levelLabel: 'Complete beginner',
        percentComplete: 0,
        currentChapterTitle: 'Basics',
      },
    ]);
    expect(result.current.errorMessage).toBeNull();
  });

  it('derives a course summary for every active plan', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 0 });
    mockGetActiveLearningPlans.mockResolvedValue([plan, secondPlan]);

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.courses).toHaveLength(2);
    expect(result.current.courses.map((c) => c.hobby)).toEqual(['Guitar', 'Chess']);
  });

  it('reports no courses when there is no active plan', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 0 });
    mockGetActiveLearningPlans.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.courses).toEqual([]);
  });

  it('surfaces an error message when loading fails', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('network error'));
    mockGetActiveLearningPlans.mockResolvedValue([]);

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.errorMessage).toBeTruthy();
  });
});
