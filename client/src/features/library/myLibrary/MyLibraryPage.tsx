// client/src/features/library/myLibrary/MyLibraryPage.tsx
import React from 'react';
import { useAuthStore } from '../../auth/model/authStore';

export const MyLibraryPage: React.FC = () => {
  const { sessionId } = useAuthStore.getState();

  return (
    <div className="p-4 bg-card rounded-lg min-h-screen">
      <h2 className="text-text-primary mb-4">My Library</h2>
      {sessionId ? (
        <>
          <p className="text-text-secondary">
            Profile: <span className="font-medium">User Name</span> (tap untuk playlist YouTube)
          </p>
          <p className="text-text-tertiary">(read-only, Phase 1)</p>
        </>
      ) : (
        <div className="empty-state text-center py-8">
          <p className="text-text-secondary mb-2">Belum login</p>
          <button className="btn-primary">Login with Google</button>
        </div>
      )}
    </div>
  );
};