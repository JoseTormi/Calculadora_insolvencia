import { calculadoraConfig } from '../config/constants.js';

export function calcularRangoDeuda(deudaTotal, config = calculadoraConfig) {
  const tramo = config.tramosDeuda.find((item) => item.max === null || deudaTotal <= item.max);
  return tramo?.label || '50M+';
}

export function calcularDiagnostico(input, config = calculadoraConfig) {
  const ingresos = Number(input.ingresos_mensuales);
  const gastos = Number(input.gastos_mensuales);
  const deudaTotal = Number(input.deuda_total);
  const numeroAcreedores = Number(input.numero_acreedores);
  const capacidadPago = ingresos - gastos;
  const rangoDeuda = calcularRangoDeuda(deudaTotal, config);

  // Diagnóstico orientativo para priorización comercial. No reemplaza asesoría legal.
  let resultado = 'requiere_asesoria';
  let servicioRecomendado = 'insolvencia';
  let mensaje = 'Tu caso requiere una revisión personalizada para determinar la ruta legal más conveniente.';

  if (input.tipo_persona === 'juridica') {
    return {
      resultado: 'requiere_asesoria',
      servicio_recomendado: 'reorganizacion',
      rango_deuda: rangoDeuda,
      capacidad_pago: capacidadPago,
      mensaje: 'Por tratarse de una persona jurídica, la ruta orientativa es una revisión de reorganización empresarial.'
    };
  }

  if (input.tipo_deuda === 'hipotecaria') {
    return {
      resultado: 'requiere_asesoria',
      servicio_recomendado: 'rch',
      rango_deuda: rangoDeuda,
      capacidad_pago: capacidadPago,
      mensaje: 'Por el componente hipotecario, conviene evaluar una reduccion de credito hipotecario.'
    };
  }

  const deudaAltaFrenteCapacidad =
    capacidadPago <= 0 || deudaTotal > capacidadPago * config.mesesDeudaSobreCapacidad;
  const presionDeCobro = input.tiene_mora || numeroAcreedores >= config.acreedoresMinimos;

  if (deudaAltaFrenteCapacidad && presionDeCobro) {
    resultado = 'apto';
    servicioRecomendado = 'insolvencia';
    mensaje = 'Con la información suministrada, pareces tener condiciones para evaluar Ley de Insolvencia.';
  } else if (capacidadPago > 0 && deudaTotal <= capacidadPago * 12 && !input.tiene_mora) {
    resultado = 'no_apto';
    servicioRecomendado = 'insolvencia';
    mensaje = 'Con la información suministrada, aún podría existir capacidad de pago. Recomendamos revisar alternativas antes de insolvencia.';
  }

  return {
    resultado,
    servicio_recomendado: servicioRecomendado,
    rango_deuda: rangoDeuda,
    capacidad_pago: capacidadPago,
    mensaje
  };
}
