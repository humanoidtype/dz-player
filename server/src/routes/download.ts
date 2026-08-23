import { config } from '../config.js';
import { resolveStreamUrl } from '../services/ytdlpService.js';
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quality } = req.query as { quality?: string };
  try {
    const { streamUrl, expiresAt, durationSec } = await resolveStreamUrl(id, quality as '360p' | '720p' | '1080p' | 'audio');
    res.json({ id, streamUrl, expiresAt, durationSec });
  } catch (e) {
    res.status(500).json({ error: { code: 'STREAM_ERROR', message: (e as Error).message } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quality } = req.body as { quality: '360p' | '720p' | '1080p' | 'audio' };
  try {
    const { streamUrl, expiresAt, durationSec } = await resolveStreamUrl(id, quality);
    res.json({ id, streamUrl, expiresAt, durationSec });
  } catch (e) {
    res.status(500).json({ error: { code: 'STREAM_ERROR', message: (e as Error).message } });
  }
});

export default router;