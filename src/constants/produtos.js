export const PRODUTOS_TAXA = [
  { codigo: '207', nome: 'Multibenefícios' },
  { codigo: '27', nome: 'Alimentação' },
  { codigo: '28', nome: 'Vale Combustível' },
  { codigo: '201', nome: 'Cesta' },
  { codigo: '202', nome: 'Boas Festas' },
  { codigo: '204', nome: 'Auxílio Alimentação' },
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
