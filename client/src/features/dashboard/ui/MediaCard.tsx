// client/src/features/dashboard/ui/MediaCard.tsx
import React from 'react';
import type { Media } from '../../../entities/media';

export interface MediaCardProps {
  media: Media;
  onPlay?: () => void;
  onMore?: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onPlay,
  onMore,
}) => {
  const title = media.title.length > 40 ? media.title.substring(0, 37) + '...' : media.title;
  const artist = media.artistName || 'Unknown Artist';

  return (
    <div
      onClick={onPlay}
      className="relative group cursor-pointer hover:opacity-90 transition-opacity"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <img
        src={media.thumbnailUrl}
        alt={media.title}
        style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }}
      />
      <div className="absolute bottom-1 left-1 right-2 flex flex-col">
        <p className="text-text-primary text-truncate line-clamp-2 capitalize">{title}</p>
        <p className="text-text-secondary text-caption">{artist}</p>
      </div>
      {onMore && (
        <button
          onClick={onMore}
          className="absolute top-1 right-1 p-1 rounded-full bg-card-pressed opacity-60 hover:bg-card-pressed/90 transition-colors"
          aria-label="More actions"
        >
          ▼
        </button>
      )}
    </div>
  );
};