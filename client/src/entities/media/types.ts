type MediaSource = 'online' | 'local';
type MediaType = 'audio' | 'video';
type LoopMode = 'none' | 'one' | 'all';

interface Media {
  id: string;
  title: string;
  artistName: string;
  thumbnailUrl: string;
  streamUrl?: string;
  streamUrlExpiresAt?: number;
  durationSec: number;
  viewCount?: number;
  publishedAgo?: string;
  source: MediaSource;
  type: MediaType;
  filePath?: string;
  createdAt: number;
}

interface QueueState {
  list: Media[];
  currentIndex: number;
  shuffle: boolean;
  loop: LoopMode;
  originalList?: Media[];
}

interface Playlist {
  id: string;
  name: string;
  thumbnailUrl?: string;
  mediaIds: string[];
  source: 'youtube' | 'local';
  ownerId?: string;
  createdAt: number;
  updatedAt: number;
}

interface HistoryEntry {
  id: string;
  mediaId: string;
  watchedAt: number;
  progressSec: number;
  completed: boolean;
  isOfflineAvailable: boolean;
}

interface DownloadItem {
  id: string;
  media: Media;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';
  quality: '360p' | '720p' | '1080p' | 'audio';
  progress: number;
  filePath?: string;
  totalBytes?: number;
  downloadedBytes?: number;
  createdAt: number;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  hitCount: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

interface AuthSession {
  id: string;
  userId: string;
  idToken: string;
  accessToken?: string;
  refreshToken?: string;
  cookiesEncrypted: string;
  expiresAt: number;
  createdAt: number;
}

interface AppSettings {
  theme: 'system' | 'dark' | 'light';
  downloadPath: string;
  maxCacheMB: number;
  autoPlayNext: boolean;
}

// exported for shared use
export { Media, QueueState, Playlist, HistoryEntry, DownloadItem, SearchHistoryItem, User, AuthSession, AppSettings, MediaSource, MediaType, LoopMode };