import { Router, Request, Response } from 'express';
import { startDownload, getDownloadStatus } from '../services/downloadService.js';

const router = Router();

type Quality = '360p' | '720p' | '1080p' | 'audio';

function toQuality(q: unknown): Quality {
  return q === 'audio' || q === '360p' || q === '1080p' ? (q as Quality) : '720p';
}

router.post('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = (req.body || {}) as { quality?: string; downloadPath?: string };
  const downloadPath = body.downloadPath || 'server/data/downloads';
  try {
    const filePath = await startDownload(id, toQuality(body.quality), downloadPath);
    res.json({ data: { id, filePath, status: 'completed' } });
  } catch (e) {
    res.status(500).json({ error: { code: 'DOWNLOAD_ERROR', message: (e as Error).message } });
  }
});

router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const status = await getDownloadStatus(req.params.id);
    res.json({ data: { id: req.params.id, status } });
  } catch (e) {
    res.status(500).json({ error: { code: 'DOWNLOAD_ERROR', message: (e as Error).message } });
  }
});

export default router;
