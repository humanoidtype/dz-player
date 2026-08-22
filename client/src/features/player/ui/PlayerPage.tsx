// client/src/features/player/ui/PlayerPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../auth/model/authStore';
import { usePlayerStore } from '../../player/model/playerStore';
import { Media } from '../../entities/media';
import { formatTime } from '../../shared/lib/formatTime';
import { SeekBar } from '../../shared/ui/SeekBar';

export const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { sessionId } = useAuthStore.getState();
  const { play, pause, seek, setQueue, currentIndex } = usePlayerStore.getState();

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex h-16 items-center border-b border-border bg-surface">
        <button onClick={() => window.history.back()} className="ml-4">
          ← Kembali
        </button>
        <h1 className="text-text-primary flex-1 text-center">Player</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-surface pt-8">
        <h2 className="text-text-primary text-2xl mb-2 marquee">Sample Media Title</h2>
        <p className="text-text-secondary">Artist Name</p>

        <SeekBar
          duration={1235}
          currentTime={0}
          onSeek={(sec) => console.log('seek', sec)}
        />

        <div className="flex justify-between text-caption mt-2">
          <span>0:00</span>
          <span>20:35</span>
        </div>
      </div>
    </div>
  );
};