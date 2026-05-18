import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { httpLogger } from './middlewares/logger.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { calculadoraRoutes } from './routes/calculadoraRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { leadsRoutes } from './routes/leadsRoutes.js';
import { healthRoutes } from './routes/healthRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN }));
  app.use(express.json({ limit: '100kb' }));
  app.use(httpLogger);
  app.use(express.static(publicDir));

  app.use('/api', healthRoutes);
  app.use('/api', calculadoraRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api', leadsRoutes);

  app.get('/panel', (req, res) => res.sendFile(path.join(publicDir, 'panel.html')));
  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}
