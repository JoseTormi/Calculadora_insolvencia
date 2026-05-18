export function normalizarCorreo(correo) {
  return correo.trim().toLowerCase();
}

export function normalizarTelefono(telefono) {
  const limpio = telefono.replace(/[^\d+]/g, '');
  if (limpio.startsWith('+')) return limpio;
  if (limpio.length === 10) return `+57${limpio}`;
  return limpio;
}
