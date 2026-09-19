import { fireEvent, render, screen } from '@testing-library/react-native';
import { SyllabusReview } from './SyllabusReview';

const chapters = [
  { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
  { title: 'Chords', description: 'Learn chords', order: 1, timeEstimateDays: 3 },
];

describe('SyllabusReview', () => {
  it('shows the current step badge on the first chapter', () => {
    render(
      <SyllabusReview
        initialChapters={chapters}
        onApprove={jest.fn()}
        onRevise={jest.fn()}
        isApproving={false}
        errorMessage={null}
        userName="Ada"
      />,
    );

    expect(screen.getByText('CURRENT STEP')).toBeTruthy();
    expect(screen.getByText('Basics')).toBeTruthy();
    expect(screen.getByText('Chords')).toBeTruthy();
  });

  it('removes a chapter when its delete icon is pressed', () => {
    render(
      <SyllabusReview
        initialChapters={chapters}
        onApprove={jest.fn()}
        onRevise={jest.fn()}
        isApproving={false}
        errorMessage={null}
        userName="Ada"
      />,
    );

    fireEvent.press(screen.getAllByLabelText('Delete chapter')[1]);

    expect(screen.queryByText('Chords')).toBeNull();
    expect(screen.getByText('Basics')).toBeTruthy();
  });

  it('sends a free-text revision request and applies the returned chapters', async () => {
    const onRevise = jest.fn().mockResolvedValue([
      { title: 'Basics', description: 'Learn the basics', order: 0, timeEstimateDays: 2 },
      { title: 'Music Theory', description: 'Learn theory', order: 1, timeEstimateDays: 3 },
    ]);

    render(
      <SyllabusReview
        initialChapters={chapters}
        onApprove={jest.fn()}
        onRevise={onRevise}
        isApproving={false}
        errorMessage={null}
        userName="Ada"
      />,
    );

    fireEvent.changeText(
      screen.getByPlaceholderText('e.g. Add a chapter about music theory'),
      'Add a chapter about music theory',
    );
    fireEvent.press(screen.getByLabelText('Send'));

    expect(onRevise).toHaveBeenCalledWith('Add a chapter about music theory');
    expect(await screen.findByText('Music Theory')).toBeTruthy();
    expect(screen.getByText('Add a chapter about music theory')).toBeTruthy();
  });
});
