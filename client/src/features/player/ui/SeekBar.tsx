// client/src/features/player/ui/SeekBar.tsx
import React from 'react';
import { formatTime } from '../../../shared/lib/formatTime';

export interface SeekBarProps {
  duration: number;
  currentTime: number;
  onSeek: (sec: number) => void;
}

export const SeekBar: React.FC<SeekBarProps> = ({
  duration,
  currentTime,
  onSeek,
}) => {
  const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;

  return (
    <div className="w-full">
      <div className="relative bg-border rounded-full h-2 mb-2">
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full bg-accent transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={0}
          max={safeDuration || 100}
          step={1}
          value={Math.floor(currentTime)}
          onChange={(e) => onSeek(parseInt(e.target.value, 10))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          aria-label="Posisi lagu"
        />
      </div>
      <div className="flex text-caption justify-between text-xs text-text-secondary">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(safeDuration)}</span>
      </div>
    </div>
  );
};
