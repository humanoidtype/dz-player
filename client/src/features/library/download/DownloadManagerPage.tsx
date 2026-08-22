// client/src/features/library/download/DownloadManagerPage.tsx
import React from 'react';
import { useAuthStore } from '../../auth/model/authStore';

export const DownloadManagerPage: React.FC = () => {
  const { sessionId } = useAuthStore.getState();

  return (
    <div className="p-4 bg-card rounded-lg min-h-screen">
      <h2 className="text-text-primary mb-4">Download Manager</h2>
      {sessionId ? (
        <p className="text-text-secondary">Daftar download video/audio...</p>
      ) : (
        <p className="text-text-error">Login untuk mengelola download</p>
      )}
      <div className="mt-4">
        <p>Tidak ada download aktif</p>
      </div>
    </div>
  );
};