import { query } from '../db/pool.js';
import { ok } from '../utils/apiResponse.js';

export async function health(req, res) {
  await query('SELECT 1');
  ok(res, { status: 'ok', database: 'ok', timestamp: new Date().toISOString() });
}
