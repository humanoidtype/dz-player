# Dz Player - Development Rules & Conventions

**Version:** 0.3.0 (Updated: 2026-08-21)
**Stack:** React + Vite + Tailwind v4 + Express + Capacitor JS + GitHub CI + VPS Deploy
**Purpose:** Supaya project maintainable & scalable meski dikerjakan via Termux + AI agent.

---

## 1. General Principles

1. **Mockup is Truth:** Jika ragu, cek `mockup/*.jpg` & `design.md`. Jangan improvisasi warna/layout.
2. **Mobile First:** Semua UI portrait 360dp dulu, baru responsive.
3. **Minimalis & Fast:** Tidak ada elemen UI yang tidak perlu. Animasi max 300ms.
4. **Clean Commits:** 1 fitur = 1 commit, pesan conventional.
5. **No Hardcode:** Warna/spacing pakai token dari `design.md` via Tailwind v4 `@theme`.

---

## 2. Git & Branching

- **Branch:** `main` (stable), `dev` (integration), `feat/<name>`, `fix/<name>`
- **Commit Format (Conventional):**
  ```
  feat(player): add queue shuffle logic
  fix(dashboard): truncate title 2 lines
  docs(schema): update streamUrlExpiresAt field
  chore: setup capacitor
  ```
- **Jangan** commit `node_modules`, `android/build`, `*.apk`, `.env`
- **PR:** 1 PR = 1 fitur, screenshot (before/after) untuk UI change

---

## 3. Code Style

### 3.1 TypeScript (React + Express)
- `eslint + prettier` untuk `client/src/` dan `server/src/`. Run `npm run lint` sebelum commit.
- Strict `no-explicit-any`. Gunakan types dari `client/src/entities/media/types.ts`.
- Naming: `PascalCase` Component, `camelCase` function/var, `UPPER_SNAKE` constant, `kebab-case` file.
- Max file `300` lines, extract jika lebih.
- Comment hanya untuk *why*, bukan *what*. No commented-out code.

### 3.2 Naming Files
```
DashboardPage.tsx       // Page
MediaCard.tsx           // Component
useQueue.ts             // Hook
playerStore.ts          // Store
mediaRepository.ts      // Repository
ytdlpService.ts         // Service
```

### 3.3 Imports
Order: `react` → `third-party` → `shared` → `features` → `relative`.
Alias: `@/` → `client/src/`.

---

## 4. Architecture Rules

- **Monorepo:** `client/` (React) dan `server/` (Express), root workspaces `["client","server"]`.
- **Feature-Sliced (Frontend):** Jangan import cross-feature langsung. `dashboard` tidak boleh import `player` internals. Pakai `shared/` atau `entities/`.
- **Repository Only (Frontend):** UI tidak boleh `fetch()` langsung. Via `youtubeClient` + TanStack Query ke `/api/*`.
- **Server Isolation:** Frontend tidak akses YouTube langsung, semua via Express proxy. Cookies tidak pernah expose ke frontend — client hanya pegang `sessionId`.
- **Player Engine:** Semua kontrol player via `playerStore` → `engine`, bukan DOM langsung.
- **streamUrl:** Selalu resolve via `resolveStreamUrl()` di engine — cek `streamUrlExpiresAt` dulu, jangan langsung pakai cached value.
- **State:** Global hanya `playerStore`, `authStore`, `searchStore`, `sidebarStore`. Lainnya local / server cache.

---

## 5. UI Rules

- Warna pakai token Tailwind v4: `bg-bg`, `text-text-primary`, `bg-accent`. Jangan hardcode hex.
- Spacing 8dp grid: `p-4` (16), `gap-2` (8).
- Semua icon `24x24`, button touch target `48x48`.
- Truncate: `line-clamp-2`.
- Mockup pixel-perfect: compare screenshot vs mockup sebelum PR approve.
- Theme: **jangan hardcode dark/light**. Semua via CSS token `@theme` + `@media (prefers-color-scheme)`.

---

## 6. Data & Schema Rules

- Semua model ikut `schema.md`. Jangan tambah field tanpa update schema + migrasi doc.
- DB version bump tiap schema change, tulis migration.
- Time simpan epoch ms (`number`), bukan string ISO.
- `id` online = `vid_<youtubeId>`, local = `local_<mediaStoreId>`.
- `streamUrlExpiresAt` wajib di-set saat simpan `streamUrl` ke Dexie. TTL ~5h (18000000 ms).
- Cookies hanya ada di `server/data/auth.db`, encrypted AES-GCM. Tidak boleh ada di frontend.

---

## 7. Testing

