# Dz Player - Product Requirements Document (PRD)

**Version:** 0.2.0 (Updated: 2026-08-21)
**Status:** Draft - Pre Development
**Owner:** dzfee.id
**Source:** Mockup analysis dari `mockup/*.jpg` (5 screens)

---

## 1. Vision & Overview

**Dz Player** adalah media player hybrid (YouTube Online Stream + Local Playback) untuk Android (Termux-first, mobile portrait) dengan fokus pada pengalaman video/audio yang minimal, dark, dan cepat. Tagline implisit dari mockup: *player ringan dengan queue & download manager terintegrasi*.

**Online Stream = YouTube.** Untuk menghindari deteksi bot YouTube, app wajib support **Login via Google (OAuth PKCE)** untuk mendapatkan cookies/session yang valid dan dipakai untuk semua request YouTube (trending, search, stream, playlist).

**Goal MVP:** User bisa login Google -> browse Discover/Trending YouTube, search dengan live recommendations, play media dengan queue/shuffle/loop, serta manage Rewind (history cache offline), Download Manager (video/audio), Local Music/Videos, dan My Library (profile + playlist YouTube user) dalam satu app.

**Non-Goals MVP:** Social features (comment, like), casting, upload, My Library write (create/rename playlist).

---

## 2. Target User & Persona

| Persona | Need | Pain Point |
|---------|------|------------|
| **Casual Viewer** | Nonton trending & history cepat | App player lain berat, iklan |
| **Collector** | Manage local music/video offline | File scattered, no queue |
| **Downloader** | Download untuk offline | Download manager terpisah |

Platform utama: Android 9+ portrait, one-hand usage.

---

## 3. Scope & Phases (Full Build)

> PRD ini list **semua yang dibutuhkan untuk membangun project** dari 0 sampai scalable, bukan MVP lean.

### Phase 1 - Foundation (Wajib Jalan Dulu)
1. **Auth - Login Google (OAuth PKCE) + Cookie Manager**: Login untuk dapat cookies YouTube agar tidak kedetek bot. Simpan secure, auto-refresh, dipakai semua request YouTube. Guest mode tetap bisa tapi terbatas/riskan bot.
2. Dashboard (4 tabs: Dashboard, History, Trending, My Library)
3. Search dengan Live Recommendations + History
4. Player (video/audio) + Mini Player persistent
5. Queue System (Shuffle, Loop, Reorder, Next queue)
6. Sidebar Navigation (Online: Discover, Local: Music/Videos, Utility: Rewind/Download Manager/Setting)
7. Local Playback (scan storage MediaStore)
8. Download Manager (video/audio, pause/resume/cancel)
9. Rewind = History cache offline
10. My Library = User Profile + YouTube Playlist via Google (read-only, lihat playlist/liked dari akun YouTube yang login)

### Phase 2 - Growth (Stability & UX)
- Background playback + notification controls + Media Session via `@capacitor-community/background-runner`
- Picture-in-Picture & rotate handling
- Offline cache strategy + storage management (LRU image 500MB, auto-clean)
- Playlist CRUD lokal

### Phase 3 - Scale
- My Library write (create/rename playlist ke YouTube)
- Guest mode proxy (saat ini: direct + retry/backoff)
- Recommendation engine lanjutan
- Analytics (play, retention, download success)
- Multi-account Google
- Cloud sync (opsional)

---

## 4. Functional Requirements

### 4.1 Dashboard (`dashboard.jpg`)
- **FR-D1:** Header `DASHBOARD` + TabBar 4 items. Active tab highlight purple `#9B00FF`.
- **FR-D2:** List vertical card. Tiap card: Thumbnail 1:1 (left 30%) + Content (Title max 2 lines truncated `...`, Artist, Metadata `X Views • Y Ago`, Dropdown `▼`).
- **FR-D3:** Tap card -> navigate ke Player dengan queue auto (selected item + related).
- **FR-D4:** Tap `▼` -> bottom sheet action: Play Next, Add to Queue, Download, Share, Report.
- **FR-D5:** Empty state + skeleton loader.
- **FR-D6:** Pull-to-refresh & infinite scroll (pagination 20).

