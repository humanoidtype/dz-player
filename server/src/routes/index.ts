import { Router } from 'express';
import { googleAuthRoute, meRoute, logoutRoute } from './auth.js';
import { trendingRoute, searchRoute, suggestRoute } from './youtube.js';
import { streamRoute } from './youtube.js';
import { authMiddleware } from '../middleware/auth.js';
import downloadRouter from './download.js';

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
router.use('/download', downloadRouter);

export default router;