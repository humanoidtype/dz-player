// client/src/features/player/ui/PlayerPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../../player/model/playerStore';
import { SeekBar } from './SeekBar';
import { Controls } from './Controls';
import { QueueSheet } from './QueueSheet';
import { playMedia, togglePlay, skipNext, skipPrev, seekTo } from '../engine/playerEngine';

export const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [queueOpen, setQueueOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMedia = usePlayerStore((s) => s.currentMedia);
  const queue = usePlayerStore((s) => s.queue);
  const positionSec = usePlayerStore((s) => s.positionSec);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

    // jika URL punya id dan berbeda dari currentMedia, ambil dari antrian
  useEffect(() => {
    if (id && (!currentMedia || currentMedia.id !== id)) {
      const idx = queue.list.findIndex((m) => m.id === id);
      if (idx >= 0 && idx !== queue.currentIndex) {
        usePlayerStore.getState().setCurrentIndex(idx);
        void playMedia(queue.list[idx]).catch((e: Error) => setError(e.message));
      }
    }
  }, [id, currentMedia, queue.list, queue.currentIndex]);

  if (!currentMedia) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">Tidak ada media diputar. Cari lagu dulu lewat 🔍</p>
        <button onClick={() => navigate('/')} className="btn-primary px-4 py-2 rounded-full bg-accent text-white text-sm">
          Ke Discover
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex h-16 items-center border-b border-border bg-surface shrink-0">
        <button onClick={() => { usePlayerStore.getState().setExpanded(false); navigate(-1); }} className="ml-4 text-text-primary">
          ← Kembali
        </button>
        <h1 className="text-text-secondary flex-1 text-center text-sm">Sedang Diputar</h1>
        <button onClick={() => setQueueOpen(true)} className="mr-4 text-text-primary" aria-label="Antrian">
          ☰
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-surface pt-8 px-6 gap-4">
        <img
          src={currentMedia.thumbnailUrl}
          alt={currentMedia.title}
          className={`w-56 h-56 object-cover rounded-2xl shadow-2xl ${isPlaying ? '' : 'opacity-70'}`}
        />
        <div className="text-center max-w-md w-full">
          <h2 className="text-text-primary text-xl mb-1 truncate">{currentMedia.title}</h2>
          <p className="text-text-secondary">{currentMedia.artistName}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-card-pressed text-text-tertiary text-xs uppercase">
            {currentMedia.source}
          </span>
        </div>

        {error && (
          <p className="text-text-error text-sm text-center">
            Gagal memuat stream: {error}
            <button
              onClick={() => {
                setError(null);
                void playMedia(currentMedia).catch((e: Error) => setError(e.message));
              }}
              className="block mx-auto mt-1 underline"
            >
              Coba lagi
            </button>
          </p>
        )}

        <div className="w-full max-w-md">
          <SeekBar duration={currentMedia.durationSec} currentTime={positionSec} onSeek={seekTo} />
        </div>

        <Controls
          isPlaying={isPlaying}
          disabled={queue.list.length === 0}
          onPrev={skipPrev}
          onPlayPause={() => {
            setError(null);
            togglePlay();
          }}
          onNext={() => {
            setError(null);
            skipNext();
          }}
        />
      </div>

      <QueueSheet visible={queueOpen} onClose={() => setQueueOpen(false)} />
    </div>
  );
};
