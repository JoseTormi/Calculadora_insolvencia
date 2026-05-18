import bcrypt from 'bcrypt';
import { pool } from './pool.js';
import { logger } from '../middlewares/logger.js';

const correo = process.env.SEED_ADMIN_EMAIL || 'admin@avanzar.local';
const password = process.env.SEED_ADMIN_PASSWORD || 'Admin12345!';
const nombre = process.env.SEED_ADMIN_NAME || 'Administrador';

async function seed() {
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO usuarios (correo, password_hash, nombre, rol)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, nombre = EXCLUDED.nombre`,
    [correo.toLowerCase(), passwordHash, nombre]
  );
  logger.info({ correo }, 'Usuario admin creado o actualizado');
  await pool.end();
}

seed().catch(async (error) => {
  logger.error({ err: error }, 'Error ejecutando seed');
  await pool.end();
  process.exit(1);
});
