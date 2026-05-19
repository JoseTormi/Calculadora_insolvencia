import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';
import { logger } from '../middlewares/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = (await readdir(dir)).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = await readFile(path.join(dir, file), 'utf8');
    await pool.query(sql);
    logger.info({ migration: file }, 'Migración aplicada');
  }

  await pool.end();
}

migrate().catch(async (error) => {
  logger.error({ err: error }, 'Error ejecutando migraciones');
  await pool.end();
  process.exit(1);
});
