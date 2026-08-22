// client/src/features/player/ui/QueueSheet.tsx
import React from 'react';
import { Media } from '../../entities/media';
import { usePlayerStore } from '../../player/model/playerStore';
import { formatTime } from '../../shared/lib/formatTime';

export interface QueueSheetProps {
  visible: boolean;
  onClose: () => void;
  onPlayClick?: (media: Media) => void;
}

export const QueueSheet: React.FC<QueueSheetProps> = ({
  visible,
  onClose,
  onPlayClick,
}) => {
  const { queue, currentMedia, toggleShuffle, toggleLoop } = usePlayerStore.getState();

  const items = queue.list.map((m, idx) => (
    <div
      key={m.id}
      className="flex items-center justify-between px-3 py-2 text-sm"
    >
      <span>{m.title}</span>
      <span>{formatTime(m.durationSec || 0)}</span>
    </div>
  ));

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-surface rounded-b-lg w-full max-w-md shadow-lg border-t border-border max-h-80 overflow-y-auto">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">Queue</h3>
          <button onClick={onClose} className="text-text-tertiary text-sm">×</button>
        </div>
      </div>
      <div className="p-2">
        {items.length === 0 ? (
          <p className="text-text-secondary text-center py-4">Queue kosong</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {items}
          </div>
        )}
      </div>
    </div>
  );
};