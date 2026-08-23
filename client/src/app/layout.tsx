// client/src/app/layout.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../features/player/model/playerStore';
import { SidebarDrawer } from '../features/sidebar/ui/SidebarDrawer';
import { SearchOverlay } from '../features/search/ui/SearchOverlay';
import { togglePlay, seekTo } from '../features/player/engine/playerEngine';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const currentMedia = usePlayerStore((s) => s.currentMedia);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const positionSec = usePlayerStore((s) => s.positionSec);
  const isExpanded = usePlayerStore((s) => s.isExpanded);
  const setExpanded = usePlayerStore((s) => s.setExpanded);

  const onPlayerPage = location.pathname.startsWith('/player');
  const miniPlayerVisible = !isExpanded && currentMedia !== null && !onPlayerPage;

  return (
    <div className="min-h-screen bg-bg">
      <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="flex flex-col">
        <div className={`flex-1 overflow-auto p-4 ${miniPlayerVisible ? 'pb-40' : 'pb-24'}`}>
          {children}
        </div>

        {!isExpanded && miniPlayerVisible && currentMedia && (
          <div
            onClick={() => {
              setExpanded(true);
              navigate(`/player/${currentMedia.id}`);
            }}
            className="bg-surface border-t border-border fixed bottom-16 left-0 right-0 h-14 flex items-center px-3 gap-3 cursor-pointer z-30"
          >
            <img
              src={currentMedia.thumbnailUrl}
              alt={currentMedia.title}
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm truncate">{currentMedia.title}</p>
              <p className="text-text-secondary text-xs truncate">{currentMedia.artistName}</p>
            </div>
            <div style={{ width: 32 }} className="h-8 relative overflow-hidden rounded bg-card-pressed">
              <div
                className="absolute left-0 top-0 h-full bg-accent opacity-70"
                style={{ width: currentMedia.durationSec ? `${(positionSec / currentMedia.durationSec) * 100}%` : '0%' }}
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
          </div>
        )}

        <div className="bg-bg border-t border-border fixed bottom-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-30">
          <button onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>

          {miniPlayerVisible && (
            <button onClick={() => seekTo(0)} aria-label="Miniplayer" className="text-text-tertiary text-xs">
              ♪
            </button>
          )}

          <button onClick={() => setSearchOpen(true)} aria-label="Cari">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
