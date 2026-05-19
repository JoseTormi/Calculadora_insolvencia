let ultimoCalculo = null;
let pasoActual = 0;

const formCalculo = document.querySelector('#form-calculo');
const formLead = document.querySelector('#form-lead');
const resultado = document.querySelector('#resultado');
const leadMsg = document.querySelector('#lead-msg');
const panels = [...document.querySelectorAll('.step-panel')];
const prevStep = document.querySelector('#prev-step');
const nextStep = document.querySelector('#next-step');
const submitCalc = document.querySelector('#submit-calc');
const stepLabel = document.querySelector('#step-label');
const stepProgress = document.querySelector('#step-progress');

const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

function peso(valor) {
  return formatter.format(Number.isFinite(valor) ? valor : 0);
}

function leerCalculo(form) {
  const data = new FormData(form);
  return {
    ingresos_mensuales: Number(data.get('ingresos_mensuales')),
    gastos_mensuales: Number(data.get('gastos_mensuales')),
    deuda_total: Number(data.get('deuda_total')),
    numero_acreedores: Number(data.get('numero_acreedores')),
    tiene_mora: data.get('tiene_mora') === 'on',
    tipo_deuda: data.get('tipo_deuda'),
    tipo_persona: data.get('tipo_persona')
  };
}

function actualizarPreview() {
  const calculo = leerCalculo(formCalculo);
  const capacidad = calculo.ingresos_mensuales - calculo.gastos_mensuales;
  const ratio = calculo.ingresos_mensuales > 0 ? calculo.deuda_total / calculo.ingresos_mensuales : 0;
  const capacidadPorcentaje = Math.max(0, Math.min(100, (capacidad / Math.max(calculo.ingresos_mensuales, 1)) * 100));
  const ratioPorcentaje = Math.max(0, Math.min(100, (ratio / 24) * 100));

  document.querySelector('#preview-capacidad').textContent = peso(capacidad);
  document.querySelector('#preview-ratio').textContent = `${ratio.toFixed(1)}x`;
  document.querySelector('#preview-acreedores').textContent = calculo.numero_acreedores;
  document.querySelector('#preview-mora').textContent = calculo.tiene_mora ? 'Si' : 'No';
  document.querySelector('#bar-capacidad').style.width = `${capacidadPorcentaje}%`;
  document.querySelector('#bar-ratio').style.width = `${ratioPorcentaje}%`;
}

function actualizarPaso() {
  panels.forEach((panel, index) => {
    panel.classList.toggle('is-active', index === pasoActual);
  });
  stepLabel.textContent = `Paso ${pasoActual + 1} de ${panels.length}`;
  stepProgress.style.width = `${((pasoActual + 1) / panels.length) * 100}%`;
  prevStep.disabled = pasoActual === 0;
  nextStep.classList.toggle('hidden', pasoActual === panels.length - 1);
  submitCalc.classList.toggle('hidden', pasoActual !== panels.length - 1);
}

function pasoValido() {
  const controles = [...panels[pasoActual].querySelectorAll('input, select')];
  return controles.every((control) => control.reportValidity());
}

function pintarResultado(data) {
  const resultadoTexto = data.resultado.replaceAll('_', ' ');
  resultado.classList.remove('hidden');
  resultado.innerHTML = `
    <p class="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Resultado orientativo</p>
    <h2 class="mt-2 text-3xl font-extrabold capitalize tracking-[-0.03em] text-white">${resultadoTexto}</h2>
    <p class="mt-3 leading-7 text-white/58">${data.mensaje}</p>
    <div class="mt-5 grid gap-3 text-sm">
      <div class="rounded-[10px] border border-white/10 bg-white/[0.04] p-3">
        <span class="block text-white/38">Servicio recomendado</span>
        <strong class="mt-1 block text-lg capitalize text-white">${data.servicio_recomendado}</strong>
      </div>
      <div class="rounded-[10px] border border-white/10 bg-white/[0.04] p-3">
        <span class="block text-white/38">Rango de deuda</span>
        <strong class="mt-1 block text-lg text-white">${data.rango_deuda}</strong>
      </div>
    </div>
  `;
}

document.querySelectorAll('[data-sync]').forEach((range) => {
  const number = formCalculo.elements[range.dataset.sync];
  range.addEventListener('input', () => {
    number.value = range.value;
    actualizarPreview();
  });
  number.addEventListener('input', () => {
    range.value = Math.min(Number(range.max), Math.max(Number(range.min), Number(number.value || 0)));
    actualizarPreview();
  });
});

formCalculo.addEventListener('input', actualizarPreview);

prevStep.addEventListener('click', () => {
  pasoActual = Math.max(0, pasoActual - 1);
  actualizarPaso();
});

nextStep.addEventListener('click', () => {
  if (!pasoValido()) return;
  pasoActual = Math.min(panels.length - 1, pasoActual + 1);
  actualizarPaso();
});

formCalculo.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!pasoValido()) return;

  ultimoCalculo = leerCalculo(formCalculo);
  submitCalc.disabled = true;
  submitCalc.textContent = 'Calculando...';

  try {
    const response = await fetch('/api/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ultimoCalculo)
    });
    const json = await response.json();
    if (!json.ok) {
      resultado.classList.remove('hidden');
      resultado.textContent = json.error || 'No fue posible calcular.';
      return;
    }
    pintarResultado(json.data);
    formLead.classList.remove('hidden');
    formLead.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } finally {
    submitCalc.disabled = false;
    submitCalc.textContent = 'Calcular diagnostico';
  }
});

formLead.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(formLead).entries());
  leadMsg.textContent = 'Guardando...';
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, calculo: ultimoCalculo })
  });
  const json = await response.json();
  leadMsg.textContent = json.ok
    ? 'Datos recibidos. Un asesor se comunicara contigo.'
    : json.error || 'No fue posible guardar tus datos.';
  leadMsg.className = json.ok ? 'text-sm text-green-300' : 'text-sm text-red-300';
  if (json.ok) formLead.reset();
});

actualizarPaso();
actualizarPreview();
