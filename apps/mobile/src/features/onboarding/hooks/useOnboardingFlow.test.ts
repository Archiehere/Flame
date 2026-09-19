import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  approveLearningPlan,
  createLearningPlan,
  reviseLearningPlanChapters,
  updateLearningPlanChapters,
} from '../../../services/learningPlanApi';
import { getCurrentUser, updateUserName } from '../../../services/userApi';
import { useOnboardingFlow } from './useOnboardingFlow';

jest.mock('../../../services/learningPlanApi');
jest.mock('../../../services/userApi');

const mockCreateLearningPlan = createLearningPlan as jest.Mock;
const mockUpdateLearningPlanChapters = updateLearningPlanChapters as jest.Mock;
const mockReviseLearningPlanChapters = reviseLearningPlanChapters as jest.Mock;
const mockApproveLearningPlan = approveLearningPlan as jest.Mock;
const mockUpdateUserName = updateUserName as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;

const samplePlan = {
  _id: 'plan-1',
  hobby: 'Guitar',
  level: 'beginner' as const,
  targetDate: new Date().toISOString(),
  status: 'draft' as const,
  chapters: [
    {
      _id: 'c1',
      title: 'Basics',
      description: 'desc',
      order: 0,
      timeEstimateDays: 3,
      status: 'locked' as const,
    },
  ],
};

async function advanceToSyllabus(result: { current: ReturnType<typeof useOnboardingFlow> }) {
  await waitFor(() => expect(result.current.step).toBe('name'));
  act(() => result.current.selectName('Ada'));
  act(() => result.current.selectHobby('Guitar'));
  act(() => result.current.selectLevel('beginner'));
  await act(async () => {
    await result.current.selectTargetDate(new Date().toISOString(), '3 months');
  });
}

describe('useOnboardingFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateUserName.mockResolvedValue({ name: 'Ada' });
    mockGetCurrentUser.mockResolvedValue({ name: null, currentStreak: 0 });
  });

  it('walks through name, hobby, level, and target date before generating a plan', async () => {
    mockCreateLearningPlan.mockResolvedValue(samplePlan);
    const { result } = renderHook(() => useOnboardingFlow());

    await waitFor(() => expect(result.current.step).toBe('name'));
    act(() => result.current.selectName('Ada'));
    expect(result.current.step).toBe('hobby');
    expect(mockUpdateUserName).toHaveBeenCalledWith('Ada');

    act(() => result.current.selectHobby('Guitar'));
    expect(result.current.step).toBe('level');

    act(() => result.current.selectLevel('beginner'));
    expect(result.current.step).toBe('target-date');

    await act(async () => {
      await result.current.selectTargetDate(new Date().toISOString(), '3 months');
    });

    expect(mockCreateLearningPlan).toHaveBeenCalledWith(
      expect.objectContaining({ hobby: 'Guitar', level: 'beginner' }),
    );
    expect(result.current.step).toBe('syllabus');
    expect(result.current.plan).toEqual(samplePlan);
    expect(result.current.targetDateLabel).toBe('3 months');
  });

  it('skips the name step and pre-fills the name for a returning user', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 3 });
    const { result } = renderHook(() => useOnboardingFlow());

    await waitFor(() => expect(result.current.step).toBe('hobby'));

    expect(result.current.name).toBe('Ada');
    expect(result.current.isReturningUser).toBe(true);
  });

  it('moves to the error step when plan generation fails', async () => {
    mockCreateLearningPlan.mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useOnboardingFlow());

    await advanceToSyllabus(result);

    expect(result.current.step).toBe('error');
    expect(result.current.errorMessage).toBeTruthy();
  });

  it('retries plan generation without losing prior answers', async () => {
    mockCreateLearningPlan.mockRejectedValueOnce(new Error('network error'));
    const { result } = renderHook(() => useOnboardingFlow());

    await advanceToSyllabus(result);
    expect(result.current.step).toBe('error');
    expect(result.current.name).toBe('Ada');
    expect(result.current.hobby).toBe('Guitar');

    mockCreateLearningPlan.mockResolvedValueOnce(samplePlan);
    await act(async () => {
      await result.current.retryGeneratePlan();
    });

    expect(mockCreateLearningPlan).toHaveBeenCalledTimes(2);
    expect(result.current.step).toBe('syllabus');
    expect(result.current.name).toBe('Ada');
    expect(result.current.hobby).toBe('Guitar');
  });

  it('revises chapters via reviseChapters and updates the plan', async () => {
    mockCreateLearningPlan.mockResolvedValue(samplePlan);
    const revisedPlan = {
      ...samplePlan,
      chapters: [
        ...samplePlan.chapters,
        {
          _id: 'c2',
          title: 'Chords',
          description: 'Learn chords',
          order: 1,
          timeEstimateDays: 4,
          status: 'locked' as const,
        },
      ],
    };
    mockReviseLearningPlanChapters.mockResolvedValue(revisedPlan);

    const { result } = renderHook(() => useOnboardingFlow());
    await advanceToSyllabus(result);

    let returnedChapters: unknown;
    await act(async () => {
      returnedChapters = await result.current.reviseChapters('Add a chapter about chords');
    });

    expect(mockReviseLearningPlanChapters).toHaveBeenCalledWith(
      'plan-1',
      'Add a chapter about chords',
    );
    expect(result.current.plan).toEqual(revisedPlan);
    expect(returnedChapters).toEqual([
      { title: 'Basics', description: 'desc', order: 0, timeEstimateDays: 3 },
      { title: 'Chords', description: 'Learn chords', order: 1, timeEstimateDays: 4 },
    ]);
  });

  it('saves chapters and approves the plan on submitAndApprove', async () => {
    mockCreateLearningPlan.mockResolvedValue(samplePlan);
    mockUpdateLearningPlanChapters.mockResolvedValue(samplePlan);
    mockApproveLearningPlan.mockResolvedValue({ ...samplePlan, status: 'active' });

    const { result } = renderHook(() => useOnboardingFlow());

    await advanceToSyllabus(result);

    await act(async () => {
      await result.current.submitAndApprove([
        { title: 'Basics', description: 'desc', order: 0, timeEstimateDays: 3 },
      ]);
    });

    expect(mockUpdateLearningPlanChapters).toHaveBeenCalledWith('plan-1', [
      { title: 'Basics', description: 'desc', order: 0, timeEstimateDays: 3 },
    ]);
    expect(mockApproveLearningPlan).toHaveBeenCalledWith('plan-1');
    await waitFor(() => expect(result.current.step).toBe('approved'));
  });
});
