import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { AppError } from './errorHandler.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) throw new AppError('Token requerido', 401);

    const payload = jwt.verify(token, env.JWT_SECRET);
    const { rows } = await query('SELECT id, correo, nombre, rol FROM usuarios WHERE id = $1', [payload.sub]);
    if (!rows[0]) throw new AppError('Usuario no encontrado', 401);

    req.user = rows[0];
    next();
  } catch (error) {
    next(error.status ? error : new AppError('Token invalido', 401));
  }
}
