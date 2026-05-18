import { calcularDiagnostico } from '../services/calculadora.js';
import { ok } from '../utils/apiResponse.js';

export function calcular(req, res) {
  ok(res, calcularDiagnostico(req.body));
}