### 4.2 Player (`player.jpg`, `playerQueueOpen.jpg`)
- **FR-P1:** TopBar: `Minimize ▼` (collapse to mini-player) kiri, `⋮` more kanan.
- **FR-P2:** Media View: Video stretch crop, image fallback. Icon rotate kanan bawah untuk landscape lock.
- **FR-P3:** Metadata: Title marquee (scroll jika overflow), Artist center.
- **FR-P4:** SeekBar: `current (05:32)` - progress purple - `duration (20:35)`, draggable, tap to seek.
- **FR-P5:** Controls 5 tombol: `⏪ 10s | ⏮ Prev | ▶/⏸ PlayPause | ⏭ Next | ⏩ 10s`
- **FR-P6:** Queue Preview Bar (collapsed): `Queue Next [Shuffle - Loop] | ▲ Open | "2 From 28 List" | "Next Title Song"`. Tap `Open` -> expand.
- **FR-P7:** Queue Expanded: Overlay bottom sheet. Isi: Loop toggle + Shuffle toggle (kiri), `Minimize ▼` (kanan), list draggable `≡ + Title/Artist + 03:50`. Swipe item untuk remove. Saat queue open, controls + seekbar overlay di atas video dengan scrim gradient.
- **FR-P8:** State: Shuffle & Loop persist per queue.
- **FR-P9:** Background playback: saat Minimize, mini-player tetap jalan + notification (Phase 2).
- **FR-P10:** Saat player open, bottom nav hanya `☰` + `🔍`, mini player hidden (sudah di player).

### 4.3 Search (`searchbar.jpg`)
- **FR-S1:** Fullscreen overlay. Trigger dari `🔍` di bottom bar.
- **FR-S2:** Input field `#2D2D2D` dengan placeholder + `🔍` submit. Typing debounce 300ms -> fetch live recommendations.
- **FR-S3:** Section `Live Recommendations` (max 5) + `History` (max 10, persist local). Tap item -> execute search -> result list (reuse Dashboard card layout).
- **FR-S4:** `X` top-left untuk close overlay. Saat search overlay aktif, bottom nav kanan ganti jadi `X` close (bukan `🔍`).
- **FR-S5:** Clear history & delete per item.

### 4.4 Sidebar (`sidebar.jpg`)
- **FR-B1:** Drawer kiri slide (60% width, backdrop dim 50%). Trigger `☰` kiri bottom. Close via `X`, swipe, atau tap backdrop.
- **FR-B2:** Header: Logo circular + `Dz Player` + `0.1.231-beta`. Jika login: tampil avatar/name Google di bawahnya. Jika guest: button `Login with Google`.
- **FR-B3:** Menu groups:
  - `Online Stream > Discover` (YouTube, butuh cookies)
  - `Local > Music, Videos`
  - `Divider`
  - `Rewind, Download Manager, Setting`
- **FR-B4:** Active menu highlight.
- **FR-B5:** Jika belum login, tap Discover/My Library -> prompt Login Google.

### 4.5 Mini Player (Persistent Bottom)
- **FR-M1:** Selalu visible jika ada media loaded (kecuali saat player fullscreen). Layout: `THUMBN | Title... (marquee) / Artist | ▶ | ⏭` rounded `#3A3A3A`. Tap area -> expand ke Player. Tap `▶/⏸` -> toggle. Tap `⏭` -> next.
- **FR-M2:** Saat tidak ada queue, hidden.

### 4.6 Local, Download, Rewind, My Library
- **FR-L1:** Local Music/Videos: permission READ_MEDIA, scan via MediaStore, group by folder/artist. Play via local engine.
- **FR-L2:** Download Manager: list download (progress, pause/resume/cancel), support video & audio, storage path configurable, notifikasi progress, retry on fail.
- **FR-L3:** **Rewind:** Daftar putar history user yang tercache. Filter: Today, This Week, All. Badge `Offline` jika `isOfflineAvailable`. Clear per item & clear all.
- **FR-L4:** **My Library:** Read-only. Profile user dari YouTube via Google login (avatar, name, email, playlist YouTube user). Tap playlist -> list card. Jika belum login -> empty state + CTA Login.
- **FR-L5:** Setting: Theme (ikut system/dark/light toggle), Storage location, Clear cache/history/cookies, About version, Logout Google.

