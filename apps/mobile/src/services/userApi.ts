import { apiFetch } from './api';

export function updateUserName(name: string): Promise<{ name: string }> {
  return apiFetch<{ name: string }>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}
