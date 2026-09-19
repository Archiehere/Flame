jest.mock('./deviceId', () => ({
  getDeviceId: jest.fn().mockResolvedValue('device-1'),
}));

describe('apiFetch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetModules();
  });

  it('wraps a network failure in an ApiError with status 0', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const { apiFetch, ApiError } = require('./api') as typeof import('./api');

    await expect(apiFetch('/health')).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch('/health')).rejects.toMatchObject({ status: 0 });
  });

  it('throws an ApiError with the response status on a non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve('boom'),
    });
    const { apiFetch, ApiError } = require('./api') as typeof import('./api');

    await expect(apiFetch('/health')).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch('/health')).rejects.toMatchObject({ status: 500 });
  });

  it('returns parsed JSON on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ hello: 'world' }),
    });
    const { apiFetch } = require('./api') as typeof import('./api');

    await expect(apiFetch('/health')).resolves.toEqual({ hello: 'world' });
  });
});
