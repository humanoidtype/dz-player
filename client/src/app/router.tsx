// client/src/app/router.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PlayerPage } from '../features/player/ui/PlayerPage';
import { MyLibraryPage } from '../features/library/myLibrary/MyLibraryPage';
import { LocalMusicPage } from '../features/library/local/LocalMusicPage';
import { RewindPage } from '../features/library/rewind/RewindPage';
import { DownloadManagerPage } from '../features/library/download/DownloadManagerPage';

export const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/player/:id?" element={<PlayerPage />} />
      <Route path="/library" element={<MyLibraryPage />} />
      <Route path="/local" element={<LocalMusicPage />} />
      <Route path="/rewind" element={<RewindPage />} />
      <Route path="/downloads" element={<DownloadManagerPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
};
