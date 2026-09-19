import { randomUUID } from 'expo-crypto';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'generated-uuid'),
}));

const mockStore = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockStore.get(key) ?? null)),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockStore.set(key, value);
    return Promise.resolve();
  }),
}));

describe('getDeviceId', () => {
  beforeEach(() => {
    mockStore.clear();
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('generates and persists a new id when none is stored', async () => {
    const { getDeviceId } = require('./deviceId') as typeof import('./deviceId');

    const id = await getDeviceId();

    expect(id).toBe('generated-uuid');
    expect(mockStore.get('flame.deviceId')).toBe('generated-uuid');
  });

  it('reuses the stored id on subsequent calls without regenerating', async () => {
    mockStore.set('flame.deviceId', 'existing-id');
    const { getDeviceId } = require('./deviceId') as typeof import('./deviceId');

    const id = await getDeviceId();

    expect(id).toBe('existing-id');
    expect(randomUUID).not.toHaveBeenCalled();
  });
});
