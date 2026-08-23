// client/src/app/layout.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/model/authStore';
import { usePlayerStore } from '../features/player/model/playerStore';
import { SidebarDrawer } from '../features/sidebar/ui/SidebarDrawer';
import { SearchOverlay } from '../features/search/ui/SearchOverlay';
import type { Media } from '../entities/media';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, isLoggedIn } = useAuthStore.getState();
  const { currentMedia, isExpanded } = usePlayerStore.getState();

  const bottomNavItems = [
    { key: 'menu', icon: 'Menu', onClick: () => console.log('toggle sidebar') },
    { key: 'search', icon: 'Search', onClick: () => navigate('/search') },
  ];

  const miniPlayerVisible = !isExpanded && currentMedia !== null;

  return (
    <div className="min-h-screen bg-bg">
      <SidebarDrawer
        isOpen={!isLoggedIn}
        onToggle={() => {}}
        isLoggedIn={isLoggedIn}
      />

      <SearchOverlay
        isOpen={false}
        onClose={() => {}}
        onSearch={() => {}}
      />

      <div className="flex flex-col">
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>

        <div className="bg-bg border-t border-border fixed bottom-0 left-0 right-0 h-16 flex items-center justify-between px-4">
          <button onClick={() => console.log('toggle sidebar')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3a1 1 0 10-2 0V6a1 1 0 011-1zm0 3a1 1 0 011 1v3a1 1 0 10-2 0v-1a1 1 0 012 0v1zM2 10a1 1 0 011-1h3a1 1 0 100-2H3a1 1 0 01-1-1v-3a1 1 0 112 0v3a1 1 0 01-1 1H2zm0 3a1 1 0 011-1h5a1 1 0 100-2H3a1 1 0 01-1-1v-3a1 1 0 112 0v3a1 1 0 01-1 1H2zm0 3a1 1 0 011-1h5a1 1 0 100-2H3a1 1 0 01-1-1v-3a1 1 0 112 0v3a1 1 0 01-1 1H2z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {miniPlayerVisible ? (
            <div className="flex items-center gap-2">
              <img
                src="https://i.ytimg.com/vi/sample/hqdefault.jpg"
                alt="thumb"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-text-primary line-clamp-1">Sample Title</p>
                <p className="text-text-secondary text-caption">Artist</p>
              </div>
            </div>
          ) : null}

          <button onClick={() => console.log('open search')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 4a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2V4zm0 3a1 1 0 110 2h4a1 1 0 110 2h-4a1 1 0 110 0-2zM2 10a1 1 0 110 2h3a1 1 0 110 1h-3a1 1 0 110-1zm0 3a1 1 0 110 2h5a1 1 0 110 2h-4a1 1 0 110-2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};