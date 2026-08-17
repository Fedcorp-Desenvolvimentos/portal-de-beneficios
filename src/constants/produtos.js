// Catálogo oficial da VR (PRODUTOS - VR.xlsx, ago/2026) — cada produto tem
// código próprio. Cultura (30) e Multi - Premiação (59) ficam fora: são
// rejeitados na importação.
export const PRODUTOS_TAXA = [
  { codigo: '31', nome: 'Refeição' },
  { codigo: '243', nome: 'Auxílio Refeição' },
  { codigo: '242', nome: 'Refeição Adicional' },
  { codigo: '27', nome: 'Alimentação' },
  { codigo: '204', nome: 'Auxílio Alimentação' },
  { codigo: '201', nome: 'Cesta' },
  { codigo: '202', nome: 'Boas Festas' },
  { codigo: '217', nome: 'Multi - Boas Festas' },
  { codigo: '28', nome: 'Auto' },
  { codigo: '261', nome: 'Auto Manutenção' },
  { codigo: '207', nome: 'Multibenefícios' },
  { codigo: '209', nome: 'Auxílio VR+VA' },
  { codigo: '213', nome: 'Multi - Auxílio VR+VA' },
  { codigo: '244', nome: 'Multi - Refeição' },
  { codigo: '245', nome: 'Multi - Auxílio Refeição' },
  { codigo: '212', nome: 'Multi - Alimentação' },
  { codigo: '211', nome: 'Multi - Auxílio Alimentação' },
  { codigo: '58', nome: 'Multi - Home Office' },
  { codigo: '262', nome: 'Multi - Mobilidade' },
]

export const PERCENTUAIS_TAXA = [
  { value: '', label: 'Selecione' },
  { value: '0', label: '0%' },
  { value: '0.5', label: '0,5%' },
  { value: '1', label: '1%' },
  { value: '1.5', label: '1,5%' },
  { value: '2', label: '2%' },
  { value: '2.5', label: '2,5%' },
  { value: '3', label: '3%' },
  { value: '3.5', label: '3,5%' },
  { value: '4', label: '4%' },
  { value: '4.5', label: '4,5%' },
  { value: '5', label: '5%' },
]

export function getNomeProdutoPorCodigo(codigo) {
  const produto = PRODUTOS_TAXA.find((p) => p.codigo === codigo)
  return produto?.nome || codigo
}

export function getLabelPercentual(value) {
  const p = PERCENTUAIS_TAXA.find((item) => item.value === value)
  return p?.label || value
}
