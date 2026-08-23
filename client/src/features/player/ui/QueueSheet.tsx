// client/src/features/player/ui/QueueSheet.tsx
import React from 'react';
import { usePlayerStore } from '../../player/model/playerStore';
import { playAt, skipNext, skipPrev, togglePlay } from '../../player/engine/playerEngine';
import { formatTime } from '../../../shared/lib/formatTime';

export interface QueueSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const QueueSheet: React.FC<QueueSheetProps> = ({ visible, onClose }) => {
  const queue = usePlayerStore((s) => s.queue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleLoop = usePlayerStore((s) => s.toggleLoop);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-bg/60" />
      <div
        className="relative bg-surface w-full max-h-[70vh] rounded-t-2xl shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">Antrian ({queue.list.length})</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`px-2 py-1 rounded text-xs ${queue.shuffle ? 'text-accent bg-card-pressed' : 'text-text-secondary'}`}
              aria-label="Shuffle"
            >
              🔀 {queue.shuffle ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={toggleLoop}
              className={`px-2 py-1 rounded text-xs ${queue.loop !== 'none' ? 'text-accent bg-card-pressed' : 'text-text-secondary'}`}
              aria-label="Loop"
            >
              🔁 {queue.loop}
            </button>
            <button onClick={onClose} className="text-text-tertiary text-xl leading-none px-2">×</button>
          </div>
        </div>

        <div className="overflow-y-auto p-2 flex-1">
          {queue.list.length === 0 ? (
            <p className="text-text-secondary text-center py-6 text-sm">Antrian kosong</p>
          ) : (
            queue.list.map((m, idx) => (
              <div
                key={`${m.id}-${idx}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${idx === queue.currentIndex ? 'bg-card-pressed' : ''}`}
              >
                <button onClick={() => playAt(idx)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  {idx === queue.currentIndex && isPlaying ? (
                    <span className="text-accent">▶</span>
                  ) : (
                    <span className="text-text-tertiary text-xs">{idx + 1}</span>
                  )}
                  <img src={m.thumbnailUrl} alt="" className="w-10 h-7 object-cover rounded" />
                  <span className="min-w-0">
                    <span className={`block text-sm truncate ${idx === queue.currentIndex ? 'text-accent' : 'text-text-primary'}`}>
                      {m.title}
                    </span>
                    <span className="block text-xs text-text-secondary truncate">{m.artistName}</span>
                  </span>
                </button>
                <span className="text-caption text-text-tertiary">{formatTime(m.durationSec || 0)}</span>
                <button
                  onClick={() => removeFromQueue(idx)}
                  className="text-text-tertiary hover:text-text-primary px-1"
                  aria-label="Hapus dari antrian"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-3 flex justify-center gap-4">
          <button onClick={skipPrev} className="text-text-primary px-4 py-2" aria-label="Sebelumnya">⏮</button>
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button onClick={skipNext} className="text-text-primary px-4 py-2" aria-label="Berikutnya">⏭</button>
        </div>
      </div>
    </div>
  );
};
