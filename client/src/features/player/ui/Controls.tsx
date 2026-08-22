// client/src/features/player/ui/Controls.tsx
import React from 'react';
import { Media } from '../../entities/media/types';
import { formatTime } from '../../shared/lib/formatTime';

export interface ControlsProps {
  media: Media;
  onSeek: (sec: number) => void;
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  media,
  onSeek,
  onPrev,
  onPlayPause,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-center gap-6">
      <button onClick={onPrev} className="w-10 h-10 rounded-full bg-card-pressed flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 18l-5-5l5-5" /></svg>
      </button>
      <button onClick={onPlayPause} className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center">
        {/** play/pause icon based on state */}
      </button>
      <button onClick={onNext} className="w-10 h-10 rounded-full bg-card-pressed flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18l5-5-5-5" /></svg>
      </button>
      <input
        type="range"
        min="0"
        max={media.durationSec || 180}
        className="flex-1 w-full accent-color-yellow-500"
        onChange={(e) => onSeek(parseInt(e.target.value, 10))}
      />
    </div>
  );
};