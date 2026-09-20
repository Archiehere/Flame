import { render, screen } from '@testing-library/react-native';
import { getActiveLearningPlans } from '../../../services/learningPlanApi';
import { getCurrentUser } from '../../../services/userApi';
import { DashboardScreen } from './DashboardScreen';

jest.mock('../../../services/learningPlanApi');
jest.mock('../../../services/userApi');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), canGoBack: () => false }),
  useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]),
}));

const mockGetActiveLearningPlans = getActiveLearningPlans as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the greeting, profile, and ongoing course once loaded', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 0 });
    mockGetActiveLearningPlans.mockResolvedValue([
      {
        _id: 'plan-1',
        hobby: 'Guitar',
        level: 'beginner',
        targetDate: new Date().toISOString(),
        status: 'active',
        chapters: [
          {
            _id: 'c1',
            title: 'Basics',
            description: 'd',
            order: 0,
            timeEstimateDays: 2,
            status: 'current',
          },
        ],
      },
    ]);

    render(<DashboardScreen />);

    expect(await screen.findByText('Hi, Ready to learn?')).toBeTruthy();
    expect(screen.getByText('Ada')).toBeTruthy();
    expect(screen.getByText('Learning Guitar')).toBeTruthy();
  });

  it('renders a card for every active course', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 0 });
    mockGetActiveLearningPlans.mockResolvedValue([
      {
        _id: 'plan-1',
        hobby: 'Guitar',
        level: 'beginner',
        targetDate: new Date().toISOString(),
        status: 'active',
        chapters: [],
      },
      {
        _id: 'plan-2',
        hobby: 'Chess',
        level: 'beginner',
        targetDate: new Date().toISOString(),
        status: 'active',
        chapters: [],
      },
    ]);

    render(<DashboardScreen />);

    expect(await screen.findByText('Learning Guitar')).toBeTruthy();
    expect(screen.getByText('Learning Chess')).toBeTruthy();
  });

  it('shows only the add-course card when there is no active course', async () => {
    mockGetCurrentUser.mockResolvedValue({ name: 'Ada', currentStreak: 0 });
    mockGetActiveLearningPlans.mockResolvedValue([]);

    render(<DashboardScreen />);

    expect(await screen.findByLabelText('Start a new course')).toBeTruthy();
    expect(screen.queryByText(/Learning /)).toBeNull();
  });
});
