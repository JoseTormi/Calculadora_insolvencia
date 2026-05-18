import { z } from 'zod';

const moneda = z.coerce.number().min(0).max(999_999_999_999);

export const calcularSchema = z.object({
  ingresos_mensuales: moneda,
  gastos_mensuales: moneda,
  deuda_total: moneda,
  numero_acreedores: z.coerce.number().int().min(0).max(500),
  tiene_mora: z.boolean(),
  tipo_deuda: z.enum(['consumo', 'hipotecaria', 'mixta', 'otra']).optional(),
  tipo_persona: z.enum(['natural', 'juridica']).optional()
}).strict();

export const crearLeadSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  telefono: z.string().trim().min(7).max(30),
  correo: z.string().trim().email().max(160),
  ciudad: z.string().trim().min(2).max(100),
  calculo: calcularSchema
}).strict();

export const loginSchema = z.object({
  correo: z.string().trim().email(),
  password: z.string().min(8).max(120)
}).strict();

export const idParamSchema = z.object({
  id: z.string().uuid()
}).strict();

export const listarLeadsQuerySchema = z.object({
  fecha_desde: z.string().date().optional(),
  fecha_hasta: z.string().date().optional(),
  ciudad: z.string().trim().min(1).max(100).optional(),
  estado: z.enum(['nuevo', 'contactado', 'no_contactado']).optional(),
  servicio_recomendado: z.enum(['insolvencia', 'rch', 'reorganizacion']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).strict();

export const actualizarLeadSchema = z.object({
  estado: z.enum(['nuevo', 'contactado', 'no_contactado']),
  comentario: z.string().trim().max(1000).optional()
}).strict();
