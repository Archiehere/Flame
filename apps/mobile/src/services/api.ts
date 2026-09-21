import Constants from 'expo-constants';
import { getDeviceId } from './deviceId';

const API_PORT = 3000;

function resolveApiUrl(): string {
  const explicitUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (explicitUrl) {
    return explicitUrl;
  }

  // In dev, the Expo host address (e.g. "192.168.1.23:8081") is on the same
  // LAN as the machine running the API, so we reuse its IP instead of
  // "localhost" — which on a physical device or dev client resolves to the
  // device itself, not the computer running the server.
  const hostUri = Constants.expoConfig?.hostUri;
  const lanHost = hostUri?.split(':')[0];
  if (lanHost) {
    return `http://${lanHost}:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

const API_URL = resolveApiUrl();

function getLocalDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const deviceId = await getDeviceId();

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': deviceId,
        'x-local-date': getLocalDateKey(),
        'ngrok-skip-browser-warning': 'true',
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, `Could not reach the Flame server at ${API_URL}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
