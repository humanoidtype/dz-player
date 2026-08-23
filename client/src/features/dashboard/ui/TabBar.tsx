// client/src/features/dashboard/ui/TabBar.tsx
import React from 'react';

export interface TabBarProps {
  activeTab: 'dashboard' | 'history' | 'trending' | 'myLibrary';
  onTabChange: (tab: 'dashboard' | 'history' | 'trending' | 'myLibrary') => void;
}

const inactiveClass = 'inline-flex items-center rounded-md px-8 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100/20 disabled:opacity-50 disabled:cursor-not-allowed';
const activeClass = 'inline-flex items-center rounded-md px-8 py-2 text-sm font-medium text-text-primary bg-accent';

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { key: TabBarProps['activeTab']; label: string }[] = [
    { key: 'dashboard', label: 'DASHBOARD' },
    { key: 'history', label: 'HISTORY' },
    { key: 'trending', label: 'TRENDING' },
    { key: 'myLibrary', label: 'MY LIBRARY' },
  ];

  return (
    <div className="bg-bg rounded-b-lg border-t border-border flex">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={activeTab === tab.key ? activeClass : inactiveClass}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};