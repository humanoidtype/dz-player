// server/src/services/sessionClient.ts
// Membuat instance youtubei.js dengan cookie sesi user (atau fallback global)
import type { Request } from 'express';
import type { Innertube } from 'youtubei.js';
import { authDb } from '../db/index.js';
import { decryptCookies } from './cookieManager.js';
import { createClient } from './youtubeService.js';

export function cookiesForSession(sessionId?: string): string | undefined {
  let cookies: Record<string, string> | undefined;

  if (sessionId) {
    const row = authDb.prepare('SELECT cookies_encrypted FROM session WHERE id = ?').get(sessionId) as
      | { cookies_encrypted?: string }
      | undefined;
    if (row?.cookies_encrypted) {
      try {
        const decrypted = decryptCookies(row.cookies_encrypted);
        if (Object.keys(decrypted).length > 0) cookies = decrypted;
      } catch {
        // cookie korup/kunci berubah -> anggap tidak ada, lanjut fallback
      }
    }
  }

  if (!cookies && process.env.YOUTUBE_COOKIES) {
    const parts = process.env.YOUTUBE_COOKIES.split(';');
    const parsed: Record<string, string> = {};
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const idx = trimmed.indexOf('=');
      if (idx <= 0) continue;
      parsed[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
    }
    if (Object.keys(parsed).length > 0) cookies = parsed;
  }

  if (!cookies) return undefined;
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

export function createClientForRequest(req: Request): Promise<Innertube> {
  return createClient(cookiesForSession(req.sessionId));
}
