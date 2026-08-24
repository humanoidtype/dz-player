// client/src/features/sidebar/ui/SidebarDrawer.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/model/authStore';
import { LoginPrompt } from '../../auth/ui/LoginPrompt';
import { youtubeClient } from '../../../shared/lib/api/youtubeClient';

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
  const logout = useAuthStore((s) => s.logout);

  const [showCookies, setShowCookies] = useState(false);
  const [cookieRaw, setCookieRaw] = useState('');
  const [cookieMsg, setCookieMsg] = useState('');

  if (!isOpen) return null;

  const saveCookies = async () => {
    setCookieMsg('Menyimpan…');
    try {
      const resp = await youtubeClient.saveYoutubeCookies(cookieRaw.trim());
      setCookieMsg(`Tersimpan (${resp.count} cookie). Request kini memakai akunmu.`);
      setCookieRaw('');
    } catch (e) {
      setCookieMsg(`Gagal: ${(e as Error).message}`);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-bg/50 backdrop-blur-sm z-40 flex"
      onClick={onClose}
    >
      <aside
        className="w-72 h-full bg-surface rounded-r-2xl shadow-2xl z-50 p-4 flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 border-b border-border mb-3">
          {isLoggedIn && user ? (
            <div className="flex items-center">
              <img
                src={user.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=121212&color=fff&size=48'}
                alt="avatar"
                className="w-12 h-12 rounded-full mr-3"
              />
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm truncate">{user.name}</p>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="text-caption hover:text-text-secondary"
                >
                  Keluar
                </button>
              </div>
            </div>
          ) : (
            <LoginPrompt title="Login untuk melanjutkan jika diblokir YouTube." />
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

        {isLoggedIn && (
          <div className="border-t border-border pt-3 mt-3">
            <button
              onClick={() => setShowCookies((v) => !v)}
              className="text-caption mb-1"
            >
              {showCookies ? '▾' : '▸'} Cookies YouTube (anti-bot)
            </button>
            {showCookies && (
              <div>
                <textarea
                  value={cookieRaw}
                  onChange={(e) => setCookieRaw(e.target.value)}
                  placeholder="Tempel cookies.txt Netscape atau header SID=…; SAPISID=…"
                  rows={4}
                  className="w-full bg-input rounded-md p-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button onClick={() => void saveCookies()} className="btn-primary w-full py-2 text-xs mt-1">
                  Simpan Cookies
                </button>
                {cookieMsg && <p className="text-caption mt-1">{cookieMsg}</p>}
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} className="text-text-tertiary text-sm p-2 self-start">
          Tutup
        </button>
      </aside>
    </div>
  );
};
