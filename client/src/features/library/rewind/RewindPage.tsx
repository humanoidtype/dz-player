// client/src/features/library/rewind/RewindPage.tsx
import React from 'react';
import { useAuthStore } from '../../auth/model/authStore';
import { usePlayerStore } from '../../player/model/playerStore';

export const RewindPage: React.FC = () => {
  const { sessionId } = useAuthStore.getState();
  const { queue } = usePlayerStore.getState();

  return (
    <div className="p-4 bg-card rounded-lg min-h-screen">
      <h2 className="text-text-primary mb-4">Rewind History</h2>
      {sessionId ? (
        <p className="text-text-secondary">History cache offline - akan tampil setelah watch history teraccumulate</p>
      ) : (
        <p className="text-text-error">Login untuk melihat history</p>
      )}
      <div className="mt-4">
        <button className="btn-secondary">Filter: Today | This Week | All</button>
      </div>
    </div>
  );
};