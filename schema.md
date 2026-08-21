# Dz Player - Data Schema & Models

**Version:** 0.4.0 (Updated: 2026-08-21)
**DB Frontend:** Dexie (IndexedDB) `dz-player` v1
**DB Backend:** SQLite `auth.db` (user/session) + `cache.db` (yt-dlp stream cache) — server only
**Remote:** Express `/api/*` proxy YouTube via youtubei.js + yt-dlp

---

## 1. Entity Relationship Overview

```
User 1──∞ Session (cookies encrypted, server only)
Media 1──∞ History (Rewind)
Media 1──∞ Download
Media ∞──∞ Playlist (via PlaylistItem) // My Library = YouTube Playlist mirror, read-only
Queue (runtime, derived dari Media[])
SearchHistory (standalone)
```

---

## 2. Core Types (TypeScript)

```ts
// client/src/entities/media/types.ts (shared via import)
type MediaSource = 'online' | 'local';
type MediaType = 'audio' | 'video';
type LoopMode = 'none' | 'one' | 'all';

interface Media {
  id: string;                   // youtubeId atau "local_<mediaStoreId>"
  title: string;                // max 100 char, 2 lines truncate
  artistName: string;
  thumbnailUrl: string;         // https atau file://
  streamUrl?: string;           // resolved via POST /api/youtube/stream/:id
  streamUrlExpiresAt?: number;  // epoch ms, ~5h dari fetch time. Jika expired, re-fetch sebelum play
  durationSec: number;
  viewCount?: number;
  publishedAgo?: string;        // "2 Years Ago"
  source: MediaSource;
  type: MediaType;
  filePath?: string;            // untuk local/download
  createdAt: number;            // epoch ms
}

interface QueueState {
  list: Media[];
  currentIndex: number;         // -1 jika kosong
  shuffle: boolean;
  loop: LoopMode;
  originalList?: Media[];       // backup saat shuffle on
}

// My Library = mirror YouTube playlist user (read-only Phase 1)
interface Playlist {
  id: string;                   // youtube playlistId (PLxxx) atau local "lib_fav"
  name: string;
  thumbnailUrl?: string;
  mediaIds: string[];
  source: 'youtube' | 'local';
  ownerId?: string;             // google userId
  createdAt: number;
  updatedAt: number;
}

interface HistoryEntry {        // Rewind
  id: string;
  mediaId: string;
  watchedAt: number;            // epoch ms
  progressSec: number;
  completed: boolean;
  isOfflineAvailable: boolean;  // true jika thumbnail+stream cached/downloaded
}

interface DownloadItem {
  id: string;                   // mediaId
  media: Media;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';
  quality: '360p' | '720p' | '1080p' | 'audio';
  progress: number;             // 0-100
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

// Auth — server-side only, tidak expose ke frontend
interface User {
  id: string;                   // google sub
  email: string;
  name: string;
  avatarUrl: string;
}

interface AuthSession {
  id: string;                   // sessionId (UUID, disimpan client di SecureStorage)
  userId: string;
  idToken: string;              // google id_token
  accessToken?: string;
  refreshToken?: string;
  cookiesEncrypted: string;     // AES-GCM encrypted YouTube cookies
  expiresAt: number;
  createdAt: number;
}

interface AppSettings {
  theme: 'system' | 'dark' | 'light';  // default: 'system'
  downloadPath: string;
  maxCacheMB: number;           // default: 500
  autoPlayNext: boolean;
}
```

---

## 3. Database Schema

### 3.1 Frontend Dexie (IndexedDB) — `dz-player` DB v1

```ts
// client/src/shared/db/db.ts
db.version(1).stores({
  media: 'id, source, type, title, createdAt',
  history: 'id, mediaId, watchedAt, progressSec',
  playlist: 'id, source, name, updatedAt',
  playlist_item: '[playlistId+mediaId], playlistId, mediaId, position',
  download: 'id, status, progress, createdAt',
  search_history: 'id, &query, timestamp',
  app_settings: 'key'
});
```

SQL equivalent:

```sql
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist_name TEXT,
  thumbnail_url TEXT,
  stream_url TEXT,
  stream_url_expires_at INTEGER,   -- epoch ms, ~5h TTL. NULL untuk local
  duration_sec INTEGER NOT NULL,
  view_count INTEGER,
  published_ago TEXT,
  source TEXT CHECK(source IN ('online','local')),
  type TEXT CHECK(type IN ('audio','video')),
  file_path TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE history (
  id TEXT PRIMARY KEY,
  media_id TEXT REFERENCES media(id) ON DELETE CASCADE,
  watched_at INTEGER NOT NULL,
  progress_sec INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  is_offline_available INTEGER DEFAULT 0
);
CREATE INDEX idx_history_watched ON history(watched_at DESC);

CREATE TABLE playlist (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  source TEXT CHECK(source IN ('youtube','local')),
  owner_id TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE playlist_item (
  playlist_id TEXT,
  media_id TEXT,
  position INTEGER,
  added_at INTEGER,
  PRIMARY KEY (playlist_id, media_id)
);

CREATE TABLE download (
  id TEXT PRIMARY KEY,
  media_json TEXT NOT NULL,
  status TEXT NOT NULL,
  quality TEXT,
  progress INTEGER DEFAULT 0,
  file_path TEXT,
  total_bytes INTEGER,
  downloaded_bytes INTEGER,
  created_at INTEGER
);

CREATE TABLE search_history (
  id TEXT PRIMARY KEY,
  query TEXT UNIQUE,
  timestamp INTEGER,
  hit_count INTEGER DEFAULT 1
);
```

