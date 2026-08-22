import { config } from '../config.js';

/** Minimal youtubei.js client interface. */
interface YtText { text?: string; };
interface YtVideoLike {
  id?: string; videoId?: string;
  title?: string | YtText;
  author?: { name?: string } | YtText;
  channel?: string;
  duration?: { seconds?: number } | number;
  short_view_count?: YtText;
  view_count?: string | number;
  published?: YtText;
  thumbnails?: { url?: string }[];
}

type InnertubeMethods = {
  search(q: string): Promise<{ videos: YtVideoLike[] }>;
  getSearchSuggestions(q: string): Promise<{ suggestions: string[] }>;
  getHomeFeed(): Promise<{ videos: YtVideoLike[] }>;
  getTrending(): Promise<{ videos: YtVideoLike[] }>;
  getPlaylist(id: string): Promise<{ items: YtVideoLike[]; count: number }>;
};

export async function createClient(cookieHeader?: string) {
  const mod = await import('youtubei.js');
  const Innertube = mod.Innertube;
  return new Innertube({ cookie: cookieHeader });
}

export async function extractVideos(raw: unknown): YtVideoLike[] {
  // Defensive: handle many youtubei.js response shapes
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(extractVideos)[0];
  // Most common: .videos array or .content or .contents
  if (typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    // .videos array exists in many versions (home, trending, search)
    const videos = r.videos as YtVideoLike[];
    if (Array.isArray(videos)) return videos;
    // fallback: first video in any section
    for (const key of Object.keys(r)) {
      const val = r[key];
      if (Array.isArray(val)) {
        const extracted = extractVideos(val);
        if (extracted.length) return extracted;
      }
    }
  }
  return [];
}

export function toMediaDto(v: YtVideoLike): {
  id: string; title: string; artistName: string; thumbnailUrl: string;
  durationSec: number; viewCount?: number; publishedAgo?: string;
  source: 'online'; type: 'video'; streamUrl?: string; streamUrlExpiresAt?: number;
} {
  const vid = v.id || v.videoId || '';
  const title = (typeof v.title === 'string' ? v.title : v.title?.text || 'Unknown Title').trim() || 'Unknown';
  const artistName = typeof v.author === 'string' ? v.author : (v.author?.name || v.channel || 'Unknown Channel').trim() || 'Unknown';
  const thumb = v.thumbnails?.[0]?.url
    || `https://i.ytimg.com/vi/${vid.replace('vid_','')}/hqdefault.jpg`;
  const duration = typeof v.duration === 'number' ? v.duration : (typeof v.duration?.seconds === 'number' ? v.duration.seconds : undefined);
  // Parse viewCount like "3.3K views", "1.2M views" or numeric
  let viewCount: number | undefined;
  if (typeof v.short_view_count === 'object' && v.short_view_count.text) {
    const text = v.short_view_count.text.replace(/views?/i, '').trim();
    viewCount = parseCount(text);
  } else if (typeof v.view_count === 'number') {
    viewCount = v.view_count;
  } else if (typeof v.view_count === 'string') {
    viewCount = parseCount(v.view_count);
  }
  const published = typeof v.published === 'string' ? v.published : (v.published?.text || undefined);

  return {
    id: `vid_${vid.replace('vid_','')}`,
    title,
    artistName,
    thumbnailUrl: thumb,
    durationSec: duration || 0,
    viewCount,
    publishedAgo: published,
    source: 'online',
    type: 'video',
  };
}

function parseCount(text: string): number | undefined {
  if (!text) return undefined;
  const num = parseFloat(text);
  if (isNaN(num)) return undefined;
  const upper = text.replace(/[0-9.]/g, '').toUpperCase();
  if (upper.includes('K')) return Math.round(num * 1000);
  if (upper.includes('M')) return Math.round(num * 1_000_000);
  if (upper.includes('B')) return Math.round(num * 1_000_000_000);
  return Math.round(num);
}

export { createClient, extractVideos, toMediaDto };