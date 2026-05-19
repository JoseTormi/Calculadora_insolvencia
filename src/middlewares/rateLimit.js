import rateLimit from 'express-rate-limit';

const jsonHandler = (req, res) => {
  res.status(429).json({ ok: false, error: 'Demasiadas solicitudes. Intente de nuevo más tarde.' });
};

export const calcularLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false, handler: jsonHandler });
export const leadsLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, handler: jsonHandler });
export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: jsonHandler });
