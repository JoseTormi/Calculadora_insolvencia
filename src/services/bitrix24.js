import { env } from '../config/env.js';
import { logger } from '../middlewares/logger.js';

const espera = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function crearLeadBitrix(lead, { fetchImpl = fetch } = {}) {
  if (!env.BITRIX_WEBHOOK_URL) {
    logger.warn('Bitrix24 no configurado; se omite creacion de lead externo');
    return null;
  }

  const payload = {
    fields: {
      TITLE: `Calculadora insolvencia - ${lead.nombre}`,
      NAME: lead.nombre,
      PHONE: [{ VALUE: lead.telefono, VALUE_TYPE: 'WORK' }],
      EMAIL: [{ VALUE: lead.correo, VALUE_TYPE: 'WORK' }],
      ADDRESS_CITY: lead.ciudad,
      [env.BITRIX_FIELD_RESULTADO]: lead.resultado,
      [env.BITRIX_FIELD_SERVICIO]: lead.servicio_recomendado,
      [env.BITRIX_FIELD_RANGO_DEUDA]: lead.rango_deuda
    }
  };

  let lastError;
  for (let intento = 1; intento <= 3; intento += 1) {
    try {
      const response = await fetchImpl(env.BITRIX_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) throw new Error(data.error_description || data.error || 'Bitrix24 rechazo la solicitud');
      return String(data.result);
    } catch (error) {
      lastError = error;
      logger.warn({ err: error, intento }, 'Fallo creando lead en Bitrix24');
      if (intento < 3) await espera(300 * intento);
    }
  }

  throw lastError;
}
