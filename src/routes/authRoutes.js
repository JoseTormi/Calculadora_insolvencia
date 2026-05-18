import { Router } from 'express';
import { login, me } from '../controllers/authController.js';
import { loginSchema } from '../controllers/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';

export const authRoutes = Router();

authRoutes.post('/login', loginLimiter, validate({ body: loginSchema }), asyncHandler(login));
authRoutes.get('/me', asyncHandler(requireAuth), me);
