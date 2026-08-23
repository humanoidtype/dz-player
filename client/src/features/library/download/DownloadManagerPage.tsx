// client/src/features/library/download/DownloadManagerPage.tsx
import React, { useEffect, useState } from 'react';
import { youtubeClient } from '../../../shared/lib/api/youtubeClient';
import { db } from '../../../shared/db/db';
import type { DownloadRecord } from '../../../shared/db/db';
import { usePlayerStore } from '../../player/model/playerStore';

type Quality = '360p' | '720p' | '1080p' | 'audio';

export const DownloadManagerPage: React.FC = () => {
  const [mediaId, setMediaId] = useState('');
  const [quality, setQuality] = useState<Quality>('720p');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const currentMedia = usePlayerStore((s) => s.currentMedia);

  const load = async () => {
    const all = await db.download.reverse().sortBy('createdAt');
    setDownloads(all.slice(0, 50));
  };

  useEffect(() => {
    void load();
  }, []);

  const start = async () => {
    const id = mediaId.trim() || currentMedia?.id;
    if (!id) {
      setMessage('Isi ID video atau pilih lagu dulu');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await youtubeClient.startDownload(id.replace(/^vid_/, ''), quality);
      await db.download.put({
        id: `${id}_${quality}_${Date.now()}`,
        media_json: JSON.stringify({ id }),
        status: 'completed',
        quality,
        progress: 100,
        filePath: result.filePath,
        createdAt: Date.now(),
      });
      setMessage(`Selesai: ${result.filePath}`);
      await load();
    } catch (e) {
      setMessage(`Gagal: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-text-primary mb-4">Download Manager</h2>

      <div className="flex flex-col gap-3 max-w-md">
        <input
          value={mediaId}
          onChange={(e) => setMediaId(e.target.value)}
          placeholder={currentMedia ? currentMedia.id : 'ID video (mis. vid_dQw4w9WgXcQ)'}
          className="bg-input rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value as Quality)}
          className="bg-input rounded-lg px-3 py-2 text-sm text-text-primary"
        >
          <option value="360p">360p</option>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="audio">Audio only</option>
        </select>
        <button
          onClick={() => void start()}
          disabled={busy}
          className="btn-primary px-4 py-2 rounded-full bg-accent text-white text-sm disabled:opacity-50"
        >
          {busy ? 'Mengunduh...' : 'Mulai Download'}
        </button>
        {message && <p className="text-text-secondary text-xs">{message}</p>}
      </div>

      <ul className="mt-6 space-y-2">
        {downloads.map((d) => (
          <li key={d.id} className="flex items-center gap-3 p-2 bg-card rounded-lg text-sm">
            <span className={d.status === 'completed' ? 'text-green-400' : 'text-text-error'}>
              {d.status === 'completed' ? '✓' : '×'}
            </span>
            <span className="flex-1 min-w-0 truncate text-text-primary">{d.filePath ?? d.id}</span>
            <span className="text-text-tertiary text-xs">{d.quality}</span>
          </li>
        ))}
        {downloads.length === 0 && (
          <p className="text-text-secondary text-sm py-6 text-center">Tidak ada riwayat download</p>
        )}
      </ul>
    </div>
  );
};
