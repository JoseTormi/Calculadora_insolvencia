import { stringify } from 'csv-stringify/sync';
import { query } from '../db/pool.js';
import { calcularDiagnostico } from '../services/calculadora.js';
import { crearLeadBitrix } from '../services/bitrix24.js';
import { enviarBienvenidaWhatsApp } from '../services/wasapi.js';
import { logger } from '../middlewares/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import { ok } from '../utils/apiResponse.js';
import { normalizarCorreo, normalizarTelefono } from '../utils/normalizers.js';

export async function crearLead(req, res) {
  const diagnostico = calcularDiagnostico(req.body.calculo);
  const leadInput = {
    nombre: req.body.nombre.trim(),
    telefono: normalizarTelefono(req.body.telefono),
    correo: normalizarCorreo(req.body.correo),
    ciudad: req.body.ciudad.trim(),
    ...req.body.calculo,
    resultado: diagnostico.resultado,
    servicio_recomendado: diagnostico.servicio_recomendado,
    rango_deuda: diagnostico.rango_deuda
  };

  const { rows } = await query(
    `INSERT INTO leads (
      nombre, telefono, correo, ciudad, ingresos_mensuales, gastos_mensuales, deuda_total,
      numero_acreedores, tiene_mora, resultado, servicio_recomendado, rango_deuda
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [
      leadInput.nombre,
      leadInput.telefono,
      leadInput.correo,
      leadInput.ciudad,
      leadInput.ingresos_mensuales,
      leadInput.gastos_mensuales,
      leadInput.deuda_total,
      leadInput.numero_acreedores,
      leadInput.tiene_mora,
      leadInput.resultado,
      leadInput.servicio_recomendado,
      leadInput.rango_deuda
    ]
  );

  const lead = rows[0];
  procesarIntegracionesLead(lead);
  ok(res, { id: lead.id, resultado: lead.resultado, servicio_recomendado: lead.servicio_recomendado }, 201);
}

function procesarIntegracionesLead(lead) {
  setImmediate(async () => {
    try {
      const bitrixId = await crearLeadBitrix(lead);
      if (bitrixId) await query('UPDATE leads SET bitrix_lead_id = $1 WHERE id = $2', [bitrixId, lead.id]);
    } catch (error) {
      logger.warn({ err: error, lead_id: lead.id }, 'No se pudo sincronizar Bitrix24');
    }

    try {
      const enviado = await enviarBienvenidaWhatsApp(lead);
      if (enviado) await query('UPDATE leads SET whatsapp_enviado = true WHERE id = $1', [lead.id]);
    } catch (error) {
      logger.warn({ err: error, lead_id: lead.id }, 'No se pudo enviar WhatsApp');
    }
  });
}

function construirFiltros(filters) {
  const where = [];
  const params = [];
  const add = (clause, value) => {
    params.push(value);
    where.push(clause.replace('?', `$${params.length}`));
  };

  if (filters.fecha_desde) add('created_at >= ?', `${filters.fecha_desde}T00:00:00.000Z`);
  if (filters.fecha_hasta) add('created_at <= ?', `${filters.fecha_hasta}T23:59:59.999Z`);
  if (filters.ciudad) add('ciudad ILIKE ?', `%${filters.ciudad}%`);
  if (filters.estado) add('estado = ?', filters.estado);
  if (filters.servicio_recomendado) add('servicio_recomendado = ?', filters.servicio_recomendado);

  return {
    whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
    params
  };
}

export async function listarLeads(req, res) {
  const { page, limit, ...filters } = req.query;
  const { whereSql, params } = construirFiltros(filters);
  const offset = (page - 1) * limit;

  const totalResult = await query(`SELECT count(*)::int AS total FROM leads ${whereSql}`, params);
  const { rows } = await query(
    `SELECT id, nombre, telefono, correo, ciudad, deuda_total, resultado, servicio_recomendado,
            rango_deuda, estado, whatsapp_enviado, bitrix_lead_id, created_at
     FROM leads ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  ok(res, { items: rows, page, limit, total: totalResult.rows[0].total });
}

export async function obtenerLead(req, res) {
  const { rows } = await query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
  if (!rows[0]) throw new AppError('Lead no encontrado', 404);
  ok(res, rows[0]);
}

export async function actualizarLead(req, res) {
  const { rows } = await query(
    `UPDATE leads SET estado = $1, comentario = COALESCE($2, comentario)
     WHERE id = $3 RETURNING *`,
    [req.body.estado, req.body.comentario || null, req.params.id]
  );
  if (!rows[0]) throw new AppError('Lead no encontrado', 404);
  ok(res, rows[0]);
}

export async function exportarLeads(req, res) {
  const { page, limit, ...filters } = req.query;
  const { whereSql, params } = construirFiltros(filters);
  const { rows } = await query(
    `SELECT id, nombre, telefono, correo, ciudad, ingresos_mensuales, gastos_mensuales,
            deuda_total, numero_acreedores, tiene_mora, resultado, servicio_recomendado,
            rango_deuda, estado, whatsapp_enviado, bitrix_lead_id, created_at
     FROM leads ${whereSql}
     ORDER BY created_at DESC`,
    params
  );
  const csv = stringify(rows, { header: true });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
  res.status(200).send(csv);
}
