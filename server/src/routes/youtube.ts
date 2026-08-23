import { Request, Response } from 'express';
import { extractVideos, toMediaDto, createClient } from '../services/youtubeService.js';

export async function trendingRoute(req: Request, res: Response) {
  const tab = req.query.tab as string || 'dashboard';
  let yt;
  try {
    yt = await createClient(); // guest (no cookie)
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
    yt = await createClient();
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
    yt = await createClient();
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
  const body = req.body as { quality?: string };
  const quality = body?.quality || 'auto';

  // youtubei.js doesn't directly resolve stream URL; use yt-dlp via our wrapper
  // For now, return error placeholder; real impl needs yt-dlp subprocess from vid
  return res.status(501).json({ error: { code: 'NOT_IMPLEMENTED', message: 'Stream resolution requires yt-dlp; use /api/youtube/stream via POST with media id' } });
}