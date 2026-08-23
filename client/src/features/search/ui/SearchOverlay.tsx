// client/src/features/search/ui/SearchOverlay.tsx
import React, { useState } from 'react';
import { Button } from '../../../shared/ui/Button';

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (q: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSearch,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setQuery(val);
    if (val.length >= 2) {
      onSearch(val);
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <input
          type="text"
          value={query}
          onInput={handleInput}
          placeholder="Cari video atau artis..."
          className="bg-input rounded-full px-4 py-2 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <Button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary">
          ×
        </Button>
      </div>
    </div>
  ) : null;
};