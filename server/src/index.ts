import express, { Request, Response, ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { authDb } from './db/index.js';
import dashboardRouter from './routes/index.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));

// Rate limit auth routes only
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many auth attempts, backoff.' });
app.post('/api/auth/google', authLimiter, express.json(), (req: Request, res: Response) => { /* routes handle it */ });
app.get('/api/me', express.json(), (req: Request, res: Response) => { /* routes handle it */ });
app.delete('/api/auth/logout', express.json(), (req: Request, res: Response) => { /* routes handle it */ });

// General API routes (also require auth middleware inside each)
app.use('/api', dashboardRouter);

// Global error handler
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Server error:', err);
  const code = err.message?.startsWith('CONFIG') ? 'CONFIG_MISSING' : 'INTERNAL_ERROR';
  res.status(500).json({ error: { code, message: err.message || 'Internal server error' } });
};
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Dz Player server listening on port ${PORT}`);
  console.log(`CORS origins: ${config.corsOrigins.join(', ')}`);
});

export default app;