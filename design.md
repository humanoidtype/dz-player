# Dz Player - Design System & UI Spec

**Version:** 0.3.0 (Updated: 2026-08-21)
**Source of Truth:** `mockup/*.jpg` (5 screens) + PRD v0.2.0
**Theme:** Dynamic — ikut system (`prefers-color-scheme`), dark + light
**Platform:** Mobile portrait 360x800 baseline, React + Tailwind v4

---

## 1. Design Principles

1. **Minimalis:** Hanya elemen yang perlu. Tidak ada dekorasi berlebihan.
2. **Fast:** Animasi simple, response terasa instan, tidak ada heavy motion.
3. **Dark & Focused:** Dark palette default, thumbnail & video pop.
4. **One-Hand:** Semua kontrol penting di bawah 60% layar.
5. **Minimal Text:** Title 2 baris max, truncate, metadata kecil.
6. **Persistent Playback:** Mini-player selalu reachable.

---

## 2. Color Palette

### Dark (default, `prefers-color-scheme: dark`)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#000000` | Background utama |
| `--color-surface` | `#121212` | Drawer, Player bg |
| `--color-card` | `#3A3A3A` | Card Dashboard |
| `--color-card-pressed` | `#2D2D2D` | Pressed state |
| `--color-input` | `#2D2D2D` | Search field |
| `--color-mini-player` | `#3A3A3A` | Mini player pill |
| `--color-text-primary` | `#FFFFFF` | Title, header |
| `--color-text-secondary` | `#B0B0B0` | Artist, metadata |
| `--color-text-tertiary` | `#888888` | Views, duration |
| `--color-accent` | `#9B00FF` | Active tab, progress bar |
| `--color-accent-pressed` | `#7B00CC` | Pressed accent |
| `--color-border` | `#2A2A2A` | Divider |
| `--color-scrim` | `rgba(0,0,0,0.5)` | Drawer backdrop |

### Light (`prefers-color-scheme: light`)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#F5F5F5` | Background utama |
| `--color-surface` | `#FFFFFF` | Drawer, Player bg |
| `--color-card` | `#E8E8E8` | Card Dashboard |
| `--color-card-pressed` | `#D8D8D8` | Pressed state |
| `--color-input` | `#E0E0E0` | Search field |
| `--color-mini-player` | `#E0E0E0` | Mini player pill |
| `--color-text-primary` | `#0A0A0A` | Title, header |
| `--color-text-secondary` | `#555555` | Artist, metadata |
| `--color-text-tertiary` | `#777777` | Views, duration |
| `--color-accent` | `#7B00CC` | Active tab, progress (darker for contrast) |
| `--color-accent-pressed` | `#5A0099` | Pressed accent |
| `--color-border` | `#DDDDDD` | Divider |
| `--color-scrim` | `rgba(0,0,0,0.3)` | Drawer backdrop |

**Accent usage:** Hanya untuk active state & progress. Jangan overuse.
**WCAG AA:** Semua text contrast >= 4.5:1 di kedua mode.

---

## 3. Tailwind v4 Implementation

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-bg: #000000;
  --color-surface: #121212;
  --color-card: #3A3A3A;
  --color-card-pressed: #2D2D2D;
  --color-input: #2D2D2D;
  --color-mini-player: #3A3A3A;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #B0B0B0;
  --color-text-tertiary: #888888;
  --color-accent: #9B00FF;
  --color-accent-pressed: #7B00CC;
  --color-border: #2A2A2A;
}

