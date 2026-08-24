import express, { ErrorRequestHandler } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import dashboardRouter from './routes/index.js';

dotenv.config();

const app = express();

// Behind nginx: percaya 1 hop proxy agar express-rate-limit baca IP asli
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());

// Rate limit auth routes only
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many auth attempts, backoff.' });
app.use('/api/auth', authLimiter);

// General API routes (auth middleware inside router)
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
