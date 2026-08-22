// client/src/features/player/ui/SeekBar.tsx
import React from 'react';
import { formatTime } from '../../shared/lib/formatTime';

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
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div className="w-full bg-border rounded-full h-2 mb-2">
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full bg-accent h-full w-full percent-0 transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex text-caption justify-between text-xs">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </>
  );
};