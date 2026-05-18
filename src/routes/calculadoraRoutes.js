import { Router } from 'express';
import { calcular } from '../controllers/calculadoraController.js';
import { calcularSchema } from '../controllers/schemas.js';
import { calcularLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';

export const calculadoraRoutes = Router();

calculadoraRoutes.post('/calcular', calcularLimiter, validate({ body: calcularSchema }), calcular);
