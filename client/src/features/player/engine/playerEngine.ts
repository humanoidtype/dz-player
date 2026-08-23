// client/src/features/player/engine/playerEngine.ts
import { usePlayerStore } from '../model/playerStore';
import { useAuthStore } from '../../auth/model/authStore';
import type { Media } from '../../../entities/media';
import { apiFetch } from '../../../shared/lib/api/client';
import { db } from '../../../shared/db/db';

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (audio) return audio;
  audio = new Audio();
  audio.addEventListener('timeupdate', () => {
    if (audio) usePlayerStore.getState().setPosition(audio.currentTime);
  });
  audio.addEventListener('play', () => usePlayerStore.getState().setPlaying(true));
  audio.addEventListener('pause', () => usePlayerStore.getState().setPlaying(false));
  audio.addEventListener('ended', () => {
    const st = usePlayerStore.getState();
    void recordHistory(st.currentMedia, true);
    if (st.queue.loop === 'one' && audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
      return;
    }
    const moved = st.next();
    if (moved && usePlayerStore.getState().currentMedia) {
      void playMedia(usePlayerStore.getState().currentMedia as Media);
    }
  });
  return audio;
}

async function recordHistory(media: Media | null, completed: boolean): Promise<void> {
  if (!media) return;
  try {
    await db.history.add({
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mediaId: media.id,
      watchedAt: Date.now(),
      progressSec: Math.floor(usePlayerStore.getState().positionSec),
      completed: completed ? 1 : 0,
      isOfflineAvailable: media.source === 'local' ? 1 : 0,
    });
    // simpan metadata media agar history bisa ditampilkan offline
    await db.media.put({
      id: media.id,
      title: media.title,
      artistName: media.artistName,
      thumbnailUrl: media.thumbnailUrl,
      durationSec: media.durationSec,
      source: media.source,
      type: media.type,
      createdAt: Date.now(),
    });
  } catch {
    // IndexedDB mungkin tidak tersedia; abaikan
  }
}

export async function fetchStreamUrl(media: Media, quality = '720p'): Promise<string> {
  if (media.source === 'local' && media.streamUrl) {
    return media.streamUrl;
  }
  const sessionId = useAuthStore.getState().sessionId ?? 'GUEST';
  const resp = await apiFetch<{ data: { streamUrl: string } }>(
    `/api/youtube/stream/${media.id}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quality }),
    },
    sessionId
  );
  return resp.data.streamUrl;
}

export async function playMedia(media: Media, quality = '720p'): Promise<void> {
  const a = getAudio();
  const store = usePlayerStore.getState();
  if (!store.queue.list.some((m) => m.id === media.id)) {
    store.addToQueue([media]);
  }
  try {
    const streamUrl = await fetchStreamUrl(media, quality);
    usePlayerStore.setState({ currentMedia: media, positionSec: 0 });
    a.src = streamUrl;
    a.volume = store.muted ? 0 : store.volume;
    await a.play().catch(() => {});
  } catch (e) {
    usePlayerStore.getState().setPlaying(false);
    throw e;
  }
}

export function togglePlay(): void {
  const a = getAudio();
  const { currentMedia } = usePlayerStore.getState();
  if (!a.src && currentMedia) {
    void playMedia(currentMedia).catch(() => {});
    return;
  }
  if (!a.src) return;
  if (a.paused) {
    void a.play().catch(() => {});
  } else {
    a.pause();
  }
}

export function skipNext(): void {
  const moved = usePlayerStore.getState().next();
  const media = usePlayerStore.getState().currentMedia;
  if (moved && media) void playMedia(media).catch(() => {});
  else getAudio().pause();
}

export function skipPrev(): void {
  const a = getAudio();
  if (a.currentTime > 3) {
    seekTo(0);
    return;
  }
  const moved = usePlayerStore.getState().prev();
  const media = usePlayerStore.getState().currentMedia;
  if (moved && media) void playMedia(media).catch(() => {});
}

export function seekTo(sec: number): void {
  const a = getAudio();
  if (a.src && !isNaN(a.duration)) {
    a.currentTime = sec;
  }
  usePlayerStore.getState().setPosition(sec);
}

export function playAt(idx: number): void {
  const { queue } = usePlayerStore.getState();
  const media = queue.list[idx];
  if (media) void playMedia(media).catch(() => {});
}
