// client/src/features/player/ui/Controls.tsx
import React from 'react';

export interface ControlsProps {
  isPlaying: boolean;
  disabled?: boolean;
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  disabled = false,
  onPrev,
  onPlayPause,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={onPrev}
        disabled={disabled}
        className="w-11 h-11 rounded-full bg-card-pressed flex items-center justify-center text-text-primary disabled:opacity-40"
        aria-label="Sebelumnya"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
      </button>
      <button
        onClick={onPlayPause}
        disabled={disabled}
        className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-lg disabled:opacity-40"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      <button
        onClick={onNext}
        disabled={disabled}
        className="w-11 h-11 rounded-full bg-card-pressed flex items-center justify-center text-text-primary disabled:opacity-40"
        aria-label="Berikutnya"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" /></svg>
      </button>
    </div>
  );
};
