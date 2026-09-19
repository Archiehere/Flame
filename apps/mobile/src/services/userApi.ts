import { apiFetch } from './api';

export interface CurrentUser {
  name: string | null;
  currentStreak: number;
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>('/users/me');
}

export function updateUserName(name: string): Promise<{ name: string }> {
  return apiFetch<{ name: string }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}
