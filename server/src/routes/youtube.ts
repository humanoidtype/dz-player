import { Request, Response } from 'express';
import { extractVideos, toMediaDto } from '../services/youtubeService.js';
import { createClientForRequest } from '../services/sessionClient.js';
import { authDb } from '../db/index.js';
import { encryptCookies, parseCookiesInput } from '../services/cookieManager.js';
import { resolveStreamUrl } from '../services/ytdlpService.js';

export async function trendingRoute(req: Request, res: Response) {
  const tab = req.query.tab as string || 'dashboard';
  let yt;
  try {
    yt = await createClientForRequest(req);
  } catch (e) {
    return res.status(503).json({ error: { code: 'BOT_DETECTED', message: 'youtubei.js init failed' } });
  }

  let raw;
  try {
    if (tab === 'dashboard' || !tab) raw = await yt.getHomeFeed();
    else raw = await yt.getTrending();
  } catch (e) {
    return res.status(503).json({ error: { code: 'BOT_DETECTED', message: 'youtubei.js request failed' } });
  }

  const videos = extractVideos(raw);
  const items = videos.map(toMediaDto).slice(0, 20);
  const nextPage = (items.length === 20) ? 2 : undefined;
  res.json({ data: items, nextPage, hasMore: videos.length > 20 });
}

export async function searchRoute(req: Request, res: Response) {
  const q = (req.query.q || '') as string;
  if (!q) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'q required' } });

  let yt;
  try {
    yt = await createClientForRequest(req);
  } catch (e) {
    return res.status(503).json({ error: { code: 'BOT_DETECTED', message: 'youtubei.js init failed' } });
  }

  let raw;
  try {
    raw = await yt.search(q);
  } catch (e) {
    return res.status(503).json({ error: { code: 'BOT_DETECTED', message: 'youtubei.js request failed' } });
  }

  const videos = extractVideos(raw);
  const items = videos.map(toMediaDto).slice(0, 20);
  res.json({ data: items });
}

export async function suggestRoute(req: Request, res: Response) {
  const q = (req.query.q || '') as string;
  if (!q) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'q required' } });

  let yt;
  try {
    yt = await createClientForRequest(req);
  } catch (e) {
    return res.status(503).json({ error: { code: 'BOT_DETECTED', message: 'youtubei.js init failed' } });
  }

  try {
    const raw = await yt.getSearchSuggestions(q);
    const suggestions = Array.isArray(raw)
      ? raw
      : (raw as unknown as { suggestions?: string[] }).suggestions || [];
    res.json({ suggestions });
  } catch (e) {
    res.status(503).json({ error: { code: 'BOT_DETECTED', message: 'youtubei.js request failed' } });
  }
}

export async function streamRoute(req: Request, res: Response) {
  const { id } = req.params;
  const body = (req.body || {}) as { quality?: string };
  const quality = (body.quality === 'audio' || body.quality === '360p' || body.quality === '1080p'
    ? body.quality
    : '720p') as '360p' | '720p' | '1080p' | 'audio';

  try {
    const result = await resolveStreamUrl(id.replace(/^vid_/, ''), quality);
    return res.json({ data: { id, ...result } });
  } catch (e) {
    return res.status(503).json({ error: { code: 'STREAM_ERROR', message: (e as Error).message } });
  }
}
export async function saveCookiesRoute(req: Request, res: Response) {
  const raw = typeof req.body?.raw === 'string' ? req.body.raw : '';
  const parsed = parseCookiesInput(raw);
  if (!parsed) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Cookie kosong atau format tidak dikenali' } });
  }
  const hasSessionCookie = 'SID' in parsed || 'SAPISID' in parsed || '__Secure-1PSID' in parsed || '__Secure-3PSID' in parsed;
  if (!hasSessionCookie) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Butuh minimal SID/SAPISID dari youtube.com' } });
  }

  authDb.prepare('UPDATE session SET cookies_encrypted = ? WHERE id = ?').run(
    encryptCookies(parsed),
    req.sessionId ?? ''
  );
  res.json({ ok: true, count: Object.keys(parsed).length });
}