### 4.7 Auth - Login Google & Cookie Manager
- **FR-A1:** Login via Google OAuth PKCE -> dapat `id_token` + `access_token` -> POST ke `/api/auth/google` -> server validate + init youtubei.js -> generate YouTube cookies -> encrypt -> simpan `auth.db` -> return `sessionId`.
- **FR-A2:** Frontend simpan `sessionId` di Capacitor SecureStorage. Cookies tidak pernah expose ke frontend. Semua request YouTube pakai `Authorization: Bearer <sessionId>`.
- **FR-A3:** Auto-refresh: jika YouTube return 429/bot challenge -> cek `refreshToken` -> valid: re-init youtubei.js + update cookies -> invalid: return `401 BOT_DETECTED` -> frontend prompt re-login.
- **FR-A4:** Guest mode tetap ada tapi tampil warning "Tanpa login rawan bot detection". Guest: direct request + exponential backoff retry.
- **FR-A5:** Logout menghapus cookies + clear YouTube cache.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Cold start < 2s, list scroll 60fps, seek latency < 200ms |
| Offline | Rewind/Downloads/Local playback work tanpa internet |
| Storage | Cache image LRU max 500MB, thumbnail persist, clearable |
| Battery | Background playback optimized, wakelock hanya saat play |
| Accessibility | Contrast WCAG AA, tap target min 48dp |
| Security | No cleartext HTTP, scoped storage, cookies encrypted at rest (Keystore), OAuth PKCE, no hardcode API key |
| Theme | Dinamis ikut system (`prefers-color-scheme`), support dark + light |

---

## 6. User Flows

**Flow 0: First Login**
`Open App -> Prompt Login Google -> OAuth PKCE -> id_token + access_token -> POST /api/auth/google -> cookies generated -> sessionId -> Dashboard load`

**Flow A: Play dari Dashboard**
`Open App (logged in) -> Dashboard -> Tap Card -> resolve streamUrl via /api/youtube/stream/:id -> Player (auto play) -> Open Queue -> Shuffle -> Next -> Minimize -> Mini Player`

**Flow B: Search**
`Tap 🔍 -> Type "Alan wal" -> Live Recommendations -> Tap "Alan walker" -> Result List -> Tap Card -> Player`

**Flow C: Local**
`☰ -> Local -> Music -> Pilih file -> Player (queue = folder list)`

**Flow D: Rewind Offline**
`☰ -> Rewind -> List history cache -> Tap item (isOfflineAvailable) -> Play offline`

**Flow E: Download**
`Tap ▼ di Card -> Download -> Pilih quality -> Download Manager progress -> Selesai -> Play dari Download Manager`

**Flow F: My Library**
`Tap My Library tab -> (jika belum login -> CTA Login) -> Tampil profile + playlist YouTube (read-only) -> Tap Playlist -> List -> Play`

---

## 7. Acceptance Criteria (Full Build)

- [ ] Login Google OAuth PKCE berhasil, sessionId disimpan SecureStorage, cookies tidak expose ke frontend
- [ ] Guest mode warning bot muncul jika belum login, direct + backoff retry
- [ ] 4 tab Dashboard switch tanpa reload penuh
- [ ] Player bisa play, pause, seek, next/prev, shuffle, loop
- [ ] Queue reorder via drag & persist
- [ ] streamUrl re-resolve otomatis jika `streamUrlExpiresAt` expired
- [ ] Search live recommendations muncul < 500ms
- [ ] Sidebar & Search overlay animasi 250ms ease
- [ ] Mini player hidden saat player fullscreen, visible saat minimize
- [ ] Local Music/Videos scan & play
- [ ] Download Manager video/audio pause/resume/cancel
- [ ] Rewind list badge Offline jika isOfflineAvailable
- [ ] My Library read-only: tampil profile + playlist setelah login
- [ ] Re-login otomatis saat cookies expired / bot challenge
- [ ] Theme ikut system (dark/light)
- [ ] Build debug APK via GitHub Actions CI berhasil

---

## 8. Out of Scope (Phase 1)

- Upload ke YouTube
- Ads
- Multi-language (hanya EN Phase 1)
- Multi-account Google (Phase 3)
- Komentar/like YouTube actions
- My Library write/create/rename playlist (Phase 3)
- Guest proxy (Phase 3)
- Background playback (Phase 2)

---

## 9. Metrics (Post-MVP)

- Daily Active Play, Avg Session Duration, Queue usage %, Search CTR, Download success rate

---

## 10. Open Questions

> Semua open questions resolved per 2026-08-21.

1. ✅ YouTube data layer: **Hybrid youtubei.js + yt-dlp** (ADR-007)
2. ✅ OAuth flow: **OAuth PKCE → id_token → server exchange cookies via youtubei.js** (ADR-008)
3. ✅ My Library sync: **Read-only Phase 1**, write Phase 3
4. ✅ Cookie refresh: **OAuth2 + YouTube InnerTube via youtubei.js**, refreshToken flow
5. ✅ Guest fallback: **Direct + exponential backoff**, proxy Phase 3
