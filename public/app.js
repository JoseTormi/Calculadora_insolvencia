let ultimoCalculo = null;

const formCalculo = document.querySelector('#form-calculo');
const formLead = document.querySelector('#form-lead');
const resultado = document.querySelector('#resultado');
const leadMsg = document.querySelector('#lead-msg');

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

formCalculo.addEventListener('submit', async (event) => {
  event.preventDefault();
  ultimoCalculo = leerCalculo(formCalculo);
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
  resultado.classList.remove('hidden');
  resultado.innerHTML = `
    <p class="text-sm uppercase text-avanzar-verde">Resultado orientativo</p>
    <h2 class="mt-1 text-2xl font-bold text-avanzar-azul">${json.data.resultado.replace('_', ' ')}</h2>
    <p class="mt-2 text-slate-700">${json.data.mensaje}</p>
    <p class="mt-3 text-sm"><strong>Servicio recomendado:</strong> ${json.data.servicio_recomendado}</p>
    <p class="text-sm"><strong>Rango de deuda:</strong> ${json.data.rango_deuda}</p>
  `;
  formLead.classList.remove('hidden');
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
  if (json.ok) formLead.reset();
});
