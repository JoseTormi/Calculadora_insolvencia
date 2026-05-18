import { describe, expect, it } from 'vitest';
import { calcularDiagnostico, calcularRangoDeuda } from '../src/services/calculadora.js';

describe('calculadora', () => {
  it('marca apto cuando no hay capacidad de pago y hay mora', () => {
    const resultado = calcularDiagnostico({
      ingresos_mensuales: 2_000_000,
      gastos_mensuales: 2_500_000,
      deuda_total: 30_000_000,
      numero_acreedores: 1,
      tiene_mora: true
    });

    expect(resultado.resultado).toBe('apto');
    expect(resultado.servicio_recomendado).toBe('insolvencia');
  });

  it('recomienda RCH cuando la deuda es hipotecaria', () => {
    const resultado = calcularDiagnostico({
      ingresos_mensuales: 6_000_000,
      gastos_mensuales: 3_000_000,
      deuda_total: 120_000_000,
      numero_acreedores: 1,
      tiene_mora: false,
      tipo_deuda: 'hipotecaria'
    });

    expect(resultado.servicio_recomendado).toBe('rch');
    expect(resultado.resultado).toBe('requiere_asesoria');
  });

  it('recomienda reorganizacion para persona juridica', () => {
    const resultado = calcularDiagnostico({
      ingresos_mensuales: 10_000_000,
      gastos_mensuales: 9_000_000,
      deuda_total: 80_000_000,
      numero_acreedores: 3,
      tiene_mora: true,
      tipo_persona: 'juridica'
    });

    expect(resultado.servicio_recomendado).toBe('reorganizacion');
  });

  it('calcula rangos de deuda por tramos', () => {
    expect(calcularRangoDeuda(5_000_000)).toBe('0-10M');
    expect(calcularRangoDeuda(30_000_000)).toBe('10-50M');
    expect(calcularRangoDeuda(80_000_000)).toBe('50M+');
  });
});
