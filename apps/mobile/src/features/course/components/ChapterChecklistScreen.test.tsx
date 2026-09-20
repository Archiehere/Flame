import { fireEvent, render, screen } from '@testing-library/react-native';
import { getChapterChecklist } from '../../../services/learningPlanApi';
import { ChapterChecklistScreen } from './ChapterChecklistScreen';

jest.mock('../../../services/learningPlanApi');
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View };
});

const mockGetChapterChecklist = getChapterChecklist as jest.Mock;

describe('ChapterChecklistScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chapter details and expands an item to show its content', async () => {
    mockGetChapterChecklist.mockResolvedValue({
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
    });

    render(<ChapterChecklistScreen planId="plan-1" chapterId="chapter-1" />);

    expect(await screen.findByText('Basics')).toBeTruthy();
    expect(screen.getByText('Chord theory')).toBeTruthy();
    expect(screen.queryByText('A chord is built from stacked thirds.')).toBeNull();

    fireEvent.press(screen.getByText('Chord theory'));

    expect(await screen.findByText('A chord is built from stacked thirds.')).toBeTruthy();
  });

  it('shows an error state with a retry option when loading fails', async () => {
    mockGetChapterChecklist.mockRejectedValue(new Error('network error'));

    render(<ChapterChecklistScreen planId="plan-1" chapterId="chapter-1" />);

    expect(await screen.findByText(/Couldn't load this chapter/)).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
