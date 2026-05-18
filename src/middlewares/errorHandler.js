import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { logger } from './logger.js';

export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export function notFound(req, res) {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: 'Datos invalidos',
      details: error.flatten()
    });
  }

  const status = error.status || 500;
  if (status >= 500) logger.error({ err: error }, 'Error inesperado');

  return res.status(status).json({
    ok: false,
    error: status >= 500 && env.NODE_ENV === 'production' ? 'Error interno' : error.message
  });
}
