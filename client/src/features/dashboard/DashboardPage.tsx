// client/src/features/dashboard/DashboardPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../auth/model/authStore';
import { usePlayerStore } from '../player/model/playerStore';
import { MediaCard } from './ui/MediaCard';
import { TabBar } from './ui/TabBar';
import { youtubeClient } from '../../shared/lib/api/youtubeClient';

export const DashboardPage: React.FC = () => {
  const { sessionId } = useAuthStore.getState();
  const { addToQueue } = usePlayerStore.getState();

  const { data: trending, isLoading } = useQuery({
    queryKey: ['trending', 'dashboard', 1],
    queryFn: () => youtubeClient.trending('dashboard', 1),
    enabled: !!sessionId,
  });

  return (
    <div className="min-h-screen bg-bg p-4">
      <TabBar
        activeTab="dashboard"
        onTabChange={() => {}}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="animate-pulse bg-card rounded-lg h-64 w-full" />
        ) : trending
          ? trending.map((m) => <MediaCard key={m.id} media={m} onPlay={() => addToQueue([m])} />)
          : <div className="empty-state text-text-secondary">No data</div>}
      </div>
    </div>
  );
};