- **Unit Frontend:** `playerStore` shuffle/loop, `formatTime`, `youtubeClient` mapper, `resolveStreamUrl` TTL logic.
- **Unit Backend:** `cookieManager` encrypt/decrypt, `youtubeService` mapper, `ytdlpService` cache hit/miss.
- **Component:** Smoke test `render DashboardPage` + `tap card → navigate`.
- **E2E (later):** Play flow + auth flow.
- Target `>70%` core logic. Run `npm test --workspaces` sebelum push.

---

## 8. Performance Rules

- Virtualize list >20 items (`react-virtuoso`).
- Image: lazy + cache, placeholder blur, size max `300x300`.
- Debounce search `300ms`, cancel previous request (AbortController).
- No `setInterval` untuk progress — pakai `requestAnimationFrame` atau `playerEngine.onProgress`.
- yt-dlp: jangan spawn tanpa cek `yt_cache` dulu. Cache hit = no subprocess.

---

## 9. Security & Privacy

- Jangan log `streamUrl`, `cookies`, `idToken`, `refreshToken`.
- Cookies YouTube encrypted AES-GCM di server (`YOUTUBE_COOKIES_ENCRYPT_KEY` env). Jangan commit `.env`.
- Client hanya simpan `sessionId` (UUID) di Capacitor SecureStorage.
- Download hanya ke app sandbox atau `Downloads/DzPlayer`.
- Permission minta runtime, jelaskan why.
- Express: `helmet`, `cors` whitelist (`capacitor://localhost`, `https://dzplayer.dzfee.id`), rate-limit `/api/auth/*`.

---

## 10. Documentation Rules

- Tiap fitur baru update `PRD.md` checklist & `schema.md` jika ada model baru.
- `architecture.md` ADR tiap decision besar (format: ADR-NNN).
- `design.md` jika ada token baru atau komponen baru.
- `rules.md` jika ada konvensi baru.

---

## 11. AI Agent Rules

Saat AI mengerjakan task di repo ini:
1. Baca `PRD.md`, `architecture.md`, `schema.md`, `design.md`, `rules.md` dulu sebelum coding.
2. Kerja di `feat/*` branch, jangan langsung `main`.
3. Verifikasi: `npm run lint && npm run typecheck && npm run build` (frontend + server). UI butuh screenshot compare mockup.
4. Jangan buat file `.md` baru tanpa request, update yang ada.
5. Tanya user jika butuh `GOOGLE_CLIENT_ID`, `YOUTUBE_COOKIES_ENCRYPT_KEY`, atau VPS access.
6. Untuk stream URL: selalu gunakan `resolveStreamUrl()`, jangan langsung pakai `media.streamUrl`.
7. Jangan expose cookies atau sessionId detail ke frontend response.

---

## 12. Dev Environment (Termux + CI)

**Termux (code + test):**
- Tools: Node.js 20+, npm, Git
- Dev: `npm run dev` (Vite client) + `npm run dev:server` (Express nodemon)
- Test: `npm test --workspaces`
- Build web test: `npm run build` (Vite)
- Push ke GitHub → CI handle sisanya

**GitHub Actions (CI/CD):**
- `check`: lint + typecheck + test + build (semua branch + PR)
- `build-apk`: Capacitor sync + Gradle assembleDebug (main only, butuh JDK17 + android-sdk di runner)
- `release`: upload APK artifact + tag `v0.1.<run>-beta`

**VPS (deploy):**
```bash
git pull origin main
npm ci
npm run build        # vite build (client/dist) + server build (server/dist)
pm2 restart dz-player
nginx -s reload
```

**Tidak ada build APK di Termux.** APK build sepenuhnya di GitHub Actions runner.

---

## 13. Definition of Done (DoD)

Fitur dianggap done jika:
- [ ] Sesuai mockup (pixel compare) + PRD checklist
- [ ] `npm run lint && npm run typecheck` pass (client & server)
- [ ] Test core logic pass (`npm test --workspaces`)
- [ ] Docs update (`PRD/schema/design/architecture` jika ada perubahan)
- [ ] `npm run build` success + CI `check` hijau
- [ ] Build APK debug success jika ubah frontend (CI `build-apk`)
- [ ] Screenshot terlampir di PR

### CI Gate (wajib hijau sebelum merge ke `main`)
- `check` (lint, typecheck, test, build)
- `build-apk` (main only)
- `release` auto tag

---

## 14. Escalation

Jika mockup ambigu atau ada decision baru yang belum di-ADR, buat entry di `Open Questions` di `PRD.md` dan tanya owner sebelum implement. Setiap decision besar wajib jadi ADR di `architecture.md`.
