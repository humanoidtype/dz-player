import { Router, Request, Response } from 'express';
import { googleAuthRoute, meRoute, logoutRoute } from './auth.js';
import { trendingRoute, searchRoute, suggestRoute } from './youtube.js';
import { streamRoute } from './youtube.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public auth routes
router.post('/auth/google', googleAuthRoute);
router.get('/me', meRoute);
router.delete('/auth/logout', logoutRoute);

// YouTube API routes (all require bearer sessionId)
router.use(authMiddleware);
router.get('/youtube/trending', trendingRoute);
router.get('/youtube/search', searchRoute);
router.get('/youtube/suggest', suggestRoute);
router.post('/youtube/stream/:id', streamRoute);

// Download routes (auth required)
router.get('/download/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  // Stream file via yt-dlp or redirect to Capacitor Filesystem download URL
  res.set('Content-Disposition', `attachment; filename="video_${id}.mp4"`);
  res.send('Download endpoint - proxy yt-dlp stream');
});

export default router;