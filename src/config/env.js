import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  JWT_SECRET: z.string().min(24, 'JWT_SECRET debe tener al menos 24 caracteres'),
  CORS_ORIGIN: z.string().default('*'),
  BITRIX_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
  BITRIX_FIELD_RESULTADO: z.string().default('UF_CRM_RESULTADO'),
  BITRIX_FIELD_SERVICIO: z.string().default('UF_CRM_SERVICIO'),
  BITRIX_FIELD_RANGO_DEUDA: z.string().default('UF_CRM_RANGO_DEUDA'),
  WASAPI_API_URL: z.string().url().optional().or(z.literal('')),
  WASAPI_TOKEN: z.string().optional().or(z.literal('')),
  WASAPI_TEMPLATE_NAME: z.string().default('bienvenida_avanzar')
});

export const env = envSchema.parse(process.env);
