// client/src/shared/db/db.ts
import Dexie, { type Table } from 'dexie';

export interface MediaRecord {
  id: string;
  title: string;
  artistName?: string;
  thumbnailUrl?: string;
  streamUrl?: string;
  streamUrlExpiresAt?: number;
  durationSec: number;
  viewCount?: number;
  publishedAgo?: string;
  source: 'online' | 'local';
  type: 'audio' | 'video';
  filePath?: string;
  createdAt: number;
}

export interface HistoryRecord {
  id: string;
  mediaId: string;
  watchedAt: number;
  progressSec: number;
  completed: number;
  isOfflineAvailable: number;
}

export interface PlaylistRecord {
  id: string;
  name: string;
  thumbnailUrl?: string;
  source: 'youtube' | 'local';
  ownerId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DownloadRecord {
  id: string;
  media_json: string;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';
  quality?: string;
  progress: number;
  filePath?: string;
  totalBytes?: number;
  downloadedBytes?: number;
  createdAt: number;
}

export interface SearchHistoryRecord {
  id: string;
  query: string;
  timestamp: number;
  hitCount: number;
}

export interface AppSettingsRecord {
  key: string;
  value: string;
}

export class DzPlayerDB extends Dexie {
  media!: Table<MediaRecord, string>;
  history!: Table<HistoryRecord, string>;
  playlist!: Table<PlaylistRecord, string>;
  playlist_item!: Table<{ playlistId: string; mediaId: string; position: number; addedAt: number }, [string, string]>;
  download!: Table<DownloadRecord, string>;
  search_history!: Table<SearchHistoryRecord, string>;
  app_settings!: Table<AppSettingsRecord, string>;

  constructor() {
    super('dz-player');
    super.version(1).stores({
      media: 'id, source, type, title, createdAt',
      history: 'id, mediaId, watchedAt, progressSec',
      playlist: 'id, source, name, updatedAt',
      playlist_item: '[playlistId+mediaId], playlistId, mediaId, position',
      download: 'id, status, progress, createdAt',
      search_history: 'id, &query, timestamp',
      app_settings: 'key',
    });
  }
}

export const db = new DzPlayerDB();