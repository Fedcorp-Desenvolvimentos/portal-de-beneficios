const LABELS = {
  pago: 'Pago',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
}

export function resolveBoletoDisplayStatus(boleto) {
  const status = String(boleto?.status || '').toUpperCase()

  if (status === 'C') {
    return { variant: 'cancelado', label: LABELS.cancelado }
  }

  if (boleto?._baixa || boleto?.baixa) {
    return { variant: 'pago', label: LABELS.pago }
  }

  if (status === 'A') {
    return { variant: 'pendente', label: LABELS.pendente }
  }

  return { variant: 'pendente', label: LABELS.pendente }
}
