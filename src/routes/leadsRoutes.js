import { Router } from 'express';
import {
  actualizarLead,
  crearLead,
  exportarLeads,
  listarLeads,
  obtenerLead
} from '../controllers/leadsController.js';
import {
  actualizarLeadSchema,
  crearLeadSchema,
  idParamSchema,
  listarLeadsQuerySchema
} from '../controllers/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middlewares/auth.js';
import { leadsLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';

export const leadsRoutes = Router();

leadsRoutes.post('/leads', leadsLimiter, validate({ body: crearLeadSchema }), asyncHandler(crearLead));
leadsRoutes.get('/leads', asyncHandler(requireAuth), validate({ query: listarLeadsQuerySchema }), asyncHandler(listarLeads));
leadsRoutes.get('/leads/export', asyncHandler(requireAuth), validate({ query: listarLeadsQuerySchema }), asyncHandler(exportarLeads));
leadsRoutes.get('/leads/:id', asyncHandler(requireAuth), validate({ params: idParamSchema }), asyncHandler(obtenerLead));
leadsRoutes.patch('/leads/:id', asyncHandler(requireAuth), validate({ params: idParamSchema, body: actualizarLeadSchema }), asyncHandler(actualizarLead));
