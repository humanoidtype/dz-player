// client/src/features/search/ui/SearchOverlay.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Media } from '../../../entities/media';
import { youtubeClient } from '../../../shared/lib/api/youtubeClient';
import { isBotError } from '../../../shared/lib/api/client';
import { LoginPrompt } from '../../auth/ui/LoginPrompt';
import { Button } from '../../../shared/ui/Button';
import { playMedia } from '../../player/engine/playerEngine';

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [botDetected, setBotDetected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSuggestions([]);
      setResults([]);
      setBotDetected(false);
    }
  }, [isOpen]);

  const runSearch = useCallback(async (q: string) => {
    setLoading(true);
    setBotDetected(false);
    try {
      const items = await youtubeClient.search(q);
      setResults(items.slice(0, 12));
    } catch (e) {
      if (isBotError(e)) setBotDetected(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const sugg = await youtubeClient.suggest(value.trim());
        setSuggestions(sugg.slice(0, 8));
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSelectSuggestion = (s: string) => {
    setSuggestions([]);
    setQuery(s);
    void runSearch(s);
  };

  const handlePlay = async (m: Media) => {
    try {
      await playMedia(m);
      onClose();
    } catch {
      // stream gagal; tetap di overlay
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-bg/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="sticky top-0 bg-bg p-4 flex items-center gap-2 border-b border-border">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim().length >= 2) {
              setSuggestions([]);
              void runSearch(query.trim());
            }
          }}
          placeholder="Cari video atau artis..."
          autoFocus
          className="bg-input rounded-full px-4 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent text-text-primary"
        />
        <Button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-text-tertiary">
          ×
        </Button>
      </div>

      <div className="p-4">
        {suggestions.length > 0 && (
          <ul className="mb-4 space-y-1">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-card-pressed"
                >
                  🔍 {s}
                </button>
              </li>
            ))}
          </ul>
        )}

        {loading && <p className="text-text-secondary text-sm py-4">Mencari...</p>}

        {!loading && results.length > 0 && (
          <ul className="space-y-3">
            {results.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => void handlePlay(m)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-card-pressed text-left"
                >
                  <img src={m.thumbnailUrl} alt={m.title} className="w-16 h-10 object-cover rounded" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-text-primary truncate">{m.title}</span>
                    <span className="block text-xs text-text-secondary truncate">{m.artistName}</span>
                  </span>
                  <span className="text-accent">▶</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {botDetected && (
          <LoginPrompt onSuccess={() => {
            setBotDetected(false);
            if (query.trim().length >= 2) void runSearch(query.trim());
          }} />
        )}

        {!loading && !botDetected && query.trim().length >= 2 && suggestions.length === 0 && results.length === 0 && (
          <p className="text-text-secondary text-sm py-4">Tidak ada hasil</p>
        )}
      </div>
    </div>
  );
};
