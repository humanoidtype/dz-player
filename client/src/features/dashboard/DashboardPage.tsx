// client/src/features/dashboard/DashboardPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { isBotError } from '../../shared/lib/api/client';
import { LoginPrompt } from '../auth/ui/LoginPrompt';
import { usePlayerStore } from '../player/model/playerStore';
import { playMedia } from '../player/engine/playerEngine';
import { MediaCard } from './ui/MediaCard';
import { TabBar } from './ui/TabBar';
import { youtubeClient } from '../../shared/lib/api/youtubeClient';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const setQueue = usePlayerStore((s) => s.setQueue);

  const { data: trending, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trending', 'dashboard', 1],
    queryFn: () => youtubeClient.trending('dashboard', 1),
    retry: 1,
  });

  const items = trending?.data ?? [];
  const botDetected = isError && isBotError(error);

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
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-card rounded-lg h-64 w-full" />
          ))
        ) : isError && botDetected ? (
          <LoginPrompt onSuccess={() => void refetch()} />
        ) : isError ? (
          <div className="col-span-full py-8 text-center">
            <p className="text-text-error text-sm mb-3">Gagal memuat. Pastikan server API aktif.</p>
            <button
              onClick={() => void refetch()}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Coba lagi
            </button>
          </div>
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
