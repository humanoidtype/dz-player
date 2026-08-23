// client/src/features/library/myLibrary/MyLibraryPage.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../../shared/db/db';

export const MyLibraryPage: React.FC = () => {
  const [stats, setStats] = useState({ history: 0, downloads: 0, playlists: 0 });

  useEffect(() => {
    void (async () => {
      setStats({
        history: await db.history.count(),
        downloads: await db.download.count(),
        playlists: await db.playlist.count(),
      });
    })();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-text-primary mb-4">My Library</h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-lg p-4 text-center">
          <p className="text-text-primary text-xl font-semibold">{stats.history}</p>
          <p className="text-text-secondary text-xs">Riwayat</p>
        </div>
        <div className="bg-card rounded-lg p-4 text-center">
          <p className="text-text-primary text-xl font-semibold">{stats.downloads}</p>
          <p className="text-text-secondary text-xs">Download</p>
        </div>
        <div className="bg-card rounded-lg p-4 text-center">
          <p className="text-text-primary text-xl font-semibold">{stats.playlists}</p>
          <p className="text-text-secondary text-xs">Playlist</p>
        </div>
      </div>

      <p className="text-text-tertiary text-sm">
        Playlist YouTube & sinkronisasi akun akan aktif setelah login Google dikonfigurasi.
      </p>
    </div>
  );
};
