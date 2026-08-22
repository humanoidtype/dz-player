// client/src/shared/lib/api/youtubeClient.ts
import { apiFetch } from './client';

export const youtubeClient = {
  trending: (tab: string = 'dashboard', page: number = 1) => {
    return apiFetch(
      `/api/youtube/trending?tab=${tab}&page=${page}`,
      {},
      'PLACEHOLDER_SESSION_ID'
    ).then((r: any) => r.data);
  },

  search: (q: string) => {
    return apiFetch(
      `/api/youtube/search?q=${encodeURIComponent(q)}`,
      {},
      'PLACEHOLDER_SESSION_ID'
    ).then((r: any) => r.data);
  },

  suggest: (q: string) => {
    return apiFetch(
      `/api/youtube/suggest?q=${encodeURIComponent(q)}`,
      {},
      'PLACEHOLDER_SESSION_ID'
    ).then((r: any) => r.suggestions);
  },

  stream: (id: string, quality: string) => {
    return apiFetch(
      `/api/youtube/stream/${id}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer PLACEHOLDER_SESSION_ID`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quality }),
      }
    ).then((r: any) => r);
  },

  playlists: () => {
    return apiFetch(
      '/api/youtube/playlist',
      {},
      'PLACEHOLDER_SESSION_ID'
    ).then((r: any) => r.playlists);
  },
};