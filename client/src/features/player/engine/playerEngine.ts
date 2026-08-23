// client/src/features/player/engine/playerEngine.ts
import { usePlayerStore } from '../model/playerStore';
import { Media } from '../../../entities/media';

export async function resolveStreamUrl(media: Media): Promise<string> {
  const now = Date.now();
  if (media.streamUrl && media.streamUrlExpiresAt && media.streamUrlExpiresAt > now) {
    return media.streamUrl;
  }
  throw new Error('resolveStreamUrl: call from component with valid session');
}

export function usePlayerEngine(media: Media) {
  const { play, pause, seek, setPosition } = usePlayerStore.getState();
  const { toggleShuffle, toggleLoop, next, prev, removeFromQueue, setQueue } = usePlayerStore.getState();

  const handlePlay = async () => {
    const streamUrl = await resolveStreamUrl(media);
    // Di implementasi lengkap, set ke video element src + play
    play();
  };

  const handlePause = () => pause();
  const handleSeek = (sec: number) => setPosition(sec);
  const handleNext = () => next();
  const handlePrev = () => prev();

  return { handlePlay, handlePause, handleSeek, handleNext, handlePrev };
}