// client/src/features/sidebar/ui/SidebarDrawer.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui/Button';
import { useAuthStore } from '../../auth/model/authStore';

export interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  key: string;
  label: string;
  path?: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'discover', label: 'Discover', path: '/', icon: '🏠' },
  { key: 'library', label: 'My Library', path: '/library', icon: '📚' },
  { key: 'local', label: 'Local Music', path: '/local', icon: '🎵' },
  { key: 'rewind', label: 'Rewind', path: '/rewind', icon: '⏪' },
  { key: 'download', label: 'Downloads', path: '/downloads', icon: '⬇️' },
];

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.sessionId !== null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-bg/50 backdrop-blur-sm z-40 flex"
      onClick={onClose}
    >
      <aside
        className="w-64 h-full bg-surface rounded-r-2xl shadow-2xl z-50 p-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 border-b border-border mb-3">
          {isLoggedIn && user ? (
            <div>
              <img
                src={user.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=121212&color=fff&size=48'}
                alt="avatar"
                className="w-12 h-12 rounded-full mr-3"
              />
              <span className="text-text-primary">{user.name}</span>
            </div>
          ) : (
            <Button
              onClick={() => {
                onClose();
                navigate('/library');
              }}
              className="w-full py-2 text-sm mt-1"
            >
              Login with Google
            </Button>
          )}
        </div>

        <nav className="space-y-1 flex-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                if (item.path) navigate(item.path);
                onClose();
              }}
              className="w-full flex items-center rounded-md px-3 py-2 text-sm hover:bg-card-pressed text-text-primary"
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={onClose} className="text-text-tertiary text-sm p-2 self-start">
          Tutup
        </button>
      </aside>
    </div>
  );
};
