import { renderHook, waitFor } from '@testing-library/react-native';
import { getChapterChecklist } from '../../../services/learningPlanApi';
import { useChapterChecklist } from './useChapterChecklist';

jest.mock('../../../services/learningPlanApi');

const mockGetChapterChecklist = getChapterChecklist as jest.Mock;

const plan = {
  _id: 'plan-1',
  hobby: 'Guitar',
  level: 'beginner' as const,
  targetDate: new Date().toISOString(),
  status: 'active' as const,
  chapters: [
    {
      _id: 'chapter-1',
      title: 'Basics',
      description: 'Learn the basics',
      order: 0,
      timeEstimateDays: 2,
      status: 'current' as const,
      checklistItems: [
        {
          _id: 'item-1',
          title: 'E minor chord',
          description: 'Learn the shape',
          modality: 'video' as const,
          required: true,
          order: 0,
          status: 'not_started' as const,
          youtubeVideoId: 'abc123',
        },
      ],
    },
  ],
};

describe('useChapterChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the chapter matching the given id', async () => {
    mockGetChapterChecklist.mockResolvedValue(plan);

    const { result } = renderHook(() => useChapterChecklist('plan-1', 'chapter-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetChapterChecklist).toHaveBeenCalledWith('plan-1', 'chapter-1');
    expect(result.current.chapter?.title).toBe('Basics');
    expect(result.current.chapter?.checklistItems).toHaveLength(1);
    expect(result.current.errorMessage).toBeNull();
  });

  it('surfaces an error message when loading fails', async () => {
    mockGetChapterChecklist.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useChapterChecklist('plan-1', 'chapter-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.chapter).toBeNull();
    expect(result.current.errorMessage).toBeTruthy();
  });
});