### 3.2 Backend Express — SQLite (dipisah jadi 2 file DB)

Dipisah supaya `cache.db` (data yt-dlp stream, sering di-write/prune, TTL pendek) tidak numpuk bareng
`auth.db` (data sensitif — user, session, cookies terenkripsi). Efeknya: backup/rotasi lebih gampang,
dan `cache.db` boleh di-`TRUNCATE`/dihapus kapan aja tanpa nyentuh data auth.

#### 3.2.1 `server/data/auth.db`

```sql
CREATE TABLE user (
  id TEXT PRIMARY KEY,          -- google sub
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at INTEGER
);

CREATE TABLE session (
  id TEXT PRIMARY KEY,          -- UUID, ini yang jadi sessionId di client
  user_id TEXT REFERENCES user(id),
  id_token TEXT NOT NULL,
  refresh_token TEXT,
  cookies_encrypted TEXT NOT NULL,  -- AES-GCM encrypted YouTube cookies
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_session_user ON session(user_id);
```

Cookies encrypted: `AES-GCM` dengan `YOUTUBE_COOKIES_ENCRYPT_KEY` (32 bytes, env).
Client hanya menyimpan `sessionId` (UUID) di Capacitor SecureStorage. Cookies tidak pernah keluar dari server.

#### 3.2.2 `server/data/cache.db`

```sql
-- yt-dlp stream URL cache
CREATE TABLE yt_cache (
  key TEXT PRIMARY KEY,         -- "stream:{videoId}:{quality}"
  json TEXT NOT NULL,           -- { streamUrl, durationSec }
  expires_at INTEGER NOT NULL   -- epoch ms, TTL ~5h
);
CREATE INDEX idx_yt_cache_expires ON yt_cache(expires_at);
```

Tidak ada foreign key ke `auth.db` (beda file SQLite, jadi FK antar-DB nggak bisa dipaksa di level SQL).
Kalau butuh cleanup job (hapus row expired), cukup query `cache.db` sendiri:

```sql
DELETE FROM yt_cache WHERE expires_at < strftime('%s','now') * 1000;
```

Koneksi di kode (contoh `better-sqlite3`):

```ts
// server/src/db/index.ts
import Database from 'better-sqlite3';

export const authDb = new Database('server/data/auth.db');
export const cacheDb = new Database('server/data/cache.db');
```

---

## 4. API Contracts (Express Backend)

Base: `http://localhost:3000/api` (dev), `https://dzplayer.dzfee.id/api` (prod).
Headers: `Authorization: Bearer <sessionId>` untuk semua `/youtube/*` dan `/download/*`.

### `POST /api/auth/google`
Req: `{ idToken: string, accessToken: string }`
Server: validate idToken → init youtubei.js OAuth → generate YouTube cookies → encrypt → simpan session (`auth.db`)
Res: `{ session: { id }, user: { id, email, name, avatarUrl } }`

### `GET /api/me`
Res: `{ user, session }` | `401`

### `DELETE /api/auth/logout`
Res: `{ ok: true }` → clear session (`auth.db`) + cookies

### `GET /api/youtube/trending?tab=dashboard|trending&page=1&limit=20`
Via: youtubei.js
Res:
```json
{
  "data": [{
    "id": "vid_abc123",
    "title": "Sample Title",
    "artistName": "Channel Name",
    "thumbnailUrl": "https://i.ytimg.com/vi/.../hqdefault.jpg",
    "durationSec": 1235,
    "viewCount": 3300,
    "publishedAgo": "2 Years Ago",
    "type": "video"
  }],
  "nextPage": 2,
  "hasMore": true
}
```
Error bot: `{ "error": { "code": "BOT_DETECTED", "message": "..." } }` → `401`

### `GET /api/youtube/search?q=Alan%20wal&limit=20`
Via: youtubei.js. Same response format.

### `GET /api/youtube/suggest?q=Alan%20wal`
Via: youtubei.js
Res: `{ "suggestions": ["Alan walker", "Alan walker faded", "Alan walker alone"] }`

### `POST /api/youtube/stream/:id`
Via: yt-dlp (dengan cache `cache.db` → `yt_cache`, TTL 5h)
Body: `{ quality: "360p" | "720p" | "1080p" | "audio" }`
Res: `{ "id": "vid_abc123", "streamUrl": "https://.../videoplayback?...", "expiresAt": 1234567890, "durationSec": 1235 }`
Client simpan `streamUrl` + `streamUrlExpiresAt` ke Dexie `media` table.

