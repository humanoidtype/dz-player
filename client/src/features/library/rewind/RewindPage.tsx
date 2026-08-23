// client/src/features/library/rewind/RewindPage.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../../../shared/db/db';
import type { HistoryRecord, MediaRecord } from '../../../shared/db/db';

type Filter = 'today' | 'week' | 'all';

const FILTER_LABELS: Record<Filter, string> = {
  today: 'Today',
  week: 'This Week',
  all: 'All',
};

export const RewindPage: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('today');
  const [rows, setRows] = useState<{ history: HistoryRecord; media: MediaRecord | undefined }[]>([]);

  useEffect(() => {
    void (async () => {
      const cutoff =
        filter === 'today'
          ? new Date().setHours(0, 0, 0, 0)
          : filter === 'week'
            ? Date.now() - 7 * 24 * 60 * 60 * 1000
            : 0;
      const history = await db.history.where('watchedAt').aboveOrEqual(cutoff).reverse().sortBy('watchedAt');
      const joined = await Promise.all(
        history.slice(0, 50).map(async (h) => ({ history: h, media: await db.media.get(h.mediaId) }))
      );
      setRows(joined);
    })();
  }, [filter]);

  return (
    <div className="p-4">
      <h2 className="text-text-primary mb-4">Rewind History</h2>

      <div className="flex gap-2 mb-4">
        {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${filter === f ? 'bg-accent text-white' : 'bg-card-pressed text-text-secondary'}`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {rows.map(({ history, media }) => (
          <li key={history.id} className="flex items-center gap-3 p-2 rounded-lg bg-card">
            {media?.thumbnailUrl ? (
              <img src={media.thumbnailUrl} alt="" className="w-12 h-8 object-cover rounded" />
            ) : (
              <span className="w-12 h-8 rounded bg-card-pressed inline-block" />
            )}
            <span className="flex-1 min-w-0">
              <span className="block text-sm text-text-primary truncate">{media?.title ?? history.mediaId}</span>
              <span className="block text-xs text-text-secondary">
                {new Date(history.watchedAt).toLocaleString()} • {history.completed ? 'selesai' : `${history.progressSec}s`}
              </span>
            </span>
          </li>
        ))}
        {rows.length === 0 && (
          <p className="text-text-secondary text-sm py-6 text-center">Belum ada riwayat tontonan</p>
        )}
      </ul>
    </div>
  );
};
