import * as XLSX from 'xlsx'

/**
 * Extrai os itens do colaborador (colunas ITEM 1 a ITEM 10)
 * Formato esperado: CÓD. | QTD. | DIAS. | VALOR (repetido 10x)
 */
function extrairItens(row) {
  const itens = []
  
  // Índices começam em 23 (coluna AD/ITEM 1)
  for (let i = 0; i < 10; i++) {
    const baseCol = 23 + (i * 4) // cada item ocupa 4 colunas
    
    const codigo = row[baseCol]        // CÓD.
    const quantidade = row[baseCol + 1] // QTD.
    const dias = row[baseCol + 2]       // DIAS.
    const valor = row[baseCol + 3]      // VALOR
    
    if (codigo && valor && Number(valor) > 0) {
      itens.push({
        codigo: String(codigo).trim(),
        quantidade: Number(quantidade) || 1,
        dias: Number(dias) || 0,
        valor: Number(valor) || 0
      })
    }
  }
  
  return itens
}

/**
 * Extrai o CNPJ do condomínio do campo DEPARTAMENTO
 * Formato esperado: "52253358000120 - CONDOMINIO EDIFICIO ANAMBE"
 */
function extrairCnpjCondominio(departamento) {
  if (!departamento) return null
  
  const str = String(departamento).trim()
  const match = str.match(/^(\d{14})/)
  
  return match ? match[1] : null
}

/**
 * Extrai nome do condomínio do campo DEPARTAMENTO
 * Formato esperado: "52253358000120 - CONDOMINIO EDIFICIO ANAMBE"
 */
function extrairNomeCondominio(departamento) {
  if (!departamento) return null
  
  const str = String(departamento).trim()
  const match = str.match(/^\d{14}\s*-\s*(.*)$/)
  
  return match ? match[1].trim() : str
}

/**
 * Parser principal da nova planilha
 */
export function parseNovaPlanilhaValeTransporte(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true })
  
  // 1. Lê dados da EMPRESA
  const empresaSheet = workbook.Sheets['EMPRESA']
  const empresaData = XLSX.utils.sheet_to_json(empresaSheet, { header: 1, defval: '' })
  
  // Extrai CNPJ e dados da empresa (linha 4 - índice 3)
  const empresaRow = empresaData[3] || []
  const cnpjEmpresa = empresaRow[0] // Coluna A
  const nomeEmpresa = empresaRow[1]  // Coluna B
  const endereco = empresaRow[3]     // Coluna D - LOGRADOURO
  const numero = empresaRow[4]       // Coluna E - NÚMERO
  const complemento = empresaRow[5]  // Coluna F - COMPLEMENTO
  const cep = empresaRow[6]          // Coluna G - CEP
  const bairro = empresaRow[7]       // Coluna H - BAIRRO
  const cidade = empresaRow[8]       // Coluna I - CIDADE
  const estado = empresaRow[9]       // Coluna J - ESTADO
  
  // 2. Lê USUARIOS (pulando cabeçalhos)
  const usuariosSheet = workbook.Sheets['USUARIOS']
  const rawUsuarios = XLSX.utils.sheet_to_json(usuariosSheet, { header: 1, defval: '' })
  
  // Encontra a linha de cabeçalho com "CNPJ*" (linha 4 - índice 3)
  let headerRowIndex = -1
  for (let i = 0; i < rawUsuarios.length; i++) {
    if (rawUsuarios[i][0] === 'CNPJ*') {
      headerRowIndex = i
      break
    }
  }
  
  if (headerRowIndex === -1) {
    throw new Error('Não foi possível localizar o cabeçalho da planilha')
  }
  
  const headers = rawUsuarios[headerRowIndex]
  const dataRows = rawUsuarios.slice(headerRowIndex + 1)
  
  // Mapeia índices das colunas
  const colIndex = {
    cnpj: 0,
    matricula: 1,
    nomeCompleto: 2,
    email: 3,
    celular: 4,
    ativo: 5,
    endereco: 6,
    cargo: 7,
    departamento: 8,
    diasTrabalhados: 9,
    cpf: 10,
    rg: 11,
    digitoRg: 12,
    estadoRg: 13,
    dataNascimento: 14,
    nomeMae: 15,
    // Itens começam na coluna 23 (índice 23)
  }
  
  // 3. Processa cada usuário
  const usuariosProcessados = []
  
  for (const row of dataRows) {
    if (!row[colIndex.cnpj] || !row[colIndex.nomeCompleto]) continue
    
    const departamento = row[colIndex.departamento]
    const cnpjCondominio = extrairCnpjCondominio(departamento)
    const nomeCondominio = extrairNomeCondominio(departamento)
    
    // Extrai os itens do colaborador
    const itens = extrairItens(row)
    
    if (itens.length === 0) continue
    
    // Para cada item, cria um registro
    for (const item of itens) {
      usuariosProcessados.push({
        // Dados do condomínio
        cnpj_condominio: cnpjCondominio || row[colIndex.cnpj],
        nome_condominio: nomeCondominio || '',
        tipo_local_condominio: 'CONDOMINIO',
        endereco_condominio: '',
        numero_condominio: '',
        complemento_condominio: '',
        bairro_condominio: '',
        cidade_condominio: '',
        estado_condominio: '',
        cep_condominio: '',
        
        // Dados do funcionário
        cpf_funcionario: row[colIndex.cpf] ? String(row[colIndex.cpf]).replace(/\D/g, '') : '',
        matricula_funcionario: row[colIndex.matricula] ? String(row[colIndex.matricula]) : '',
        nome_funcionario: row[colIndex.nomeCompleto] || '',
        funcao_funcionario: row[colIndex.cargo] || '',
        data_nascimento_funcionario: row[colIndex.dataNascimento] || '',
        sexo_funcionario: '',
        
        // Dados do benefício
        codigo_produto: item.codigo,
        nome_produto: '',
        data_competencia: '',
        valor_beneficio_total: item.valor,
        quantidade_dias: item.dias,
        
        // Dados da empresa
        cnpj_empresa: row[colIndex.cnpj],
        nome_empresa: nomeEmpresa,
      })
    }
  }
  
  return {
    success: true,
    movimentacoes: usuariosProcessados,
    empresa: {
      cnpj: cnpjEmpresa,
      nome: nomeEmpresa,
      endereco,
      numero,
      complemento,
      cep,
      bairro,
      cidade,
      estado,
    },
    total_registros: usuariosProcessados.length,
    total_funcionarios: usuariosProcessados.filter((v, i, a) => 
      a.findIndex(t => t.cpf_funcionario === v.cpf_funcionario) === i
    ).length,
  }
}

/**
 * Valida se o arquivo segue o novo formato
 */
export function isNovaPlanilhaValeTransporte(arrayBuffer) {
  try {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    
    // Verifica se tem as abas esperadas
    const hasEmpresa = workbook.SheetNames.includes('EMPRESA')
    const hasUsuarios = workbook.SheetNames.includes('USUARIOS')
    const hasProdutos = workbook.SheetNames.includes('PRODUTOS')
    
    if (!hasEmpresa || !hasUsuarios) return false
    
    // Verifica se a aba USUARIOS tem o cabeçalho esperado
    const sheet = workbook.Sheets['USUARIOS']
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    
    for (let i = 0; i < Math.min(data.length, 10); i++) {
      if (data[i][0] === 'CNPJ*') return true
    }
    
    return false
  } catch {
    return false
  }
}