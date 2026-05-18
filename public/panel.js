let token = localStorage.getItem('avanzar_token');

const login = document.querySelector('#login');
const panel = document.querySelector('#panel');
const exportar = document.querySelector('#exportar');
const filtros = document.querySelector('#filtros');
const tbody = document.querySelector('#leads');

function authHeaders() {
  return { Authorization: `Bearer ${token}` };
}

function queryFiltros() {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(filtros).entries()) {
    if (value) params.set(key, value);
  }
  return params.toString();
}

async function cargarLeads() {
  const response = await fetch(`/api/leads?${queryFiltros()}`, { headers: authHeaders() });
  const json = await response.json();
  if (!json.ok) return;
  tbody.innerHTML = json.data.items.map((lead) => `
    <tr class="border-t">
      <td class="p-3">${new Date(lead.created_at).toLocaleDateString('es-CO')}</td>
      <td class="p-3">${lead.nombre}</td>
      <td class="p-3">${lead.ciudad}</td>
      <td class="p-3">${Number(lead.deuda_total).toLocaleString('es-CO')}</td>
      <td class="p-3">${lead.resultado}</td>
      <td class="p-3">${lead.servicio_recomendado}</td>
      <td class="p-3">
        <select data-id="${lead.id}" class="estado rounded border p-1">
          ${['nuevo', 'contactado', 'no_contactado'].map((estado) => `<option value="${estado}" ${estado === lead.estado ? 'selected' : ''}>${estado}</option>`).join('')}
        </select>
      </td>
    </tr>
  `).join('');
}

async function iniciarPanel() {
  if (!token) return;
  login.classList.add('hidden');
  panel.classList.remove('hidden');
  exportar.classList.remove('hidden');
  await cargarLeads();
}

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(new FormData(event.target).entries()))
  });
  const json = await response.json();
  if (!json.ok) {
    document.querySelector('#login-msg').textContent = json.error || 'No fue posible ingresar.';
    return;
  }
  token = json.data.token;
  localStorage.setItem('avanzar_token', token);
  iniciarPanel();
});

filtros.addEventListener('submit', (event) => {
  event.preventDefault();
  cargarLeads();
});

tbody.addEventListener('change', async (event) => {
  if (!event.target.classList.contains('estado')) return;
  await fetch(`/api/leads/${event.target.dataset.id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: event.target.value })
  });
});

exportar.addEventListener('click', () => {
  fetch(`/api/leads/export?${queryFiltros()}`, { headers: authHeaders() })
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'leads.csv';
      link.click();
      URL.revokeObjectURL(url);
    });
});

iniciarPanel();
