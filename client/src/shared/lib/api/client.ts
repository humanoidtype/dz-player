// shared lib api client - fetch wrapper + TanStack Query setup
import { useQueryClient } from '@tanstack/react-query';

// Authorization header factory — client hanya pegang sessionId (di SecureStorage)
export function authHeaders(sessionId: string) {
  return {
    Authorization: `Bearer ${sessionId}`,
  };
}

// Helper untuk TanStack Query keys
export const queryKeys = {
  trending: (tab: string, page: number) => ['trending', tab, page],
  search: (q: string) => ['search', q.toLowerCase()],
  suggest: (q: string) => ['suggest', q.toLowerCase()],
  myLibrary: ['myLibrary'],
  media: (id: string) => ['media', id],
}

// Generic fetch wrapper dengan auth headers dan error handling
export async function apiFetch<T>(
  endpoint: string,
  init: RequestInit = {},
  sessionId: string
): Promise<T> {
  const headers = {
    ...authHeaders(sessionId),
    'Content-Type': init.body instanceof FormData ? undefined : 'application/json',
    ...(init.headers || {}),
  };
  const resp = await fetch(endpoint, { ...init, headers });
  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    const code = errData.error?.code || '';
    if (code === 'BOT_DETECTED') throw new Error('BOT_DETECTED');
    throw new Error(resp.statusText || 'API error');
  }
  return resp.json() as Promise<T>;
}