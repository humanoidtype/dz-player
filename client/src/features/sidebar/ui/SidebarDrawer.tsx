// client/src/features/sidebar/ui/SidebarDrawer.tsx
import React, { useState } from 'react';
import { Button } from '../../shared/ui/Button';

export interface SidebarDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  isLoggedIn: boolean;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onToggle,
  isLoggedIn,
}) => {
  const menuItems = [
    { key: 'discover', label: 'Discover', icon: 'Menu' },
    { key: 'local', label: 'Local', icon: 'Music' },
    { key: 'rewind', label: 'Rewind', icon: 'Rewind' },
    { key: 'download', label: 'Download', icon: 'Download' },
    { key: 'settings', label: 'Settings', icon: 'Settings' },
  ];

  return isOpen ? (
    <div className="fixed inset-0 bg-bg/50 backdrop-blur-sm z-40 flex">
      <aside
        className="w-64 h-full bg-surface rounded-2xl shadow-2xl transform translate-x-full md:translate-x-0 transition-transform duration-250 ease-out z-50"
        onClick={onToggle}
      >
        <div className="p-4 border-b border-border">
          {isLoggedIn ? (
            <div>
              <img
                src="https://ui-avatars.com/api/?name=User&background=121212&color=fff&size=48"
                alt="avatar"
                className="w-12 h-12 rounded-full mr-3"
              />
              <span className="text-text-primary">User</span>
              <button onClick={onToggle} className="text-text-tertiary text-sm mt-2">Login out</button>
            </div>
          ) : (
            <Button onClick={onToggle} className="w-full py-2 text-sm mt-4">
              Login with Google
            </Button>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                // navigasi internal; bisa pakai query param atau store
                onToggle();
              }}
              className="w-full flex items-center rounded-md px-3 py-2 text-sm hover:bg-card-pressed"
            >
              <span className="mr-2">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
      </aside>
    </div>
  ) : null;
};