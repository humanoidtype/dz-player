// client/src/shared/lib/api/youtubeClient.ts
import { apiFetch } from './client';
import type { Media } from '../../../entities/media';
import { useAuthStore } from '../../../features/auth/model/authStore';

const sessionId = (): string => useAuthStore.getState().sessionId ?? 'GUEST';

export interface TrendingResponse {
  data: Media[];
  nextPage?: number;
  hasMore?: boolean;
}

export const youtubeClient = {
  trending: (tab: string = 'dashboard', page: number = 1): Promise<TrendingResponse> => {
    return apiFetch<TrendingResponse>(
      `/api/youtube/trending?tab=${tab}&page=${page}`,
      {},
      sessionId()
    );
  },

  search: async (q: string): Promise<Media[]> => {
    const resp = await apiFetch<{ data: Media[] }>(
      `/api/youtube/search?q=${encodeURIComponent(q)}`,
      {},
      sessionId()
    );
    return resp.data;
  },

  suggest: async (q: string): Promise<string[]> => {
    const resp = await apiFetch<unknown>(
      `/api/youtube/suggest?q=${encodeURIComponent(q)}`,
      {},
      sessionId()
    );
    if (Array.isArray(resp)) return resp as string[];
    return (resp as { suggestions?: string[] }).suggestions ?? [];
  },

  stream: async (id: string, quality: string = '720p'): Promise<{ streamUrl: string; expiresAt?: number; durationSec?: number }> => {
    const resp = await apiFetch<{ data: { streamUrl: string; expiresAt?: number; durationSec?: number } }>(
      `/api/youtube/stream/${id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality }),
      },
      sessionId()
    );
    return resp.data;
  },

  startDownload: async (id: string, quality: string = '720p'): Promise<{ id: string; filePath: string; status: string }> => {
    const resp = await apiFetch<{ data: { id: string; filePath: string; status: string } }>(
      `/api/download/${id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality }),
      },
      sessionId()
    );
    return resp.data;
  },

  downloadStatus: async (id: string): Promise<{ id: string; status: string }> => {
    const resp = await apiFetch<{ data: { id: string; status: string } }>(
      `/api/download/${id}/status`,
      {},
      sessionId()
    );
    return resp.data;
  },

  // Import cookies YouTube (Netscape txt atau header "k=v; ...") ke sesi aktif
  saveYoutubeCookies: async (raw: string): Promise<{ ok: boolean; count: number }> => {
    return apiFetch<{ ok: boolean; count: number }>(
      '/api/youtube/cookies',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      },
      sessionId()
    );
  },
};
