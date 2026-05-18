export const calculadoraConfig = {
  mesesDeudaSobreCapacidad: 24,
  acreedoresMinimos: 2,
  tramosDeuda: [
    { max: 10_000_000, label: '0-10M' },
    { max: 50_000_000, label: '10-50M' },
    { max: null, label: '50M+' }
  ]
};
