import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { AppError } from '../middlewares/errorHandler.js';
import { ok } from '../utils/apiResponse.js';
import { normalizarCorreo } from '../utils/normalizers.js';

export async function login(req, res) {
  const correo = normalizarCorreo(req.body.correo);
  const { rows } = await query('SELECT id, correo, password_hash, nombre, rol FROM usuarios WHERE correo = $1', [correo]);
  const usuario = rows[0];
  if (!usuario) throw new AppError('Credenciales invalidas', 401);

  const valido = await bcrypt.compare(req.body.password, usuario.password_hash);
  if (!valido) throw new AppError('Credenciales invalidas', 401);

  const token = jwt.sign({ sub: usuario.id, rol: usuario.rol }, env.JWT_SECRET, { expiresIn: '8h' });
  ok(res, {
    token,
    usuario: { id: usuario.id, correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol }
  });
}

export function me(req, res) {
  ok(res, { usuario: req.user });
}
