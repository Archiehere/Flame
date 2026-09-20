import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  completeChapter,
  getChapterChecklist,
  toggleChecklistItem,
} from '../../../services/learningPlanApi';
import { useChapterChecklist } from './useChapterChecklist';

jest.mock('../../../services/learningPlanApi');

const mockGetChapterChecklist = getChapterChecklist as jest.Mock;
const mockCompleteChapter = completeChapter as jest.Mock;
const mockToggleChecklistItem = toggleChecklistItem as jest.Mock;

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
    {
      _id: 'chapter-2',
      title: 'Chords',
      description: 'Learn open chords',
      order: 1,
      timeEstimateDays: 3,
      status: 'locked' as const,
      checklistItems: [],
    },
  ],
};

const generatingPlan = {
  ...plan,
  chapters: [{ ...plan.chapters[0], checklistItems: [] }, plan.chapters[1]],
};

describe('useChapterChecklist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the chapter matching the given id when the checklist is ready', async () => {
    mockGetChapterChecklist.mockResolvedValue({ plan, generating: false });

    const { result } = renderHook(() => useChapterChecklist('plan-1', 'chapter-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetChapterChecklist).toHaveBeenCalledWith('plan-1', 'chapter-1');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.chapter?.title).toBe('Basics');
    expect(result.current.chapter?.checklistItems).toHaveLength(1);
    expect(result.current.nextChapterId).toBe('chapter-2');
    expect(result.current.errorMessage).toBeNull();
  });

  it('polls while the checklist is still generating, then resolves once ready', async () => {
    jest.useFakeTimers();
    mockGetChapterChecklist
      .mockResolvedValueOnce({ plan: generatingPlan, generating: true })
      .mockResolvedValueOnce({ plan, generating: false });

    const { result } = renderHook(() => useChapterChecklist('plan-1', 'chapter-1'));

    await waitFor(() => expect(result.current.isGenerating).toBe(true));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBeNull();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(mockGetChapterChecklist).toHaveBeenCalledTimes(2);
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.chapter?.checklistItems).toHaveLength(1);

    jest.useRealTimers();
  });

  it('retries transparently on a network failure before surfacing an error message', async () => {
    jest.useFakeTimers();
    mockGetChapterChecklist.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useChapterChecklist('plan-1', 'chapter-1'));

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1500);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });

    expect(mockGetChapterChecklist).toHaveBeenCalledTimes(3);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.chapter).toBeNull();
    expect(result.current.errorMessage).toBeTruthy();

    jest.useRealTimers();
  });

  it('marks the chapter complete and reloads', async () => {
    const updatedPlan = {
      ...plan,
      chapters: [
        { ...plan.chapters[0], status: 'completed' as const },
        { ...plan.chapters[1], status: 'current' as const },
      ],
    };
    mockGetChapterChecklist
      .mockResolvedValueOnce({ plan, generating: false })
      .mockResolvedValueOnce({ plan: updatedPlan, generating: false });
    mockCompleteChapter.mockResolvedValue(updatedPlan);

    const { result } = renderHook(() => useChapterChecklist('plan-1', 'chapter-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.markComplete();
    });

    expect(mockCompleteChapter).toHaveBeenCalledWith('plan-1', 'chapter-1');
    expect(result.current.chapter?.status).toBe('completed');
    expect(result.current.isCompleting).toBe(false);
  });

  describe('toggleItem', () => {
    it('optimistically flips the item status and persists it', async () => {
      mockGetChapterChecklist.mockResolvedValue({ plan, generating: false });
      mockToggleChecklistItem.mockResolvedValue(plan);

      const { result } = renderHook(() => useChapterChecklist('plan-1', 'chapter-1'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.chapter?.checklistItems[0]?.status).toBe('not_started');

      await act(async () => {
        await result.current.toggleItem('item-1');
      });

      expect(mockToggleChecklistItem).toHaveBeenCalledWith('plan-1', 'chapter-1', 'item-1');
      expect(result.current.chapter?.checklistItems[0]?.status).toBe('mastered');
    });

    it('rolls back the optimistic update when the request fails', async () => {
      mockGetChapterChecklist.mockResolvedValue({ plan, generating: false });
      mockToggleChecklistItem.mockRejectedValue(new Error('network error'));

      const { result } = renderHook(() => useChapterChecklist('plan-1', 'chapter-1'));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.toggleItem('item-1');
      });

      expect(result.current.chapter?.checklistItems[0]?.status).toBe('not_started');
    });
  });
});
