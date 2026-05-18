import { env } from '../config/env.js';
import { logger } from '../middlewares/logger.js';

export async function enviarBienvenidaWhatsApp(lead, { fetchImpl = fetch } = {}) {
  if (!env.WASAPI_API_URL || !env.WASAPI_TOKEN) {
    logger.warn('Wasapi no configurado; se omite envio de WhatsApp');
    return false;
  }

  const payload = {
    to: lead.telefono,
    type: 'template',
    template: {
      name: env.WASAPI_TEMPLATE_NAME,
      language: { code: 'es_CO' },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: lead.nombre }]
        }
      ]
    }
  };

  const response = await fetchImpl(env.WASAPI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.WASAPI_TOKEN}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    logger.warn({ status: response.status, body }, 'Fallo enviando WhatsApp por Wasapi');
    return false;
  }

  return true;
}
