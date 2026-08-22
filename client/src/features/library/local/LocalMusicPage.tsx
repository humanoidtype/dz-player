// client/src/features/library/local/LocalMusicPage.tsx
import React from 'react';
import { useAuthStore } from '../../auth/model/authStore';
import { usePlayerStore } from '../../player/model/playerStore';

export const LocalMusicPage: React.FC = () => {
  const { sessionId } = useAuthStore.getState();
  const { addToQueue } = usePlayerStore.getState();

  return (
    <div className="p-4 bg-card rounded-lg min-h-screen">
      <h2 className="text-text-primary mb-4">Local Music</h2>
      {sessionId ? (
        <p className="text-text-secondary">Menampilkan musik lokal dari penyimpanan...</p>
      ) : (
        <p className="text-text-error">Login untuk akses fitur lokal</p>
      )}
      <button onClick={() => addToQueue([])} className="mt-4 btn-primary">Scan & Play</button>
    </div>
  );
};