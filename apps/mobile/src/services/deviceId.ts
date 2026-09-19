import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'flame.deviceId';

let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  const stored = await SecureStore.getItemAsync(STORAGE_KEY);
  if (stored) {
    cachedDeviceId = stored;
    return stored;
  }

  const generated = randomUUID();
  await SecureStore.setItemAsync(STORAGE_KEY, generated);
  cachedDeviceId = generated;
  return generated;
}
