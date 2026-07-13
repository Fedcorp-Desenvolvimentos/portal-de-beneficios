import * as XLSX from 'xlsx'

const larguraPadrao = [
  { wch: 18 },
  { wch: 38 },
  { wch: 22 },
  { wch: 28 },
  { wch: 18 },
  { wch: 22 },
  { wch: 22 },
  { wch: 20 },
  { wch: 18 },
  { wch: 16 },
  { wch: 18 },
  { wch: 20 },
  { wch: 34 },
  { wch: 24 },
  { wch: 24 },
  { wch: 16 },
  { wch: 18 },
  { wch: 40 },
  { wch: 20 },
  { wch: 22 },
  { wch: 18 },
]

const gerarPlanilha = ({ headers, nomeAba, nomeArquivo }) => {
  const worksheet = XLSX.utils.aoa_to_sheet([headers])
  worksheet['!cols'] = larguraPadrao.slice(0, headers.length)

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, nomeAba)
  XLSX.writeFile(workbook, nomeArquivo)
}

// No modelo_planilha.js, adicione:

export const baixarModeloValeTransporte = () => {
  const workbook = XLSX.utils.book_new()
  
  // Aba USUARIOS
  const usuariosHeaders = [
    ['CNPJ*', 'MATRÍCULA*', 'NOME COMPLETO*', 'EMAIL', 'CELULAR', 'ATIVO', 'ENDEREÇO*', 'CARGO', 'DEPARTAMENTO', 'DIAS TRABALHADOS*', 'CPF*', 'RG.', 'DG.', 'EST.RG', 'DATA DE NASCIMENTO', 'NOME DA MÃE', 'LOGRADOURO', 'NÚMERO', 'COMPLEMENTO', 'BAIRRO', 'CEP', 'CIDADE', 'ESTADO', 'ITEM 1', '', '', '', 'ITEM 2', '', '', '', 'ITEM 3', '', '', '', 'ITEM 4', '', '', '', 'ITEM 5', '', '', '', 'ITEM 6', '', '', '', 'ITEM 7', '', '', '', 'ITEM 8', '', '', '', 'ITEM 9', '', '', '', 'ITEM 10', '', '', '', 'DADOS BANCÁRIOS', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'CÓD.', 'QTD.', 'DIAS.', 'VALOR', 'CÓD.', 'QTD.', 'DIAS.', 'VALOR', 'CÓD.', 'QTD.', 'DIAS.', 'VALOR', 'CÓD.', 'QTD.', 'DIAS.', 'VALOR', 'CÓD.', 'QTD.', 'DIAS.', 'VALOR', 'CÓD.', 'QTD.', 'DIAS.', 'VALOR', 'CÓD.', 'QTD.', 'DIAS.', 'VALOR', 'CÓD.', 'QTD.', 'DIAS.', 'VALOR', 'CÓD.', 'QTD.', 'DIAS.', 'VALOR', 'COD. BANCO', 'COD. AGÊNCIA', 'DIG. AGÊNCIA', 'CONTA CORRENTE', 'DIG. CONTA', 'FAVORECIDO', 'CPF FAVORECIDO', 'CHAVE PIX', 'TIPO DE CHAVE PIX'],
  ]
  
  const usuariosSheet = XLSX.utils.aoa_to_sheet(usuariosHeaders)
  XLSX.utils.book_append_sheet(workbook, usuariosSheet, 'USUARIOS')
  
  XLSX.writeFile(workbook, 'modelo_vale_transporte_novo.xlsx')
}

export const baixarModeloBeneficios = () => {
  const headers = [
    'cnpj_condominio',
    'nome_condominio',
    'tipo_local_condominio',
    'endereco_condominio',
    'numero_condominio',
    'complemento_condominio',
    'bairro_condominio',
    'cidade_condominio',
    'estado_condominio',
    'cep_condominio',
    'cpf_funcionario',
    'matricula_funcionario',
    'nome_funcionario',
    'funcao_funcionario',
    'data_nascimento_funcionario',
    'sexo_funcionario',
    'codigo_produto',
    'nome_produto',
    'data_competencia',
    'valor_beneficio(total)',
    'quantidade_dias',
  ]

  gerarPlanilha({
    headers,
    nomeAba: 'Modelo Beneficios',
    nomeArquivo: 'modelo_importacao_beneficios.xlsx',
  })
}

export const baixarModeloImportacao = baixarModeloBeneficios