@media (prefers-color-scheme: light) {
  @theme {
    --color-bg: #F5F5F5;
    --color-surface: #FFFFFF;
    --color-card: #E8E8E8;
    --color-card-pressed: #D8D8D8;
    --color-input: #E0E0E0;
    --color-mini-player: #E0E0E0;
    --color-text-primary: #0A0A0A;
    --color-text-secondary: #555555;
    --color-text-tertiary: #777777;
    --color-accent: #7B00CC;
    --color-accent-pressed: #5A0099;
    --color-border: #DDDDDD;
    --color-scrim: rgba(0,0,0,0.3);
  }
}
```

Usage di component: `bg-bg`, `text-text-primary`, `bg-accent`, `border-border`.
**Jangan hardcode hex di component.** Selalu pakai token.

---

## 4. Typography

Font: **Inter / Roboto** (system sans), fallback `sans-serif`.

| Style | Size | Weight | LineHeight | Usage |
|-------|------|--------|------------|-------|
| `h1` | 24sp | 700 | 28 | DASHBOARD header |
| `h2` | 18sp | 700 | 24 | Card Title, Player Title marquee |
| `body` | 14sp | 400 | 20 | Artist Name, Menu item |
| `caption` | 12sp | 400 | 16 | Views • Ago, Duration |
| `label` | 12sp | 600 | 16 | TabBar inactive, Queue label |
| `small` | 10sp | 400 | 14 | THUMBN placeholder |

Truncate: `line-clamp-2`
Marquee: Player title jika overflow, scroll 30px/s linear, pause on hover.

---

## 5. Spacing & Radius

Baseline 8dp grid.

- Spacing: `xs 4, sm 8, md 16, lg 24, xl 32`
- Card: outer margin `8` horizontal, `8` vertical gap
- Card inner: thumbnail `30% width`, content padding `12`
- Radius: Card `4`, MiniPlayer `20` (pill), Input `4`, Button `4`, Drawer `0`
- Elevation: card `0` (flat), drawer `8dp`, bottom nav `4dp`

---

## 6. Iconography

Stroke: outline 2px, rounded cap.
Color: `text-text-primary` (adapt dark/light otomatis via token).

Set (Lucide):
- `menu`, `search`, `x`, `chevronDown`, `chevronUp`, `moreVertical`
- `play`, `pause`, `skipBack`, `skipForward`, `rewind`, `fastForward`
- `shuffle`, `repeat`, `rotate`, `music`, `video`
- `download`, `settings`, `dragHandle`

Icon button min touch `48x48`.

---

## 7. Components Spec

### 7.1 TabBar (Dashboard)
- Height `48`, bg `bg-bg`
- Item: inactive `text-text-secondary`, active bg `bg-accent` + text `text-text-primary` + padding `8x12` rounded `4`

### 7.2 Card (Dashboard)
```
┌──────────────────────────────┐
│ [thumb 100x100] | Title 2L  ▼│
│                 | Artist     │
│                 | 3.3k • 2y  │
└──────────────────────────────┘
```
- Height `100`, bg `bg-card`, thumbnail `object-cover`
- Dropdown `▼` 20x20 top-right, opacity 0.6

### 7.3 Player Controls
- Container: center, gap `24`
- Button `48x48`, icon `28`
- Progress bar: height `4`, bg `bg-border`, progress `bg-accent`, thumb `12` circle on drag

### 7.4 SeekBar
- Time text `caption text-text-secondary`, bar `flex-1` margin `12`
- Draggable, tap to seek

### 7.5 Queue Sheet
- **Collapsed:** height `72`, bg `bg-surface`, label `Queue Next [Shuffle - Loop]` bold, `Open ▲` right
- **Expanded:** overlay — controls + seekbar overlay di atas video dengan scrim gradient 40% hitam. Queue list di bawah, header: Loop + Shuffle toggle kiri, `Minimize ▼` kanan. Item height `64`, drag handle, duration right.

### 7.6 Bottom Nav (Persistent)
- Height `64`, bg `bg-bg`, border top `1px bg-border`
- Layout: `☰ (48) | MiniPlayer (flex) | 🔍 (48)`
- **Saat Player fullscreen:** `☰ (48) | [kosong] | 🔍 (48)`, MiniPlayer hidden
- **Saat Search overlay:** `☰ (48) | MiniPlayer (flex) | X (48)`
- MiniPlayer: height `48`, bg `bg-mini-player`, layout `thumb 48x48 | title bold + artist | ▶ | ⏭`, radius `24`

### 7.7 Search Overlay
- Bg `bg-bg` fullscreen, `X` top-left, input `height 48` bg `bg-input`
- Section title bold, list item `14sp` padding `12` vertical

### 7.8 Sidebar Drawer
- Width `280` max `320`, bg `bg-surface`, padding `16`
- **Auth Header (logged in):** avatar `32x32` circular + name `14sp bold` + email `12sp text-text-tertiary`
- **Auth Header (guest):** button `Login with Google` pill height `36` + Google icon
- Logo `48x48` circular, title `20sp bold`, version `12sp text-text-tertiary`
- Group title `14sp bold text-text-primary`, item height `48`, icon `24` left
- Divider: height `2` bg `bg-border` margin `16`
- Slide: `250ms cubic-bezier(0.2,0,0,1)`, backdrop `bg-scrim`

### 7.9 Auth States
- **Guest Warning:** banner bg `bg-surface` border-left `3px bg-accent`, text `12sp` warning + CTA Login
- **My Library Empty:** center + `text-text-secondary` "Belum login" + CTA Login

### 7.10 Rewind & Download Extras
- **Rewind Filter chips:** `Today | This Week | All`, height `32` pill, active `bg-accent`
- **Download Quality Sheet:** bottom sheet: `360p, 720p, 1080p, Audio`, row height `48`, radio accent
- **Rewind badge:** `Offline` green dot jika `isOfflineAvailable`

---

## 8. Screen Specs

### Dashboard
- Header `DASHBOARD` center `h1`, margin top `16`
- TabBar margin `16`, Card list scroll, BottomNav fixed

### Player (Queue Collapsed)
- TopBar `56`: `Minimize ▼` left, `⋮` right
- Media 16:9 bg black, rotate icon `32` bottom-right margin `12`
- Info: padding `16`, title `h2` center marquee, artist `body text-text-secondary`
- SeekBar + Controls center below info

### Player (Queue Expanded)
- Video tetap fullwidth
- Controls + SeekBar overlay di atas video dengan scrim gradient 40% hitam
- Queue section di bawah: header (Loop + Shuffle | Minimize), list scroll

### Search
- Fullscreen overlay, bottom nav kanan jadi `X`

### Sidebar
- Overlay scrim `50%`, drawer slide `250ms easeOut`
- Guest: Login button di auth header, Discover/My Library disabled opacity `0.5`

---

## 9. Motion & Animation

- Drawer slide: `250ms cubic-bezier(0.2,0,0,1)`
- Bottom sheet: `300ms spring`
- Tab switch: fade `150ms`
- Card press: scale `0.98` + bg darken
- Marquee: linear `15s` infinite

**Prinsip fast:** Tidak ada animasi > 300ms. Tidak ada heavy motion.

---

## 10. Responsive

- Portrait mobile only. Tablet: max width `480` center.
- Landscape player: media fullscreen, controls overlay, queue side panel kanan `320`.

---

## 11. Assets Needed

- Logo `dz-player.png` 512x512
- Placeholder thumb `thumb_placeholder.png`
- Icon set: Lucide

---

## 12. Checklist Design QA

- [ ] Contrast textSecondary vs bg >= 4.5:1 (dark & light)
- [ ] All touch targets 48dp
- [ ] Accent hanya di active & progress
- [ ] Marquee tidak jitter
- [ ] Drawer & Sheet bisa di-swipe
- [ ] Guest warning banner tampil jika belum login
- [ ] My Library empty CTA Login terlihat
- [ ] Rewind offline badge konsisten
- [ ] Theme switch dark/light tidak ada flash (FOUC)
- [ ] Bottom nav state benar: fullscreen player, search overlay, normal

---

## 13. Sync dengan Stack React+Vite+Tailwind v4+Capacitor

- Token declare di `globals.css` via `@theme` + `@media (prefers-color-scheme)` — jangan di `tailwind.config`
- Semua component pakai token class (`bg-bg`, `text-text-primary`, dll), jangan hardcode hex
- Backend error `BOT_DETECTED` map ke UI toast + re-login `authStore`
- Theme ikut system otomatis via CSS media query, tidak perlu JS toggle untuk MVP
