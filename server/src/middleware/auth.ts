import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Every /api/* requires Authorization: Bearer <sessionId>
  // Exempt: /api/auth/* routes
  if (req.path.startsWith('/api/auth')) return next();

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing Authorization header' } });
  }
  req.sessionId = auth.slice(7);
  next();
}