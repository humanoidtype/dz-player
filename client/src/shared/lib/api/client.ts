// shared lib api client - fetch wrapper + TanStack Query keys
import { API_BASE_URL } from './config';

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
export class ApiError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message || code);
    this.code = code;
  }
}

export function isBotError(e: unknown): boolean {
  if (e instanceof ApiError) return e.code === 'BOT_DETECTED';
  return (e as Error | undefined)?.message === 'BOT_DETECTED';
}

export async function apiFetch<T>(
  endpoint: string,
  init: RequestInit = {},
  sessionId: string
): Promise<T> {
  const headers: Record<string, string> = {
    ...authHeaders(sessionId),
    ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...((init.headers as Record<string, string>) || {}),
  };
  const url = `${API_BASE_URL}${endpoint}`;
  const resp = await fetch(url, { ...init, headers });
  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    const code = errData.error?.code || 'API_ERROR';
    throw new ApiError(code, code === 'BOT_DETECTED' ? 'BOT_DETECTED' : resp.statusText || code);
  }
  return resp.json() as Promise<T>;
}