### `GET /api/youtube/playlist` (My Library, auth required, read-only)
Via: youtubei.js
Res: `{ "playlists": [{ "id": "PLxxx", "name": "My Library", "thumbnailUrl": "...", "count": 28 }] }`

### `GET /api/youtube/playlist/:id` (auth required, read-only)
Res: `{ "items": [{ "id": "vid_123", "title": "...", "thumbnailUrl": "...", "durationSec": 230 }] }`

### `GET /api/download/:id?quality=720p` (auth required)
Via: yt-dlp
Res: stream file atau `{ "url": "https://.../videoplayback" }` untuk Capacitor Filesystem download.

Error generic:
```json
{ "error": { "code": "BOT_DETECTED" | "NOT_FOUND" | "UNAUTHORIZED", "message": "..." } }
```

---

## 5. Frontend Repository Pattern

```ts
// client/src/shared/lib/api/youtubeClient.ts
const authHeaders = () => ({
  Authorization: `Bearer ${authStore.getState().sessionId}`
});

export const youtubeClient = {
  trending: (tab: string, page: number) =>
    fetch(`/api/youtube/trending?tab=${tab}&page=${page}`, { headers: authHeaders() }).then(r => r.json()),
  search: (q: string) =>
    fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() }).then(r => r.json()),
  suggest: (q: string) =>
    fetch(`/api/youtube/suggest?q=${encodeURIComponent(q)}`).then(r => r.json()),
  stream: (id: string, quality: string) =>
    fetch(`/api/youtube/stream/${id}`, { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ quality }) }).then(r => r.json()),
  playlists: () =>
    fetch('/api/youtube/playlist', { headers: authHeaders() }).then(r => r.json()),
}
```

TanStack Query keys: `['trending', tab, page]`, `['search', q]`, `['suggest', q]`, `['myLibrary']`.
Dexie: write-through tiap fetch trending/search ke `media` table.

---

## 6. streamUrl TTL Logic (Frontend)

```ts
// client/src/features/player/engine/playerEngine.ts
async function resolveStreamUrl(media: Media): Promise<string> {
  const now = Date.now();
  if (media.streamUrl && media.streamUrlExpiresAt && media.streamUrlExpiresAt > now) {
    return media.streamUrl; // cache hit
  }
  // expired atau belum ada — re-fetch
  const res = await youtubeClient.stream(media.id, 'auto');
  // update Dexie
  await db.media.update(media.id, {
    streamUrl: res.streamUrl,
    streamUrlExpiresAt: res.expiresAt,
  });
  return res.streamUrl;
}
```

---

## 7. Local File Scan (Capacitor)

MediaStore via Capacitor plugin:
```
_id, title, artist, duration, size, relative_path, mime_type
```
Map to `Media`: `id = "local_<_id>"`, `source = "local"`, `streamUrl = undefined`, `filePath = absolute_path`.

---

## 8. Queue Persistence

localStorage `dz_queue`:
```json
{ "listIds": ["vid_1", "vid_2"], "currentIndex": 0, "shuffle": false, "loop": "all" }
```
Restore: join `media` Dexie table by id. Jika media tidak ada di Dexie, skip (sudah dihapus/expired).

---

## 9. Validation

- `title`: 1-100 char, trim
- `durationSec`: >= 0
- `progress`: 0-100
- `query`: 1-50 char, lowercase, dedup
- `cookiesEncrypted`: non-empty, hanya di server (`auth.db`)
- `streamUrlExpiresAt`: epoch ms, harus > createdAt

---

## 10. Migration

- Dexie v1: initial schema (termasuk `stream_url_expires_at`)
- Dexie v2: add `quality` to download (nullable → backfill `'720p'`)
- Backend `auth.db`: via `better-sqlite3` migrate script
- Backend `cache.db`: file baru, terpisah dari `auth.db` — migrate script sendiri, boleh di-drop/rebuild kapan saja tanpa memengaruhi data auth

---

## 11. Seed Data

```ts
const mockMedia: Media = {
  id: "mock_1",
  title: "Sample Title With Two Line If Long Text...",
  artistName: "Artist Name",
  thumbnailUrl: "/mock/thumb.jpg",
  streamUrl: undefined,
  streamUrlExpiresAt: undefined,
  durationSec: 1235,
  viewCount: 3300,
  publishedAgo: "2 Years Ago",
  source: "online",
  type: "video",
  createdAt: Date.now()
}
```

---

## 12. Architecture Diagram

```
[React Client]
  TanStack Query ──► [Express /api/youtube/*] ──► youtubei.js ──► YouTube (browsing)
                                              ──► yt-dlp       ──► YouTube (stream/dl)
  Dexie (media/history/download)              auth.db  (user, session + cookies encrypted)
  Capacitor SecureStorage (sessionId only)     cache.db (yt_cache, streamUrl TTL 5h)
  Capacitor Filesystem (downloads)

[Player Engine]
  resolveStreamUrl() ──► check streamUrlExpiresAt ──► Dexie hit / re-fetch API (cache.db)
  QueueState (Zustand) ──► history (Dexie) ──► Rewind

[MediaStore] ──► Dexie media (source=local)
```