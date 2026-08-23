// client/src/features/dashboard/DashboardPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/model/authStore';
import { usePlayerStore } from '../player/model/playerStore';
import { playMedia } from '../player/engine/playerEngine';
import { MediaCard } from './ui/MediaCard';
import { TabBar } from './ui/TabBar';
import { youtubeClient } from '../../shared/lib/api/youtubeClient';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const sessionId = useAuthStore((s) => s.sessionId);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const setQueue = usePlayerStore((s) => s.setQueue);

  const { data: trending, isLoading, isError } = useQuery({
    queryKey: ['trending', 'dashboard', 1],
    queryFn: () => youtubeClient.trending('dashboard', 1),
    enabled: sessionId !== null,
  });

  const items = trending?.data ?? [];

  const handlePlay = (idx: number) => {
    if (!items[idx]) return;
    setQueue(items, idx);
    void playMedia(items[idx]).catch(() => {});
    navigate(`/player/${items[idx].id}`);
  };

  return (
    <div className="p-4">
      <TabBar activeTab="dashboard" onTabChange={() => {}} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!sessionId ? (
          <p className="text-text-secondary text-sm col-span-full py-8 text-center empty-state">
            Login dulu untuk melihat rekomendasi
          </p>
        ) : isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-lg h-64 w-full" />
          ))
        ) : isError ? (
          <p className="text-text-error text-sm col-span-full py-8 text-center">
            Gagal memuat. Pastikan server API aktif.
          </p>
        ) : (
          items.map((m, idx) => (
            <MediaCard
              key={m.id}
              media={m}
              onPlay={() => handlePlay(idx)}
              onMore={() => {
                addToQueue([m]);
                navigate(`/player/${m.id}`);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
