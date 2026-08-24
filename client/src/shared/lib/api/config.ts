// client/src/shared/lib/api/config.ts
// APK selalu memakai URL produksi; override via VITE_API_BASE_URL bila perlu (mis. dev lokal)
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://dz-player.dzfee.id'
).replace(/\/+$/, '');
