// client/src/features/player/model/playerStore.ts
import create from 'zustand/middleware';
import type { Media, QueueState, LoopMode } from '../../entities/media';
import { formatTime } from '../../shared/lib/formatTime';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PlayerStore {
  queue: QueueState;
  currentMedia: Media | null;
  positionSec: number;
  isPlaying: boolean;
  isExpanded: boolean;
  volume: number;
  muted: boolean;
  setQueue: (list: Media[], idx?: number) => void;
  play: () => void;
  pause: () => void;
  seek: (sec: number) => void;
  setPlaying: (playing: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  setPosition: (sec: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  reorder: (from: number, to: number) => void;
  removeFromQueue: (idx: number) => void;
}

export const usePlayerStore = create<PlayerStore>(
  persist(
    (set, get) => ({
      queue: {
        list: [],
        currentIndex: -1,
        shuffle: false,
        loop: 'none',
        originalList: [],
      },
      currentMedia: null,
      positionSec: 0,
      isPlaying: false,
      isExpanded: false,
      volume: 1,
      muted: false,
      setQueue: (list: Media[], idx?: number) => {
        const index = idx !== undefined ? idx : 0;
        set({ queue: { list, currentIndex: index, shuffle: false, loop: 'none', originalList: list.slice() } });
      },
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      seek: (sec: number) => set({ positionSec: sec }),
      setPlaying: (playing: boolean) => set({ isPlaying: playing }),
      setExpanded: (expanded: boolean) => set({ isExpanded: expanded }),
      setPosition: (sec: number) => set({ positionSec: sec }),
      setVolume: (vol: number) => set({ volume: Math.max(0, Math.min(1, vol)) }),
      toggleMute: () => set({ muted: !muted }),
      next: () => {
        const { queue, currentMedia } = get();
        if (queue.list.length === 0) return;
        let idx = queue.currentIndex + 1;
        if (idx >= queue.list.length) {
          if (queue.loop === 'all') idx = 0;
          else return;
        }
        get().setQueue(queue.list, idx);
      },
      prev: () => {
        const { queue } = get();
        if (queue.list.length === 0) return;
        let idx = queue.currentIndex - 1;
        if (idx < 0) {
          if (queue.loop === 'all') idx = queue.list.length - 1;
          else return;
        }
        get().setQueue(queue.list, idx);
      },
      toggleShuffle: () =>
        set({ queue: { ...get().queue, shuffle: !get().queue.shuffle, originalList: get().queue.shuffle ? undefined : get().queue.list } }),
      toggleLoop: () =>
        set({ queue: { ...get().queue, loop: get().queue.loop === 'none' ? 'one' : get().queue.loop === 'one' ? 'all' : 'none' } }),
      reorder: (from: number, to: number) => {
        const { queue } = get();
        if (from < 0 || from >= queue.list.length || to < 0 || to >= queue.list.length) return;
        const newList = [...queue.list];
        const [moved] = newList.splice(from, 1);
        newList.splice(to, 0, moved);
        get().setQueue(newList, to);
      },
      removeFromQueue: (idx: number) => {
        const { queue } = get();
        if (idx < 0 || idx >= queue.list.length) return;
        const newList = queue.list.filter((_, i) => i !== idx);
        const newIdx = idx > queue.currentIndex ? queue.currentIndex : idx;
        get().setQueue(newList, newIdx);
      },
    }),
    {
      name: 'player-store',
      storage: {
        getItem: (name: string) => {
          if (typeof window !== 'undefined') return localStorage.getItem(name);
          return null;
        },
        setItem: (name: string, value: string) => {
          if (typeof window !== 'undefined') localStorage.setItem(name, value);
        },
        removeItem: (name: string) => {
          if (typeof window !== 'undefined') localStorage.removeItem(name);
        },
      },
    }
  )
);