import { act, fireEvent, render, screen } from '@testing-library/react-native';
import {
  completeChapter,
  getChapterChecklist,
  toggleChecklistItem,
} from '../../../services/learningPlanApi';
import { ChapterChecklistScreen } from './ChapterChecklistScreen';

jest.mock('../../../services/learningPlanApi');
jest.mock('react-native-webview', () => ({
  __esModule: true,
  default: require('react-native').View,
}));

const mockGetChapterChecklist = getChapterChecklist as jest.Mock;
const mockCompleteChapter = completeChapter as jest.Mock;
const mockToggleChecklistItem = toggleChecklistItem as jest.Mock;

describe('ChapterChecklistScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chapter details and expands an item to show its content', async () => {
    mockGetChapterChecklist.mockResolvedValue({
      generating: false,
      plan: {
        _id: 'plan-1',
        hobby: 'Guitar',
        level: 'beginner',
        targetDate: new Date().toISOString(),
        status: 'active',
        chapters: [
          {
            _id: 'chapter-1',
            title: 'Basics',
            description: 'Learn the basics',
            order: 0,
            timeEstimateDays: 2,
            status: 'current',
            checklistItems: [
              {
                _id: 'item-1',
                title: 'Chord theory',
                description: 'Why chords work',
                modality: 'text',
                required: false,
                order: 0,
                status: 'not_started',
                textContent: 'A chord is built from stacked thirds.',
              },
              {
                _id: 'item-2',
                title: 'Sitting posture',
                description: 'How to sit while playing',
                modality: 'text',
                required: true,
                order: 1,
                status: 'not_started',
                steps: ['Sit with a straight back.', 'Rest the guitar on your leg.'],
              },
            ],
          },
        ],
      },
    });

    render(<ChapterChecklistScreen planId="plan-1" chapterId="chapter-1" />);

    expect(await screen.findByText('Basics')).toBeTruthy();
    expect(screen.getByText('Chord theory')).toBeTruthy();
    expect(screen.queryByText('A chord is built from stacked thirds.')).toBeNull();

    fireEvent.press(screen.getByText('Chord theory'));

    expect(await screen.findByText('A chord is built from stacked thirds.')).toBeTruthy();

    fireEvent.press(screen.getByText('Sitting posture'));

    expect(await screen.findByText('Sit with a straight back.')).toBeTruthy();
    expect(screen.getByText('Rest the guitar on your leg.')).toBeTruthy();
  });

  it('marks a checklist item done via its checkbox without navigating away', async () => {
    mockGetChapterChecklist.mockResolvedValue({
      generating: false,
      plan: {
        _id: 'plan-1',
        hobby: 'Guitar',
        level: 'beginner',
        targetDate: new Date().toISOString(),
        status: 'active',
        chapters: [
          {
            _id: 'chapter-1',
            title: 'Basics',
            description: 'Learn the basics',
            order: 0,
            timeEstimateDays: 2,
            status: 'current',
            checklistItems: [
              {
                _id: 'item-1',
                title: 'Chord theory',
                description: 'Why chords work',
                modality: 'text',
                required: false,
                order: 0,
                status: 'not_started',
                textContent: 'A chord is built from stacked thirds.',
              },
            ],
          },
        ],
      },
    });
    mockToggleChecklistItem.mockResolvedValue({});

    render(<ChapterChecklistScreen planId="plan-1" chapterId="chapter-1" />);

    const checkbox = await screen.findByLabelText('Mark as done');
    fireEvent.press(checkbox, { stopPropagation: jest.fn() });

    expect(mockToggleChecklistItem).toHaveBeenCalledWith('plan-1', 'chapter-1', 'item-1');
    expect(await screen.findByLabelText('Mark as not done')).toBeTruthy();
  });

  it('shows a preparing state while the checklist is generating, then the content once ready', async () => {
    jest.useFakeTimers();
    const chapterShell = {
      _id: 'chapter-1',
      title: 'Basics',
      description: 'Learn the basics',
      order: 0,
      timeEstimateDays: 2,
      status: 'current',
      checklistItems: [],
    };
    const basePlan = {
      _id: 'plan-1',
      hobby: 'Guitar',
      level: 'beginner',
      targetDate: new Date().toISOString(),
      status: 'active',
      chapters: [chapterShell],
    };
    const readyPlan = {
      ...basePlan,
      chapters: [
        {
          ...chapterShell,
          checklistItems: [
            {
              _id: 'item-1',
              title: 'Chord theory',
              description: 'Why chords work',
              modality: 'text',
              required: false,
              order: 0,
              status: 'not_started',
              textContent: 'A chord is built from stacked thirds.',
            },
          ],
        },
      ],
    };
    mockGetChapterChecklist
      .mockResolvedValueOnce({ plan: basePlan, generating: true })
      .mockResolvedValueOnce({ plan: readyPlan, generating: false });

    render(<ChapterChecklistScreen planId="plan-1" chapterId="chapter-1" />);

    expect(await screen.findByText('Preparing your lesson…')).toBeTruthy();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(2000);
    });

    expect(await screen.findByText('Chord theory')).toBeTruthy();

    jest.useRealTimers();
  });

  it('marks the chapter complete and shows the continue button', async () => {
    const basePlan = {
      _id: 'plan-1',
      hobby: 'Guitar',
      level: 'beginner',
      targetDate: new Date().toISOString(),
      status: 'active',
      chapters: [
        {
          _id: 'chapter-1',
          title: 'Basics',
          description: 'Learn the basics',
          order: 0,
          timeEstimateDays: 2,
          status: 'current',
          checklistItems: [],
        },
        {
          _id: 'chapter-2',
          title: 'Chords',
          description: 'Learn open chords',
          order: 1,
          timeEstimateDays: 3,
          status: 'locked',
          checklistItems: [],
        },
      ],
    };
    const completedPlan = {
      ...basePlan,
      chapters: [
        { ...basePlan.chapters[0], status: 'completed' },
        { ...basePlan.chapters[1], status: 'current' },
      ],
    };
    mockGetChapterChecklist
      .mockResolvedValueOnce({ plan: basePlan, generating: false })
      .mockResolvedValueOnce({ plan: completedPlan, generating: false });
    mockCompleteChapter.mockResolvedValue(completedPlan);

    render(<ChapterChecklistScreen planId="plan-1" chapterId="chapter-1" />);

    const markCompleteButton = await screen.findByText('Mark chapter as completed');
    fireEvent.press(markCompleteButton);

    expect(await screen.findByText('✓ Chapter completed')).toBeTruthy();
    expect(screen.getByText('Continue to next chapter')).toBeTruthy();
    expect(mockCompleteChapter).toHaveBeenCalledWith('plan-1', 'chapter-1');
  });

  it('shows an error state with a retry option after network retries are exhausted', async () => {
    jest.useFakeTimers();
    mockGetChapterChecklist.mockRejectedValue(new Error('network error'));

    render(<ChapterChecklistScreen planId="plan-1" chapterId="chapter-1" />);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1500);
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
    });

    expect(await screen.findByText(/Couldn't load this chapter/)).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();

    jest.useRealTimers();
  });
});
