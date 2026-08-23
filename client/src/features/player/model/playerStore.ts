// client/src/features/player/model/playerStore.ts
import { create } from 'zustand';
import type { Media, QueueState, LoopMode } from '../../../entities/media';
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
  addToQueue: (list: Media[]) => void;
  setCurrentIndex: (idx: number) => void;
  play: () => void;
  pause: () => void;
  seek: (sec: number) => void;
  setPlaying: (playing: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  setPosition: (sec: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  next: () => boolean;
  prev: () => boolean;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  reorder: (from: number, to: number) => void;
  removeFromQueue: (idx: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
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
        const { queue } = get();
        const index = idx !== undefined ? idx : list.length > 0 ? 0 : -1;
        set({
          queue: {
            ...queue,
            list,
            currentIndex: index,
            originalList: list.slice(),
          },
          currentMedia: list[index] ?? null,
          positionSec: 0,
        });
      },
      addToQueue: (list: Media[]) => {
        const { queue } = get();
        const existing = new Set(queue.list.map((m) => m.id));
        const merged = [...queue.list, ...list.filter((m) => !existing.has(m.id))];
        const currentIndex = queue.currentIndex < 0 && merged.length > 0 ? 0 : queue.currentIndex;
        set({
          queue: { ...queue, list: merged, currentIndex, originalList: merged.slice() },
          currentMedia: get().currentMedia ?? merged[currentIndex] ?? null,
        });
      },
      setCurrentIndex: (idx: number) => {
        const { queue } = get();
        if (idx < 0 || idx >= queue.list.length) return;
        set({ queue: { ...queue, currentIndex: idx }, currentMedia: queue.list[idx], positionSec: 0 });
      },
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      seek: (sec: number) => set({ positionSec: sec }),
      setPlaying: (playing: boolean) => set({ isPlaying: playing }),
      setExpanded: (expanded: boolean) => set({ isExpanded: expanded }),
      setPosition: (sec: number) => set({ positionSec: sec }),
      setVolume: (vol: number) => set({ volume: Math.max(0, Math.min(1, vol)) }),
      toggleMute: () => set({ muted: !get().muted }),
      // return true jika pindah track (perlu autoplay oleh engine)
      next: () => {
        const { queue } = get();
        if (queue.list.length === 0) return false;
        let idx = queue.currentIndex + 1;
        if (idx >= queue.list.length) {
          if (queue.loop === 'all') idx = 0;
          else return false;
        }
        set({
          queue: { ...queue, currentIndex: idx },
          currentMedia: queue.list[idx],
          positionSec: 0,
        });
        return true;
      },
      prev: () => {
        const { queue } = get();
        if (queue.list.length === 0) return false;
        let idx = queue.currentIndex - 1;
        if (idx < 0) {
          if (queue.loop === 'all') idx = queue.list.length - 1;
          else return false;
        }
        set({
          queue: { ...queue, currentIndex: idx },
          currentMedia: queue.list[idx],
          positionSec: 0,
        });
        return true;
      },
      toggleShuffle: () => {
        const { queue } = get();
        if (!queue.shuffle) {
          const current = queue.list[queue.currentIndex];
          const shuffled = [...queue.list];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          const newIndex = current ? shuffled.findIndex((m) => m.id === current.id) : -1;
          set({ queue: { ...queue, shuffle: true, list: shuffled, currentIndex: newIndex } });
        } else {
          const current = queue.list[queue.currentIndex];
          const original = queue.originalList ?? [];
          const newIndex = current ? original.findIndex((m) => m.id === current.id) : -1;
          set({ queue: { ...queue, shuffle: false, list: original.slice(), currentIndex: newIndex } });
        }
      },
      toggleLoop: () => {
        const { queue } = get();
        const loop: LoopMode = queue.loop === 'none' ? 'one' : queue.loop === 'one' ? 'all' : 'none';
        set({ queue: { ...queue, loop } });
      },
      reorder: (from: number, to: number) => {
        const { queue } = get();
        if (from < 0 || from >= queue.list.length || to < 0 || to >= queue.list.length) return;
        const newList = [...queue.list];
        const [moved] = newList.splice(from, 1);
        newList.splice(to, 0, moved);
        const currentMedia = get().currentMedia;
        set({
          queue: { ...queue, list: newList, currentIndex: to, originalList: queue.shuffle ? queue.originalList : newList.slice() },
          currentMedia,
        });
      },
      removeFromQueue: (idx: number) => {
        const { queue } = get();
        if (idx < 0 || idx >= queue.list.length) return;
        const removed = queue.list[idx];
        const newList = queue.list.filter((_, i) => i !== idx);
        let newIdx = queue.currentIndex;
        if (idx < queue.currentIndex) newIdx -= 1;
        else if (idx === queue.currentIndex) newIdx = Math.min(newIdx, newList.length - 1);
        set({
          queue: { ...queue, list: newList, currentIndex: newIdx, originalList: (queue.originalList ?? []).filter((m) => m.id !== removed.id) },
          currentMedia: removed.id === get().currentMedia?.id ? (newList[newIdx] ?? null) : get().currentMedia,
        });
      },
    }),
    {
      name: 'player-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        queue: state.queue,
        currentMedia: state.currentMedia,
        volume: state.volume,
        muted: state.muted,
      }),
    }
  )
);
