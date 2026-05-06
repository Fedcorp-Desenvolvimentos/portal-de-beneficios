// src/utils/modelo_planilha.js

import * as XLSX from 'xlsx'

export const baixarModeloImportacao = () => {
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

  const linhas = [
    [
      '12345678000199',        // cnpj_condominio
      'CONDOMINIO PARQUE DAS FLORES', // nome_condominio
      'RESIDENCIAL',           // tipo_local_condominio
      'AVENIDA DAS ACACIAS',   // endereco_condominio
      '500',                   // numero_condominio
      'TORRE 2',               // complemento_condominio
      'JARDIM PRIMAVERA',      // bairro_condominio
      'RIO DE JANEIRO',        // cidade_condominio
      'RJ',                    // estado_condominio
      '22775000',              // cep_condominio
      '83345143011',           // cpf_funcionario (válido)
      '2001',                  // matricula_funcionario
      'MARIA JOSE SOUZA SILVA', // nome_funcionario
      'SINDICA',               // funcao_funcionario
      '1975-08-15',            // data_nascimento_funcionario
      'F',                     // sexo_funcionario
      '10101',                 // codigo_produto
      'VALE REFEICAO - TICKET', // nome_produto
      '2026-05-01',            // data_competencia
      '580.75',                // valor_beneficio(total)
      '22',                    // quantidade_dias
    ],
    [
      '12345678000199',
      'CONDOMINIO PARQUE DAS FLORES',
      'RESIDENCIAL',
      'AVENIDA DAS ACACIAS',
      '500',
      'TORRE 2',
      'JARDIM PRIMAVERA',
      'RIO DE JANEIRO',
      'RJ',
      '22775000',
      '10230158030',           // cpf_funcionario (válido)
      '2002',                  // matricula_funcionario
      'JOAO CARLOS MENDES',    // nome_funcionario
      'PORTEIRO',              // funcao_funcionario
      '1982-03-22',            // data_nascimento_funcionario
      'M',                     // sexo_funcionario
      '20202',                 // codigo_produto
      'VALE REFEICAO - TICKET', // nome_produto
      '2026-05-01',
      '450.30',
      '22',
    ],
    [
      '12345678000199',
      'CONDOMINIO PARQUE DAS FLORES',
      'RESIDENCIAL',
      'AVENIDA DAS ACACIAS',
      '500',
      'TORRE 2',
      'JARDIM PRIMAVERA',
      'RIO DE JANEIRO',
      'RJ',
      '22775000',
      '44043044046',           // cpf_funcionario (válido)
      '2003',                  // matricula_funcionario
      'ANA CRISTINA PEREIRA',  // nome_funcionario
      'AUXILIAR DE LIMPEZA',   // funcao_funcionario
      '1990-12-05',            // data_nascimento_funcionario
      'F',                     // sexo_funcionario
      '30303',                 // codigo_produto
      'VALE REFEICAO - TICKET', // nome_produto
      '2026-05-01',
      '220.00',
      '22',
    ],
    [
      '12345678000199',
      'CONDOMINIO PARQUE DAS FLORES',
      'RESIDENCIAL',
      'AVENIDA DAS ACACIAS',
      '500',
      'TORRE 2',
      'JARDIM PRIMAVERA',
      'RIO DE JANEIRO',
      'RJ',
      '22775000',
      '20502050071',           // cpf_funcionario (válido)
      '1001',                  // matricula_funcionario
      'ROBERTO ALMEIDA COSTA', // nome_funcionario
      'ZELADOR',               // funcao_funcionario
      '1978-06-18',            // data_nascimento_funcionario
      'M',                     // sexo_funcionario
      '40404',                 // codigo_produto
      'CARTAO - TOP',          // nome_produto
      '2026-05-01',
      '350.00',
      '30',
    ],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...linhas])

  worksheet['!cols'] = [
    { wch: 18 }, // cnpj_condominio
    { wch: 38 }, // nome_condominio
    { wch: 22 }, // tipo_local_condominio
    { wch: 28 }, // endereco_condominio
    { wch: 18 }, // numero_condominio
    { wch: 22 }, // complemento_condominio
    { wch: 22 }, // bairro_condominio
    { wch: 20 }, // cidade_condominio
    { wch: 18 }, // estado_condominio
    { wch: 16 }, // cep_condominio
    { wch: 18 }, // cpf_funcionario
    { wch: 20 }, // matricula_funcionario
    { wch: 34 }, // nome_funcionario
    { wch: 24 }, // funcao_funcionario
    { wch: 24 }, // data_nascimento_funcionario
    { wch: 16 }, // sexo_funcionario
    { wch: 18 }, // codigo_produto
    { wch: 40 }, // nome_produto
    { wch: 20 }, // data_competencia
    { wch: 22 }, // valor_beneficio(total)
    { wch: 18 }, // quantidade_dias
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo Importacao')
  XLSX.writeFile(workbook, 'modelo_importacao_beneficios.xlsx')
}