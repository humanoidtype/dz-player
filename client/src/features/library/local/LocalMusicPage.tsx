// client/src/features/library/local/LocalMusicPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Media } from '../../../entities/media';
import { db } from '../../../shared/db/db';
import { usePlayerStore } from '../../player/model/playerStore';
import { playMedia } from '../../player/engine/playerEngine';

export const LocalMusicPage: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [locals, setLocals] = useState<Media[]>([]);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const loadFromDb = async () => {
    const all = await db.media.where('source').equals('local').toArray();
    setLocals(
      all.map((m) => ({
        ...m,
        artistName: m.artistName ?? 'Unknown',
        thumbnailUrl: m.thumbnailUrl ?? '',
      })) as Media[]
    );
  };

  useEffect(() => {
    void loadFromDb();
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: Media[] = [];
    for (const file of Array.from(files)) {
      const media: Media = {
        id: `local_${file.name.replace(/\W+/g, '_')}_${file.size}`,
        title: file.name.replace(/\.[^.]+$/, ''),
        artistName: 'Local',
        thumbnailUrl: '',
        streamUrl: URL.createObjectURL(file),
        durationSec: 0,
        source: 'local',
        type: file.type.startsWith('video') ? 'video' : 'audio',
        createdAt: Date.now(),
      };
      await db.media.put({
        id: media.id,
        title: media.title,
        artistName: media.artistName,
        thumbnailUrl: '',
        durationSec: 0,
        source: 'local',
        type: media.type,
        createdAt: media.createdAt,
      });
      added.push(media);
    }
    addToQueue(added);
    await loadFromDb();
  };

  return (
    <div className="p-4">
      <h2 className="text-text-primary mb-4">Local Music</h2>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <button onClick={() => fileRef.current?.click()} className="btn-primary px-4 py-2 rounded-full bg-accent text-white text-sm mb-4">
        Pilih File dari Penyimpanan
      </button>

      <ul className="space-y-2">
        {locals.map((m) => (
          <li key={m.id}>
            <button
              onClick={() => void playMedia(m).catch(() => {})}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-card-pressed text-left"
            >
              <span className="text-accent">▶</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-text-primary truncate">{m.title}</span>
                <span className="block text-xs text-text-secondary">{m.artistName}</span>
              </span>
            </button>
          </li>
        ))}
        {locals.length === 0 && (
          <p className="text-text-secondary text-sm py-6 text-center">Belum ada musik lokal</p>
        )}
      </ul>
    </div>
  );
};
