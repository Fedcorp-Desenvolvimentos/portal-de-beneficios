import React, { useEffect, useMemo, useState } from 'react'
import FileUpload from '../../../components/FileUpload/FileUpload.jsx'
import { PencilLine, Trash2, Check, X as XIcon, Eye } from 'lucide-react'
import './Importacao.css'
import { uploadService } from '../../../services/uploadService.js'
import { toast } from 'react-toastify'
import {
  prepararDadosParaEnvio,
} from '../../../utils/ajuste_calculo_importacao.js'
import { getDueDateInput } from '../../../utils/datePickerUtils.js'

import { useAuth } from '../../../context/AuthContext.jsx'

import { useLoading } from "../../../hooks/useLoading.js";
import PageLayout from '../../../Layouts/PageLayout/PageLayout.jsx'

import {
  buscarRegraValorAdministradora,
  atualizarRegraValorAdministradora,
  criarRegraValorAdministradora
} from '../../../services/administradoraService.js';

import { vtService } from '../../../services/vtService.js';
import { obterDataVencimento } from '../../../utils/bloqueia_data.js'
import DatePickerWrapper from '../../../components/DatePicker/DatePickerWrapper.jsx'


function Modal({ open, title, onClose, children, locked = false }) {
  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>

          <button
            className="btn-ghost"
            onClick={onClose}
            type="button"
            disabled={locked}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

const MESES = [
  { label: 'Janeiro', value: '01' },
  { label: 'Fevereiro', value: '02' },
  { label: 'Março', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Maio', value: '05' },
  { label: 'Junho', value: '06' },
  { label: 'Julho', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Setembro', value: '09' },
  { label: 'Outubro', value: '10' },
  { label: 'Novembro', value: '11' },
  { label: 'Dezembro', value: '12' },
]

function getNomeColaborador(row) {
  return row?.nome_funcionario || row?.nome_func || row?.colaborador || row?.nome || row?.funcionario || row?.nome_funcionário || ''
}

function getValorRow(row) {
  if (row?.valor_total && typeof row.valor_total !== 'undefined') {
    const valor = typeof row.valor_total === 'string' ? parseFloat(row.valor_total) : row.valor_total
    if (!isNaN(valor)) return valor
  }

  if (row?.valor && typeof row.valor !== 'undefined') {
    const valor = typeof row.valor === 'string' ? parseFloat(row.valor) : row.valor
    if (!isNaN(valor)) return valor
  }

  if (row?.valor_recarga_bene) {
    const valor = typeof row.valor_recarga_bene === 'string' ? parseFloat(row.valor_recarga_bene) : row.valor_recarga_bene
    if (!isNaN(valor)) return valor
  }

  for (const key of ['valorTotal', 'ValorTotal', 'total', 'amount', 'preco']) {
    if (row[key]) {
      const valor = typeof row[key] === 'string' ? parseFloat(row[key]) : row[key]
      if (!isNaN(valor)) return valor
    }
  }

  return 0
}

function getCondominio(row) {
  return row?.condominio || row?.nome_condominio || row?.condominio_nome || row?.NomeCondominio || ''
}

function getCpf(row) {
  return String(row?.cpf || row?.cpf_func || row?.cpf_funcionario || row?.CPF || '').trim()
}

function getRowKey(row) {
  const cpf = getCpf(row)
  if (cpf) return `${getCondominio(row)}::${getNomeColaborador(row)}::${cpf}`
  return `${getCondominio(row)}::${getNomeColaborador(row)}`
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDateBR(value) {
  if (!value) return '-'

  const raw = String(value).trim()
  if (!raw) return '-'

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [y, m, d] = raw.split('T')[0].split('-')
    return `${d}/${m}/${y}`
  }

  return raw
}

function formatCompetenciaBR(mes, ano) {
  if (!mes && !ano) return '-'

  const mesFormatado = String(mes || '').padStart(2, '0')
  return `${mesFormatado}/${ano || ''}`
}

function getErrorMessageFromPayload(value) {
  if (!value) return ''

  if (typeof value === 'string') return value

  if (Array.isArray(value)) {
    return value
      .map((item) => getErrorMessageFromPayload(item))
      .filter(Boolean)
      .join(' • ')
  }

  if (typeof value === 'object') {
    return (
      value.mensagem ||
      value.message ||
      value.detail ||
      value.error ||
      value.erro ||
      value.descricao ||
      ''
    )
  }

  return String(value)
}

function normalizarListaMensagens(value) {
  if (!value) return []

  if (typeof value === 'string') {
    return value.trim() ? [value.trim()] : []
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizarListaMensagens(item))
      .filter(Boolean)
  }

  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([campo, mensagens]) => {
      const lista = normalizarListaMensagens(mensagens)

      return lista.map((mensagem) => {
        const texto = String(mensagem || '').trim()
        if (!texto) return ''

        const campoNormalizado = String(campo || '').trim()
        if (!campoNormalizado || campoNormalizado === 'non_field_errors') {
          return texto
        }

        return `${campoNormalizado}: ${texto}`
      })
    }).filter(Boolean)
  }

  return [String(value)]
}

function getNomeColaboradorErro(erro = {}, detalhes = {}) {
  return (
    erro?.nome_colaborador ||
    erro?.nome_funcionario ||
    erro?.nome_func ||
    erro?.colaborador ||
    erro?.funcionario ||
    erro?.nome ||
    detalhes?.nome_colaborador ||
    detalhes?.nome_funcionario ||
    detalhes?.nome_func ||
    detalhes?.colaborador ||
    detalhes?.funcionario ||
    detalhes?.nome ||
    detalhes?.nome_funcionário ||
    ''
  )
}

function normalizarErroImportacao(erro, index = 0) {
  if (!erro) {
    return {
      linha: '-',
      tipo_erro: 'ERRO_PROCESSAMENTO',
      dados: {},
      mensagem: 'Erro não identificado no processamento.',
      erros: ['Erro não identificado no processamento.'],
      colaborador: '',
      ordem: index,
    }
  }

  if (typeof erro === 'string') {
    return {
      linha: '-',
      tipo_erro: 'ERRO_PROCESSAMENTO',
      dados: {},
      mensagem: erro,
      erros: [erro],
      colaborador: '',
      ordem: index,
    }
  }

  const detalhesOriginais =
    erro?.dados ||
    erro?.details ||
    erro?.record ||
    erro?.registro ||
    erro ||
    {}

  const detalhes = {
    ...(typeof detalhesOriginais === 'object' && !Array.isArray(detalhesOriginais)
      ? detalhesOriginais
      : {}),
  }

  const linha =
    erro?.linha ??
    erro?.line ??
    erro?.row ??
    erro?.row_number ??
    erro?.numero_linha ??
    erro?.index_linha ??
    erro?.excel_row ??
    detalhes?.linha ??
    detalhes?.line ??
    detalhes?.row ??
    '-'

  const tipo =
    erro?.tipo_erro ||
    erro?.tipo ||
    erro?.type ||
    erro?.code ||
    erro?.codigo ||
    erro?.campo ||
    detalhes?.tipo_erro ||
    detalhes?.tipo ||
    detalhes?.campo ||
    (erro?.cnpj || detalhes?.cnpj
      ? 'ERRO_CONDOMINIO'
      : 'ERRO_PROCESSAMENTO')

  const mensagensEspecificas = [
    ...normalizarListaMensagens(erro?.erros),
    ...normalizarListaMensagens(erro?.errors),
    ...normalizarListaMensagens(erro?.mensagens),
    ...normalizarListaMensagens(erro?.validacoes),
    ...normalizarListaMensagens(detalhes?.erros),
    ...normalizarListaMensagens(detalhes?.errors),
  ]

  const mensagemPrincipal =
    erro?.mensagem ||
    erro?.message ||
    erro?.detail ||
    erro?.error ||
    erro?.erro ||
    erro?.descricao ||
    detalhes?.mensagem ||
    detalhes?.message ||
    detalhes?.detail ||
    detalhes?.error ||
    detalhes?.erro ||
    detalhes?.descricao ||
    mensagensEspecificas[0] ||
    `Erro na linha ${linha}: ${tipo}`

  const erros = Array.from(
    new Set(
      [mensagemPrincipal, ...mensagensEspecificas]
        .flatMap((item) => normalizarListaMensagens(item))
        .map((item) => String(item || '').trim())
        .filter(Boolean)
    )
  )

  const ehErroCondominio =
    Boolean(erro?.cnpj || detalhes?.cnpj) &&
    !erro?.cpf &&
    !detalhes?.cpf

  const colaborador = ehErroCondominio
    ? ''
    : getNomeColaboradorErro(erro, detalhes)

  const cpf = getCpf(erro) || getCpf(detalhes)
  const condominio = getCondominio(erro) || getCondominio(detalhes)

  return {
    linha,
    tipo_erro: tipo,
    dados: {
      ...detalhes,
      ...(colaborador ? { nome_colaborador: colaborador } : {}),
      ...(cpf ? { cpf } : {}),
      ...(condominio ? { condominio } : {}),
    },
    mensagem: erros[0] || mensagemPrincipal,
    erros,
    colaborador,
    ordem: index,
  }
}

function isMensagemSucessoImportacao(mensagem) {
  const texto = normalizeText(mensagem)

  return (
    texto.includes('ARQUIVO PROCESSADO') ||
    texto.includes('CONFIRME OS DADOS') ||
    texto.includes('PROCESSADO COM SUCESSO') ||
    texto.includes('IMPORTADO COM SUCESSO') ||
    texto.includes('UPLOAD REALIZADO') ||
    texto.includes('LOTE PROCESSADO')
  )
}

function transformarErrosEmLista(value) {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    return []
  }

  if (typeof value !== 'object') {
    return []
  }

  const pareceErroUnico =
    value.linha !== undefined ||
    value.line !== undefined ||
    value.row !== undefined ||
    value.row_number !== undefined ||
    value.numero_linha !== undefined ||
    value.index_linha !== undefined ||
    value.excel_row !== undefined ||
    value.mensagem !== undefined ||
    value.message !== undefined ||
    value.erro !== undefined ||
    value.error !== undefined ||
    value.nome_funcionario !== undefined ||
    value.nome_colaborador !== undefined ||
    value.cpf !== undefined

  if (pareceErroUnico) {
    return [value]
  }

  return Object.entries(value).flatMap(([chave, item]) => {
    const linhaPelaChave = /^\d+$/.test(chave) ? chave : undefined

    if (Array.isArray(item)) {
      return item.flatMap((erro) => {
        if (erro === null || erro === undefined) {
          return []
        }

        if (typeof erro === 'object') {
          const linha =
            erro.linha ??
            erro.line ??
            erro.row ??
            erro.row_number ??
            erro.numero_linha ??
            erro.index_linha ??
            erro.excel_row ??
            linhaPelaChave ??
            '-'

          return [
            {
              ...erro,
              linha,
            },
          ]
        }

        return [
          {
            linha: linhaPelaChave ?? '-',
            campo: linhaPelaChave ? undefined : chave,
            mensagem: String(erro),
          },
        ]
      })
    }

    if (typeof item === 'object' && item !== null) {
      const linha =
        item.linha ??
        item.line ??
        item.row ??
        item.row_number ??
        item.numero_linha ??
        item.index_linha ??
        item.excel_row ??
        linhaPelaChave ??
        '-'

      return [
        {
          ...item,
          linha,
        },
      ]
    }

    if (typeof item === 'string' && item.trim()) {
      return [
        {
          linha: linhaPelaChave ?? '-',
          campo: linhaPelaChave ? undefined : chave,
          mensagem: item.trim(),
        },
      ]
    }

    return []
  })
}

function extrairErrosImportacao(payload, options = {}) {
  const { incluirMensagensGerais = false } = options

  if (!payload) return []

  /*
   * Primeiro buscamos erros estruturados.
   * Eles têm prioridade sobre mensagens gerais como:
   * "Planilha contém informações obrigatórias ausentes ou incorretas."
   */
  const listasEstruturadas = [
    payload?.linhas_com_erro,
    payload?.linhasComErro,
    payload?.validation_errors,
    payload?.validationErrors,
    payload?.erros_condominios,
    payload?.erros_funcionarios,
    payload?.erros_colaboradores,

    payload?.data?.linhas_com_erro,
    payload?.data?.linhasComErro,
    payload?.data?.validation_errors,
    payload?.data?.erros_condominios,
    payload?.data?.erros_funcionarios,
    payload?.data?.erros_colaboradores,

    payload?.dados?.linhas_com_erro,
    payload?.dados?.linhasComErro,
    payload?.dados?.validation_errors,
    payload?.dados?.erros_condominios,
    payload?.dados?.erros_funcionarios,
    payload?.dados?.erros_colaboradores,

    payload?.result?.linhas_com_erro,
    payload?.result?.linhasComErro,
    payload?.result?.validation_errors,
    payload?.result?.erros_condominios,
    payload?.result?.erros_funcionarios,
    payload?.result?.erros_colaboradores,

    payload?.resultado?.linhas_com_erro,
    payload?.resultado?.linhasComErro,
    payload?.resultado?.validation_errors,
    payload?.resultado?.erros_condominios,
    payload?.resultado?.erros_funcionarios,
    payload?.resultado?.erros_colaboradores,

    payload?.response?.linhas_com_erro,
    payload?.response?.linhasComErro,
    payload?.response?.validation_errors,
    payload?.response?.erros_condominios,
    payload?.response?.erros_funcionarios,
    payload?.response?.erros_colaboradores,

    payload?.data_to_backend?.linhas_com_erro,
    payload?.data_to_backend?.linhasComErro,
    payload?.data_to_backend?.validation_errors,
    payload?.data_to_backend?.erros_condominios,
    payload?.data_to_backend?.erros_funcionarios,
    payload?.data_to_backend?.erros_colaboradores,

    payload?.detail?.linhas_com_erro,
    payload?.detail?.linhasComErro,
    payload?.detail?.validation_errors,
    payload?.detail?.erros_condominios,
    payload?.detail?.erros_funcionarios,
    payload?.detail?.erros_colaboradores,

    payload?.message?.linhas_com_erro,
    payload?.message?.linhasComErro,
    payload?.message?.validation_errors,
    payload?.message?.erros_condominios,
    payload?.message?.erros_funcionarios,
    payload?.message?.erros_colaboradores,
  ]

  const errosEstruturados = listasEstruturadas.flatMap(
    transformarErrosEmLista
  )

  if (errosEstruturados.length > 0) {
    return errosEstruturados.map((erro, index) =>
      normalizarErroImportacao(erro, index)
    )
  }

  /*
   * Só usa errors/erros gerais quando não houver
   * nenhum erro estruturado.
   */
  const listasGerais = [
    payload?.errors,
    payload?.erros,

    payload?.data?.errors,
    payload?.data?.erros,

    payload?.dados?.errors,
    payload?.dados?.erros,

    payload?.result?.errors,
    payload?.result?.erros,

    payload?.resultado?.errors,
    payload?.resultado?.erros,

    payload?.response?.errors,
    payload?.response?.erros,

    payload?.data_to_backend?.errors,
    payload?.data_to_backend?.erros,

    payload?.detail?.errors,
    payload?.detail?.erros,

    payload?.message?.errors,
    payload?.message?.erros,
  ]

  const errosGerais = listasGerais.flatMap((lista) => {
    if (!lista) return []

    if (Array.isArray(lista)) {
      return lista.map((erro) => {
        if (typeof erro === 'string') {
          return {
            linha: '-',
            tipo_erro: 'ERRO_PROCESSAMENTO',
            mensagem: erro,
          }
        }

        return erro
      })
    }

    return transformarErrosEmLista(lista)
  })

  if (errosGerais.length > 0) {
    return errosGerais.map((erro, index) =>
      normalizarErroImportacao(erro, index)
    )
  }

  if (payload?.detail && typeof payload.detail === 'object') {
    const errosDetail = transformarErrosEmLista(payload.detail)

    if (errosDetail.length > 0) {
      return errosDetail.map((erro, index) =>
        normalizarErroImportacao(erro, index)
      )
    }
  }

  const mensagem =
    getErrorMessageFromPayload(payload?.detail) ||
    getErrorMessageFromPayload(payload?.message) ||
    getErrorMessageFromPayload(payload?.error) ||
    getErrorMessageFromPayload(payload?.erro)

  if (!mensagem) return []

  if (
    isMensagemSucessoImportacao(mensagem) &&
    !incluirMensagensGerais
  ) {
    return []
  }

  const textoMensagem = normalizeText(mensagem)

  const temIndicativoDeErro =
    textoMensagem.includes('ERRO') ||
    textoMensagem.includes('FALHA') ||
    textoMensagem.includes('INVALID') ||
    textoMensagem.includes('REJEIT') ||
    textoMensagem.includes('NAO FOI POSSIVEL') ||
    textoMensagem.includes('OBRIGATORIO') ||
    textoMensagem.includes('AUSENTE') ||
    textoMensagem.includes('INCORRETA')

  if (!temIndicativoDeErro && !incluirMensagensGerais) {
    return []
  }

  return [
    normalizarErroImportacao({
      linha: '-',
      tipo_erro: 'ERRO_PROCESSAMENTO',
      mensagem,
      dados: payload,
    }),
  ]
}

function getMovimentacoesBackend(data) {
  return (
    data?.data_to_backend?.movimentacoes_detalhada ||
    data?.movimentacoes_detalhada ||
    data?.movimentacoes ||
    []
  )
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}


const ADMINISTRADORA_BENEDETTI_NOME = 'M BENEDETTI ASSESSORIA CONDOMINIAL LTDA'

const SIGLA_VALE_COMBUSTIVEL = 'VBV'
const CODIGO_VALE_COMBUSTIVEL = 28
const DESCRICAO_VALE_COMBUSTIVEL = 'Auto'
const NOME_VALE_COMBUSTIVEL = 'Vale Combustível'

function compactText(value) {
  return normalizeText(value).replace(/[^A-Z0-9]/g, '')
}

function isAdministradoraBenedetti(user = {}, payload = {}, data = {}, lote = {}) {
  const textosPossiveis = [
    user?.nome_administradora,
    user?.administradora_nome,
    user?.razao_social,
    user?.nome_fantasia,
    user?.administradora?.nome,
    user?.administradora?.razao_social,
    user?.administradora?.nome_fantasia,

    payload?.nome_administradora,
    payload?.administradora_nome,
    payload?.razao_social,
    payload?.nome_fantasia,
    payload?.administradora?.nome,
    payload?.administradora?.razao_social,
    payload?.administradora?.nome_fantasia,

    data?.nome_administradora,
    data?.administradora_nome,
    data?.razao_social,
    data?.nome_fantasia,
    data?.administradora?.nome,
    data?.administradora?.razao_social,
    data?.administradora?.nome_fantasia,

    data?.file_name,
    data?.filename,
    data?.nome_arquivo,
    data?.arquivo,
    data?.original_filename,

    lote?.arquivo,
  ]

  const matchExato = textosPossiveis.some(
    (texto) =>
      normalizeText(texto) === normalizeText(ADMINISTRADORA_BENEDETTI_NOME)
  )

  const matchParcial = textosPossiveis.some((texto) => {
    const compactado = compactText(texto)

    return (
      compactado.includes('MBENEDETTI') ||
      compactado.includes('BENEDETTI')
    )
  })

  return matchExato || matchParcial
}

function adaptarMovimentacoesParaValeCombustivel(movimentacoes = []) {
  return movimentacoes.map((item) => ({
    ...item,

    sigla: SIGLA_VALE_COMBUSTIVEL,
    sigla_produto: SIGLA_VALE_COMBUSTIVEL,
    codigo_produto: CODIGO_VALE_COMBUSTIVEL,
    produto_codigo: CODIGO_VALE_COMBUSTIVEL,
    cod_produto: CODIGO_VALE_COMBUSTIVEL,
    codigo: CODIGO_VALE_COMBUSTIVEL,

    nome_produto: NOME_VALE_COMBUSTIVEL,
    produto_nome: NOME_VALE_COMBUSTIVEL,
    produto: NOME_VALE_COMBUSTIVEL,
    nome_beneficio: NOME_VALE_COMBUSTIVEL,
    beneficio_nome: NOME_VALE_COMBUSTIVEL,
    beneficio: NOME_VALE_COMBUSTIVEL,
    descricao_produto: DESCRICAO_VALE_COMBUSTIVEL,
    descricao: DESCRICAO_VALE_COMBUSTIVEL,

    beneficio_alterado_frontend: true,
    beneficio_alterado_de: getNomeProduto(item) || 'Alimentação',
    beneficio_alterado_para: NOME_VALE_COMBUSTIVEL,
    beneficio_alterado_para_sigla: SIGLA_VALE_COMBUSTIVEL,
    beneficio_alterado_para_codigo: CODIGO_VALE_COMBUSTIVEL,
    beneficio_alterado_para_descricao: DESCRICAO_VALE_COMBUSTIVEL,
  }))
}

function adaptarPayloadBenedettiParaValeCombustivel(payload = {}) {
  return {
    ...payload,
    regra_especial_benedetti: true,
    beneficio_alterado_para: NOME_VALE_COMBUSTIVEL,
    beneficio_alterado_para_sigla: SIGLA_VALE_COMBUSTIVEL,
    beneficio_alterado_para_codigo: CODIGO_VALE_COMBUSTIVEL,
    beneficio_alterado_para_descricao: DESCRICAO_VALE_COMBUSTIVEL,
    movimentacoes_detalhada: adaptarMovimentacoesParaValeCombustivel(
      payload.movimentacoes_detalhada || []
    ),
  }
}

function adaptarRowsParaValeCombustivel(rows = []) {
  return rows.map((row) => ({
    ...row,
    beneficios: Array.isArray(row?.beneficios)
      ? row.beneficios.map((beneficio) => ({
        ...beneficio,
        sigla: SIGLA_VALE_COMBUSTIVEL,
        sigla_produto: SIGLA_VALE_COMBUSTIVEL,
        codigo: CODIGO_VALE_COMBUSTIVEL,
        codigo_produto: CODIGO_VALE_COMBUSTIVEL,
        produto_codigo: CODIGO_VALE_COMBUSTIVEL,
        cod_produto: CODIGO_VALE_COMBUSTIVEL,
        nome: NOME_VALE_COMBUSTIVEL,
        nome_produto: NOME_VALE_COMBUSTIVEL,
        produto_nome: NOME_VALE_COMBUSTIVEL,
        produto: NOME_VALE_COMBUSTIVEL,
        nome_beneficio: NOME_VALE_COMBUSTIVEL,
        beneficio_nome: NOME_VALE_COMBUSTIVEL,
        beneficio: NOME_VALE_COMBUSTIVEL,
        descricao_produto: DESCRICAO_VALE_COMBUSTIVEL,
        descricao: DESCRICAO_VALE_COMBUSTIVEL,
        beneficio_alterado_frontend: true,
        beneficio_alterado_para_sigla: SIGLA_VALE_COMBUSTIVEL,
        beneficio_alterado_para_codigo: CODIGO_VALE_COMBUSTIVEL,
        beneficio_alterado_para_descricao: DESCRICAO_VALE_COMBUSTIVEL,
      }))
      : row?.beneficios,
  }))
}

function adaptarDataParaValeCombustivel(dataAtual = {}) {
  return {
    ...dataAtual,
    regra_especial_benedetti: true,
    beneficio_alterado_para: NOME_VALE_COMBUSTIVEL,
    beneficio_alterado_para_sigla: SIGLA_VALE_COMBUSTIVEL,
    beneficio_alterado_para_codigo: CODIGO_VALE_COMBUSTIVEL,
    beneficio_alterado_para_descricao: DESCRICAO_VALE_COMBUSTIVEL,
    movimentacoes_detalhada: adaptarMovimentacoesParaValeCombustivel(
      dataAtual?.movimentacoes_detalhada || []
    ),
    data_to_backend: dataAtual?.data_to_backend
      ? {
        ...dataAtual.data_to_backend,
        regra_especial_benedetti: true,
        beneficio_alterado_para: NOME_VALE_COMBUSTIVEL,
        beneficio_alterado_para_sigla: SIGLA_VALE_COMBUSTIVEL,
        beneficio_alterado_para_codigo: CODIGO_VALE_COMBUSTIVEL,
        beneficio_alterado_para_descricao: DESCRICAO_VALE_COMBUSTIVEL,
        movimentacoes_detalhada: adaptarMovimentacoesParaValeCombustivel(
          dataAtual.data_to_backend?.movimentacoes_detalhada || []
        ),
      }
      : dataAtual?.data_to_backend,
  }
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

function isValidCPF(value) {
  const cpf = onlyDigits(value)

  if (!cpf || cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i)
  }

  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== Number(cpf[9])) return false

  sum = 0
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0

  return remainder === Number(cpf[10])
}

function getNomeProduto(item) {
  return (
    item?.nome_produto ||
    item?.produto_nome ||
    item?.produto ||
    item?.nome_beneficio ||
    item?.beneficio_nome ||
    item?.beneficio ||
    item?.descricao_produto ||
    item?.descricao ||
    ''
  )
}

function getCodigoProduto(item) {
  return String(
    item?.codigo_produto ||
    item?.produto_codigo ||
    item?.cod_produto ||
    item?.codigo ||
    ''
  ).trim()
}

function getValorProduto(item) {
  return Number(
    item?.valor_recarga_bene ||
    item?.valor_total ||
    item?.valor ||
    item?.valor_unitario ||
    0
  )
}

function getNomeMov(item) {
  return item?.nome_funcionario || item?.nome_func || item?.colaborador || item?.nome || item?.funcionario || item?.nome_funcionário || ''
}

function getCondominioMov(item) {
  return item?.condominio || item?.nome_condominio || item?.condominio_nome || item?.NomeCondominio || ''
}

function getCpfMov(item) {
  return String(item?.cpf || item?.cpf_func || item?.cpf_funcionario || item?.CPF || '').trim()
}

function buildBenefitsIndexes(movimentacoes = []) {
  const byCondominioNomeCpf = new Map()
  const byNomeCpf = new Map()
  const byCondominioNome = new Map()

  movimentacoes.forEach((item) => {
    const nome = normalizeText(getNomeMov(item))
    const condominio = normalizeText(getCondominioMov(item))
    const cpf = onlyDigits(getCpfMov(item))

    const beneficio = {
      codigo: getCodigoProduto(item),
      nome: getNomeProduto(item),
      valor: getValorProduto(item),
    }

    if (!beneficio.nome) return

    const keyCondominioNomeCpf = `${condominio}::${nome}::${cpf}`
    const keyNomeCpf = `${nome}::${cpf}`
    const keyCondominioNome = `${condominio}::${nome}`

    if (cpf) {
      if (!byCondominioNomeCpf.has(keyCondominioNomeCpf)) {
        byCondominioNomeCpf.set(keyCondominioNomeCpf, [])
      }

      byCondominioNomeCpf.get(keyCondominioNomeCpf).push(beneficio)

      if (!byNomeCpf.has(keyNomeCpf)) {
        byNomeCpf.set(keyNomeCpf, [])
      }

      byNomeCpf.get(keyNomeCpf).push(beneficio)
    }

    if (!byCondominioNome.has(keyCondominioNome)) {
      byCondominioNome.set(keyCondominioNome, [])
    }

    byCondominioNome.get(keyCondominioNome).push(beneficio)
  })

  return {
    byCondominioNomeCpf,
    byNomeCpf,
    byCondominioNome,
  }
}

function enrichRowsWithBenefits(rows = [], movimentacoes = []) {
  const indexes = buildBenefitsIndexes(movimentacoes)

  return rows.map((row) => {
    const nome = normalizeText(getNomeColaborador(row))
    const condominio = normalizeText(getCondominio(row))
    const cpf = onlyDigits(getCpf(row))

    const keyCondominioNomeCpf = `${condominio}::${nome}::${cpf}`
    const keyNomeCpf = `${nome}::${cpf}`
    const keyCondominioNome = `${condominio}::${nome}`

    const beneficios =
      (cpf && indexes.byCondominioNomeCpf.get(keyCondominioNomeCpf)) ||
      (cpf && indexes.byNomeCpf.get(keyNomeCpf)) ||
      indexes.byCondominioNome.get(keyCondominioNome) ||
      []

    return {
      ...row,
      beneficios,
    }
  })
}

function getQuantidadeDias(row) {
  return Number(row?.quantidade_dias ||
    row?.quantidade || row?.dias || row?.dias_trabalhados
    || row?.quantidadeDias || 0)
}

function getRowValidation(row, regraValor = null, isVT = false) {
  const erros = []

  const nome = getNomeColaborador(row)
  const condominio = getCondominio(row)
  const cpf = getCpf(row)
  const valor = getValorRow(row)

  if (!normalizeText(nome)) {
    erros.push('Nome do colaborador não informado')
  }

  if (!normalizeText(condominio)) {
    erros.push('Condomínio não informado')
  }

  if (!cpf) {
    erros.push('CPF não informado')
  } else if (!isValidCPF(cpf)) {
    erros.push('CPF inválido')
  }

  if (Number(valor) <= 0) {
    erros.push('Valor inválido')
  }

  let bloqueadoPorValor = false

  // SÓ APLICA REGRA DE VALOR SE NÃO FOR VT
  if (!isVT) {
    const limiteAtivo =
      regraValor?.ativo === true &&
      regraValor?.bloquear_acima_limite !== false &&
      Number(regraValor?.valor_limite) > 0

    bloqueadoPorValor = limiteAtivo && Number(valor) > Number(regraValor.valor_limite)

    if (bloqueadoPorValor) {
      erros.push(`Valor acima de ${formatCurrency(regraValor.valor_limite)}`)
    }
  }

  return {
    erros,
    bloqueadoPorValor,
    bloqueado: erros.length > 0,
  }
}

function buildPreviewRowsFromMovimentacoes(movimentacoes = []) {
  const mapa = new Map()

  movimentacoes.forEach((item) => {
    const nome = getNomeColaborador(item)
    const condominio = getCondominio(item)
    const cpf = getCpf(item)
    const key = cpf ? `${condominio}::${nome}::${cpf}` : `${condominio}::${nome}`

    const valor = getValorRow(item)
    const quantidadeDias = getQuantidadeDias(item)

    if (!mapa.has(key)) {
      mapa.set(key, {
        ...item,
        condominio,
        nome_funcionario: nome,
        cpf_funcionario: cpf,
        valor_total: 0,
        quantidade_dias: 0,
      })
    }

    const atual = mapa.get(key)

    atual.valor_total += Number(valor || 0)
    atual.quantidade_dias += Number(quantidadeDias || 0)

    mapa.set(key, atual)
  })

  return Array.from(mapa.values())
}


function parseDateInput(value) {
  if (!value) return null

  const [year, month, day] = String(value).split('-').map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

function formatDateInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDaysToDateInput(value, days) {
  const date = parseDateInput(value)
  if (!date) return ''

  let remaining = Number(days || 0)
  while (remaining > 0) {
    date.setDate(date.getDate() + 1)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      remaining--
    }
  }

  return formatDateInput(date)
}

function subtractDaysFromDateInput(value, days) {
  const date = parseDateInput(value)
  if (!date) return ''

  let remaining = Number(days || 0)
  while (remaining > 0) {
    date.setDate(date.getDate() - 1)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      remaining--
    }
  }

  return formatDateInput(date)
}

function subtractBusinessDays(value, businessDays) {
  const date = parseDateInput(value)
  if (!date || !businessDays) return value || ''

  let remaining = Number(businessDays)
  while (remaining > 0) {
    date.setDate(date.getDate() - 1)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining--
    }
  }
  return formatDateInput(date)
}

function addBusinessDays(value, businessDays) {
  const date = parseDateInput(value)
  if (!date || !businessDays) return value || ''

  let remaining = Number(businessDays)
  while (remaining > 0) {
    date.setDate(date.getDate() + 1)
    const dayOfWeek = date.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining--
    }
  }
  return formatDateInput(date)
}

function isWeekend(value) {
  const date = parseDateInput(value)
  if (!date) return false
  const day = date.getDay()
  return day === 0 || day === 6
}

function getWednesdayBeforeWeekend(dateStr) {
  const date = parseDateInput(dateStr)
  if (!date) return ''

  const dayOfWeek = date.getDay()
  if (dayOfWeek !== 0 && dayOfWeek !== 6) return ''

  const daysBack = dayOfWeek === 6 ? 3 : 4
  date.setDate(date.getDate() - daysBack)

  return formatDateInput(date)
}

function calcularVencimentoParaRecebimento(recebimento, dMais) {
  if (!recebimento) return ''

  const wednesdayBefore = getWednesdayBeforeWeekend(recebimento)

  if (wednesdayBefore) {
    const vencimentoPelaRegra = subtractBusinessDays(recebimento, dMais)
    const wednesdayDate = parseDateInput(wednesdayBefore)
    const vencimentoRegraDate = parseDateInput(vencimentoPelaRegra)

    if (vencimentoRegraDate && wednesdayDate && vencimentoRegraDate.getTime() < wednesdayDate.getTime()) {
      return vencimentoPelaRegra
    }

    return wednesdayBefore
  }

  return subtractBusinessDays(recebimento, dMais)
}

function isAfterDateInput(dateA, dateB) {
  const parsedA = parseDateInput(dateA)
  const parsedB = parseDateInput(dateB)

  if (!parsedA || !parsedB) return false

  return parsedA.getTime() > parsedB.getTime()
}

export default function Importacao() {
  const [data, setData] = useState(null)
  const [validationVersion, setValidationVersion] = useState(0)
  const [filterOnlyErrors, setFilterOnlyErrors] = useState(false)
  const [filterOnlyBlocked, setFilterOnlyBlocked] = useState(false)
  const [buscaNomePreview, setBuscaNomePreview] = useState('')
  const [errosModalOpen, setErrosModalOpen] = useState(false)

  const { loading, startLoading, stopLoading, updateProgress } = useLoading();

  const { user } = useAuth()

  const [lote, setLote] = useState({
    id: null,
    arquivo: null,
    tipo: null,
    rows: [],
    excluidosPorColab: new Set(),
  })

  const [modalOpen, setModalOpen] = useState(false)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsTitle, setDetailsTitle] = useState('')
  const [detailsBenefits, setDetailsBenefits] = useState([])
  const [detailsRowKey, setDetailsRowKey] = useState(null)
  const [editingBenefitIndex, setEditingBenefitIndex] = useState(null)
  const [editBenefitValue, setEditBenefitValue] = useState('')

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState(null)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [enviandoLote, setEnviandoLote] = useState(false)
  const [modalBenedettiOpen, setModalBenedettiOpen] = useState(false)
  const [benedettiPendente, setBenedettiPendente] = useState(null)
  const [benedettiConvertido, setBenedettiConvertido] = useState(false)

  const [regraValor, setRegraValor] = useState(null)
  const [loadingRegraValor, setLoadingRegraValor] = useState(false)
  const [modalRegraValorOpen, setModalRegraValorOpen] = useState(false)
  const [salvandoRegraValor, setSalvandoRegraValor] = useState(false)

  const [formRegraValor, setFormRegraValor] = useState({
    ativo: true,
    valor_limite: '',
  })

  const [reviewData, setReviewData] = useState({
    totalFuncionarios: 0,
    totalMovimentacoes: 0,
    valorTotalBeneficios: 0,
    periodoInicio: '',
    periodoFim: '',
    competenciaMes: '',
    competenciaAno: '',
    vencimento: '',
    recebimentoBeneficio: '',
  })

  const [formEnvio, setFormEnvio] = useState({
    periodoInicio: '',
    periodoFim: '',
    competenciaMes: '',
    competenciaAno: String(new Date().getFullYear()),
    vencimento: '',
    recebimentoBeneficio: '',
  })

  const [campoDataReferenciaVT, setCampoDataReferenciaVT] = useState(null)

  const carregarRegraValor = async () => {
    const administradoraId = user?.administradora_ativa_id || user?.administradora_id || user?.administradora_ativa;

    if (!administradoraId) return

    try {
      setLoadingRegraValor(true)

      const response = await buscarRegraValorAdministradora(administradoraId)
      console.log('Regra de valor carregada:', response)
      const regra = Array.isArray(response) ? response[0] || null : response || null

      setRegraValor(regra)

      setFormRegraValor({
        ativo: regra?.ativo ?? true,
        valor_limite: regra?.valor_limite ? String(regra.valor_limite) : '',
      })
    } catch (error) {
      console.error('Erro ao carregar regra de valor:', error)
      setRegraValor(null)
      setFormRegraValor({
        ativo: true,
        valor_limite: '',
      })
    } finally {
      setLoadingRegraValor(false)
    }
  }

  useEffect(() => {
    carregarRegraValor()
  }, [user?.administradora_ativa_id, user?.administradora_id, user?.administradora_ativa])

  const abrirModalRegraValor = async () => {
    await carregarRegraValor()
    setModalRegraValorOpen(true)
  }

  const salvarRegraValor = async () => {
    const administradoraId = user?.administradora_ativa_id || user?.administradora_id || user?.administradora_ativa;
    const valorLimite = Number(formRegraValor.valor_limite)

    if (!administradoraId) {
      toast.error('Administradora não encontrada.')
      return
    }

    if (formRegraValor.ativo && (!valorLimite || Number.isNaN(valorLimite) || valorLimite <= 0)) {
      toast.warning('Informe um valor limite válido.')
      return
    }

    try {
      setSalvandoRegraValor(true)

      const payload = {
        administradora_id: administradoraId,
        ativo: formRegraValor.ativo,
        valor_limite: formRegraValor.ativo ? valorLimite : null,
        bloquear_acima_limite: formRegraValor.ativo,
      }

      const response = regraValor?.id
        ? await atualizarRegraValorAdministradora(administradoraId, regraValor.id, payload)
        : await criarRegraValorAdministradora(administradoraId, payload)

      const regraAtualizada = response || {
        ...payload,
        id: regraValor?.id,
      }

      setRegraValor(regraAtualizada)
      setFormRegraValor({
        ativo: regraAtualizada?.ativo ?? true,
        valor_limite: regraAtualizada?.valor_limite ? String(regraAtualizada.valor_limite) : '',
      })

      setModalRegraValorOpen(false)
      toast.success('Regra de valor salva com sucesso.')
      setValidationVersion(prev => prev + 1)
    } catch (error) {
      console.error('Erro ao salvar regra de valor:', error)
      toast.error(error.message || 'Erro ao salvar regra de valor.')
    } finally {
      setSalvandoRegraValor(false)
    }
  }

  const isVTResponse = (response) => {
    if (!response) return false;

    if (response.dados_validados !== undefined && response.tipo_processamento === 'VT') return true;
    if (response.tipo_processamento === 'VT') return true;
    if (response.summary && response.summary.valor_total_vt !== undefined) return true;
    if (response.summary && response.summary.total_dias_trabalhados !== undefined) return true;
    if (response.vt_validation !== undefined) return true;
    if (response.source === 'vt_upload') return true;

    return false;
  }

  async function handleResult({ file, result: uploadResult }) {
    try {

      await carregarRegraValor()

      let response = uploadResult;

      if (!response) {
        const isVTByFilename = file.name.toLowerCase().includes('vt') ||
          file.name.toLowerCase().includes('vale transporte') ||
          file.name.toLowerCase().includes('vale_transporte');

        if (isVTByFilename) {
          response = await vtService.uploadVTFile(file, user?.administradora_ativa_id || user?.administradora_id || user?.administradora_ativa);
        } else {
          response = await uploadService.uploadFile(file, user?.administradora_ativa_id || user?.administradora_id || user?.administradora_ativa);
        }

      } else {
        // console.log("Usando resultado pré-processado:", response);
      }

      const isVT = isVTResponse(response);
      // console.log("isVT detectado:", isVT);

      const tipoFinal = isVT ? 'vale_transporte' : (file.name.toLowerCase().includes('fat') ? 'faturamento' : 'compra');

      // console.log("Tipo final detectado:", tipoFinal);

      if (tipoFinal === 'vale_transporte') {
        // console.log("Processando como Vale Transporte...");

        let vtData = response;

        if (vtData && !vtData.dados_validados && vtData.summary) {
          const movimentacoes = getMovimentacoesBackend(vtData);
          if (movimentacoes.length > 0) {
            vtData = {
              ...vtData,
              dados_validados: movimentacoes,
              tipo_processamento: 'VT'
            };
          }
        }

        const movimentacoes = vtData?.dados_validados || [];
        // console.log("Movimentações VT:", movimentacoes);

        let previewRows = vtData?.summary?.total_por_beneficiario || [];

        if (previewRows.length === 0 && movimentacoes.length > 0) {
          previewRows = buildPreviewRowsFromMovimentacoes(movimentacoes);
        }

        // console.log("Preview rows do VT:", previewRows);

        const parsed = previewRows.map(row => ({
          ...row,
          beneficios: movimentacoes
            .filter(m => getCpf(m) === getCpf(row))
            .map(m => ({
              codigo: m.codigo_produto || 'VT',
              nome: m.nome_produto || 'Vale Transporte',
              valor: m.valor_beneficio_total || getValorRow(m)
            }))
        }))
        // console.log("Dados enriquecidos:", parsed);

        const semPreview = !Array.isArray(parsed) || parsed.length === 0

        if (semPreview) {
          const errosInternosVT = extrairErrosImportacao(vtData)
          if (errosInternosVT.length > 0) {
            setData(vtData)
            setErrosModalOpen(true)
          }
          return { success: false }
        }

        setLote({
          id: 'VT-' + (vtData?.file_upload_id || Date.now()),
          arquivo: file.name,
          tipo: 'vale_transporte',
          rows: parsed,
          excluidosPorColab: new Set(),
        })

        setData(vtData)

        setDetailsOpen(false)
        setDetailsTitle('')
        setDetailsBenefits([])
        setDetailsRowKey(null)
        setEditingBenefitIndex(null)
        setEditBenefitValue('')
        setConfirmDeleteOpen(false)
        setColaboradorParaExcluir(null)
        setReviewOpen(false)
        setFilterOnlyErrors(false)
        setFilterOnlyBlocked(false) // RESETA FILTRO DE BLOQUEIO
        setBuscaNomePreview('')

        const temErrosVT = extrairErrosImportacao(vtData).length > 0

        if (temErrosVT) {
          setErrosModalOpen(true)
        }

        return { success: !temErrosVT }
      }

      // console.log("Processando como Benefícios...");
      // console.log("Preview rows:", response?.summary?.total_por_beneficiario);
      // console.log("Movimentações:", getMovimentacoesBackend(response));

      const id = 'IMP-' + (response?.file_upload_id || Date.now())
      const tipo = tipoFinal

      const movimentacoes = getMovimentacoesBackend(response)

      const previewRowsBackend =
        response?.summary?.total_por_beneficiario ||
        response?.data_to_backend?.summary?.total_por_beneficiario ||
        response?.total_por_beneficiario ||
        response?.resumo ||
        response?.preview ||
        []

      let previewRows =
        Array.isArray(previewRowsBackend) && previewRowsBackend.length > 0
          ? previewRowsBackend
          : Array.isArray(movimentacoes) && movimentacoes.length > 0
            ? buildPreviewRowsFromMovimentacoes(movimentacoes)
            : [];

      if (previewRows.length === 0 && movimentacoes.length > 0) {
        // console.warn("Nenhum preview encontrado, mas há movimentações. Usando fallback manual.");
        previewRows = buildPreviewRowsFromMovimentacoes(movimentacoes);
        // console.log("Preview manual construído:", previewRows);
      }

      const parsed = enrichRowsWithBenefits(previewRows, movimentacoes)

      const semPreview = !Array.isArray(parsed) || parsed.length === 0

      if (semPreview) {
        setData(response)

        setLote({
          id: null,
          arquivo: null,
          tipo: null,
          rows: [],
          excluidosPorColab: new Set(),
        })

        const errosInternos = extrairErrosImportacao(response)
        if (errosInternos.length > 0) {
          setErrosModalOpen(true)
        }

        return {
          success: false,
        }
      }

      setData(response)

      const novoLote = {
        id,
        arquivo: file.name,
        tipo,
        rows: parsed,
        excluidosPorColab: new Set(),
      }

      setLote(novoLote)

      const devePerguntarBenedetti = isAdministradoraBenedetti(
        user,
        response?.data_to_backend || response,
        response,
        novoLote
      )

      console.log('Checagem Benedetti após importação:', {
        devePerguntarBenedetti,
        arquivo: file.name,
        user,
        response,
      })

      if (devePerguntarBenedetti && tipo !== 'vale_transporte') {
        setBenedettiPendente({
          data: response,
          lote: novoLote,
        })
        setBenedettiConvertido(false)
        setModalBenedettiOpen(true)
      }

      setValidationVersion(prev => prev + 1)
      setFilterOnlyErrors(false)
      setFilterOnlyBlocked(false)
      setBuscaNomePreview('')

      setDetailsOpen(false)
      setDetailsTitle('')
      setDetailsBenefits([])
      setDetailsRowKey(null)
      setEditingBenefitIndex(null)
      setEditBenefitValue('')
      setConfirmDeleteOpen(false)
      setColaboradorParaExcluir(null)
      setReviewOpen(false)

      setReviewData({
        totalFuncionarios: 0,
        totalMovimentacoes: 0,
        valorTotalBeneficios: 0,
        periodoInicio: '',
        periodoFim: '',
        competenciaMes: '',
        competenciaAno: '',
        vencimento: '',
        recebimentoBeneficio: '',
      })

      const temErros = extrairErrosImportacao(response).length > 0

      if (temErros) {
        setErrosModalOpen(true)
      }

      return {
        success: !temErros,
      }
    } catch (error) {
      console.error('Erro no processamento da importação:', error)

      const responseData = error.response?.data
      const errosNormalizados = extrairErrosImportacao(responseData)

      const errorMessage =
        getErrorMessageFromPayload(responseData?.detail) ||
        getErrorMessageFromPayload(responseData?.error) ||
        getErrorMessageFromPayload(responseData?.message) ||
        getErrorMessageFromPayload(responseData?.errors) ||
        (typeof responseData === 'string' ? responseData : null) ||
        (error.message && error.message.includes('API Error')
          ? error.message.split('API Error: ')[1]
          : null) ||
        error.message ||
        'Erro ao processar importação.'

      const errosParaTela =
        errosNormalizados.length > 0
          ? errosNormalizados
          : [
            {
              linha: '-',
              tipo_erro: 'ERRO_PROCESSAMENTO',
              mensagem: errorMessage,
              dados: responseData || {},
            },
          ]

      setData((prev) => ({
        ...(prev || {}),
        linhas_com_erro: errosParaTela,
      }))

      setLote((prev) => ({
        ...prev,
        id: prev?.id || 'ERRO-' + Date.now(),
        arquivo: file?.name || prev?.arquivo || 'Arquivo importado',
        tipo: prev?.tipo || 'importacao',
        rows: prev?.rows || [],
        excluidosPorColab: prev?.excluidosPorColab || new Set(),
      }))

      setErrosModalOpen(true)

      toast.error('Encontramos erro(s) na planilha. Veja os detalhes em tela.', {
        autoClose: false,
      })

      return {
        success: false,
      }
    }
  }

  const rowsAtivas = useMemo(() => {
    if (!lote?.rows?.length) return []
    if (!lote.excluidosPorColab?.size) return lote.rows

    return lote.rows.filter((r) => !lote.excluidosPorColab.has(getNomeColaborador(r)))
  }, [lote])

  const isValeTransporte = lote?.tipo === 'vale_transporte'

  useEffect(() => {
    setCampoDataReferenciaVT(null)

    setFormEnvio((prev) => ({
      ...prev,
      vencimento: '',
      recebimentoBeneficio: '',
    }))
  }, [lote.id, lote.tipo])

  const vencimentoCalculadoAutomaticamente =
    campoDataReferenciaVT === 'recebimento'

  const recebimentoCalculadoAutomaticamente =
    campoDataReferenciaVT === 'vencimento'

  const getDatasEnvioNormalizadas = () => {
    const recebimento = formEnvio.recebimentoBeneficio
    const vencimento = formEnvio.vencimento
    const dias = isValeTransporte ? 8 : (regraValor?.d_mais ?? 1)

    if (isValeTransporte) {
      if (campoDataReferenciaVT === 'vencimento' && vencimento) {
        return {
          recebimentoBeneficio: addDaysToDateInput(vencimento, dias),
          vencimento,
        }
      }
      if (recebimento) {
        return {
          recebimentoBeneficio: recebimento,
          vencimento: subtractDaysFromDateInput(recebimento, dias),
        }
      }
      if (vencimento) {
        return {
          recebimentoBeneficio: addDaysToDateInput(vencimento, dias),
          vencimento,
        }
      }
    } else {
      if (campoDataReferenciaVT === 'vencimento' && vencimento) {
        return {
          recebimentoBeneficio: addBusinessDays(vencimento, dias),
          vencimento,
        }
      }
      if (recebimento) {
        return {
          recebimentoBeneficio: recebimento,
          vencimento: calcularVencimentoParaRecebimento(recebimento, dias),
        }
      }
      if (vencimento) {
        return {
          recebimentoBeneficio: addBusinessDays(vencimento, dias),
          vencimento,
        }
      }
    }

    return {
      recebimentoBeneficio: '',
      vencimento: '',
    }
  }

  const sincronizarDatasEnvio = () => {
    const datas = getDatasEnvioNormalizadas()

    setFormEnvio((prev) => ({
      ...prev,
      recebimentoBeneficio: datas.recebimentoBeneficio,
      vencimento: datas.vencimento,
    }))

    return datas
  }

  const handleRecebimentoBeneficioChange = (value) => {
    if (isValeTransporte) {
      setCampoDataReferenciaVT(value ? 'recebimento' : null)

      setFormEnvio((prev) => ({
        ...prev,
        recebimentoBeneficio: value,
        vencimento: value ? subtractDaysFromDateInput(value, 8) : '',
      }))

      return
    }

    setCampoDataReferenciaVT(value ? 'recebimento' : null)

    const dias = regraValor?.d_mais ?? 1
    const vencimentoCalculado = value ? calcularVencimentoParaRecebimento(value, dias) : ''

    setFormEnvio((prev) => ({
      ...prev,
      recebimentoBeneficio: value,
      vencimento: vencimentoCalculado,
    }))
  }

  const handleVencimentoChange = (value) => {
    const dias = isValeTransporte ? 8 : (regraValor?.d_mais ?? 1)

    setCampoDataReferenciaVT(value ? 'vencimento' : null)

    if (isValeTransporte) {
      setFormEnvio((prev) => ({
        ...prev,
        vencimento: value,
        recebimentoBeneficio: value ? addDaysToDateInput(value, dias) : '',
      }))
    } else {
      setFormEnvio((prev) => ({
        ...prev,
        vencimento: value,
        recebimentoBeneficio: value ? addBusinessDays(value, dias) : '',
      }))
    }
  }

  const limparDatasBeneficio = () => {
    setCampoDataReferenciaVT(null)

    setFormEnvio((prev) => ({
      ...prev,
      vencimento: '',
      recebimentoBeneficio: '',
    }))
  }

  const dMais = isValeTransporte ? 8 : (regraValor?.d_mais ?? 1)

  const vencimentoMinimo = formEnvio.recebimentoBeneficio
    ? calcularVencimentoParaRecebimento(formEnvio.recebimentoBeneficio, dMais)
    : ''

  const recebimentoMaximo = formEnvio.vencimento
    ? isValeTransporte
      ? addDaysToDateInput(formEnvio.vencimento, 8)
      : addDaysToDateInput(formEnvio.vencimento, dMais + 4)
    : ''

  const minDateMesAtual = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

  const validarDatasEnvio = () => {
    const datas = sincronizarDatasEnvio()

    if (isValeTransporte) {
      if (!datas.recebimentoBeneficio || !datas.vencimento) {
        toast.warning('Informe a data de recebimento do benefício ou o vencimento.')
        return false
      }

      return true
    }

    if (!datas.recebimentoBeneficio) {
      toast.warning('Informe a data de recebimento do benefício.')
      return false
    }

    return true
  }


  const linhasComErroBackend = useMemo(() => {
    const errosNormalizados = extrairErrosImportacao(data)

    if (!Array.isArray(errosNormalizados) || errosNormalizados.length === 0) {
      return []
    }

    const limiteAtivo = regraValor?.ativo === true && Number(regraValor?.valor_limite) > 0
    const valorLimite = Number(regraValor?.valor_limite)

    return errosNormalizados
      .filter((erro) => {
        if (!isValeTransporte && erro.tipo_erro === 'VALOR_EXCEDIDO' && limiteAtivo && erro.dados) {
          const rowEncontrada = rowsAtivas.find((r) => getCpf(r) === erro.dados?.cpf)

          if (rowEncontrada) {
            const valorAtual = getValorRow(rowEncontrada)

            if (valorAtual <= valorLimite) {
              return false
            }
          }
        }

        return true
      })
      .map((erro) => {
        const mensagemValorExcedido =
          `Valor excedeu o limite permitido na linha ${erro.linha} ` +
          `(limite: ${formatCurrency(regraValor?.valor_limite)})`

        const mensagens =
          erro.tipo_erro === 'VALOR_EXCEDIDO'
            ? [mensagemValorExcedido]
            : Array.isArray(erro.erros) && erro.erros.length > 0
              ? erro.erros
              : [erro.mensagem || `Erro na linha ${erro.linha}: ${erro.tipo_erro || 'Dado inválido'}`]

        return {
          linha: erro.linha,
          tipo: erro.tipo_erro,
          detalhes: erro.dados || {},
          colaborador:
            erro.colaborador ||
            getNomeColaboradorErro(erro, erro.dados || {}),
          erros: Array.from(new Set(mensagens.filter(Boolean))),
          mensagem: mensagens[0] || 'Erro no processamento.',
        }
      })
  }, [data, rowsAtivas, regraValor, isValeTransporte])

  const localizarErroBackendDaLinha = (row) => {
    const cpfLinha = onlyDigits(getCpf(row))
    const nomeLinha = normalizeText(getNomeColaborador(row))

    return linhasComErroBackend.find((erro) => {
      const cpfErro = onlyDigits(getCpf(erro.detalhes))
      const nomeErro = normalizeText(
        erro.colaborador ||
        getNomeColaboradorErro(erro, erro.detalhes || {})
      )

      return (
        (cpfLinha && cpfErro && cpfLinha === cpfErro) ||
        (nomeLinha && nomeErro && nomeLinha === nomeErro)
      )
    })
  }

  const hasBackendError = (row) => {
    const valorAtual = getValorRow(row)
    const limiteAtivo =
      regraValor?.ativo === true &&
      Number(regraValor?.valor_limite) > 0

    const erroEncontrado = localizarErroBackendDaLinha(row)

    if (!erroEncontrado) return false

    if (
      !isValeTransporte &&
      erroEncontrado.tipo === 'VALOR_EXCEDIDO' &&
      limiteAtivo
    ) {
      const valorLimite = Number(regraValor.valor_limite)

      if (valorAtual <= valorLimite) {
        return false
      }
    }

    return true
  }

  const getBackendErrorMessage = (row) => {
    const valorAtual = getValorRow(row)
    const limiteAtivo =
      regraValor?.ativo === true &&
      Number(regraValor?.valor_limite) > 0

    const erro = localizarErroBackendDaLinha(row)

    if (!erro) return ''

    if (
      !isValeTransporte &&
      erro.tipo === 'VALOR_EXCEDIDO' &&
      limiteAtivo
    ) {
      const valorLimite = Number(regraValor.valor_limite)

      if (valorAtual <= valorLimite) {
        return ''
      }
    }

    return erro.mensagem
  }

  const linhasValidadas = useMemo(() => {
    // console.log("Revalidando linhas, versão:", validationVersion)

    return rowsAtivas.map((r) => {
      const validacao = getRowValidation(r, regraValor, isValeTransporte)

      return {
        ...r,
        bloqueado: validacao.bloqueado,
        bloqueadoPorValor: validacao.bloqueadoPorValor,
        errosValidacao: validacao.erros,
      }
    })
  }, [rowsAtivas, regraValor, isValeTransporte, validationVersion])

  const totalBloqueios = useMemo(
    () => linhasValidadas.filter((r) => r.bloqueado).length,
    [linhasValidadas]
  )

  const totalErrosBackend = useMemo(() => {
    const errosNormalizados = extrairErrosImportacao(data)

    if (!Array.isArray(errosNormalizados) || errosNormalizados.length === 0) {
      return 0
    }

    const limiteAtivo = regraValor?.ativo === true && Number(regraValor?.valor_limite) > 0
    const valorLimite = Number(regraValor?.valor_limite)

    const errosValidos = errosNormalizados.filter((erro) => {
      if (!isValeTransporte && erro.tipo_erro === 'VALOR_EXCEDIDO' && limiteAtivo && erro.dados) {
        const rowEncontrada = rowsAtivas.find((r) => getCpf(r) === erro.dados?.cpf)

        if (rowEncontrada) {
          const valorAtual = getValorRow(rowEncontrada)

          if (valorAtual <= valorLimite) {
            return false
          }
        }
      }

      return true
    })

    return errosValidos.length
  }, [data, rowsAtivas, regraValor, isValeTransporte])

  const linhasExibidas = useMemo(() => {
    let resultado = linhasValidadas
    const buscaNormalizada = normalizeText(buscaNomePreview)

    if (buscaNormalizada) {
      resultado = resultado.filter((row) =>
        normalizeText(getNomeColaborador(row)).includes(buscaNormalizada)
      )
    }

    if (filterOnlyErrors) {
      resultado = resultado.filter(row => hasBackendError(row))
    }

    if (filterOnlyBlocked && !isValeTransporte) {
      resultado = resultado.filter(row => row.bloqueado === true)
    }

    return resultado
  }, [
    linhasValidadas,
    buscaNomePreview,
    filterOnlyErrors,
    filterOnlyBlocked,
    isValeTransporte,
    linhasComErroBackend,
  ])

  const podeEnviar = useMemo(() => {
    if (linhasValidadas.length === 0) return false

    if (isValeTransporte) {
      return linhasValidadas.length > 0
    }

    return linhasValidadas.length > 0 && totalBloqueios === 0
  }, [linhasValidadas, totalBloqueios, isValeTransporte])

  useEffect(() => {
    if (linhasValidadas.length > 0) {
      // console.log("Status das linhas validadas:", linhasValidadas.map(r => ({
      //   nome: getNomeColaborador(r),
      //   valor: getValorRow(r),
      //   bloqueado: r.bloqueado,
      //   bloqueadoPorValor: r.bloqueadoPorValor,
      //   erros: r.errosValidacao
      // })))
    }
  }, [linhasValidadas])

  const toggleFilterBlocked = () => {
    if (totalBloqueios === 0) return
    setFilterOnlyBlocked(!filterOnlyBlocked)
    if (!filterOnlyBlocked) {
      setFilterOnlyErrors(false)
    }
  }

  const toggleFilterErrors = () => {
    if (totalErrosBackend === 0) return
    setFilterOnlyErrors(!filterOnlyErrors)
    if (!filterOnlyErrors) {
      setFilterOnlyBlocked(false)
    }
  }

  const abrirConfirmacaoExclusao = (row) => {
    if (enviandoLote) return
    setColaboradorParaExcluir(row)
    setConfirmDeleteOpen(true)
  }

  const confirmarExclusaoColaborador = () => {
    if (!colaboradorParaExcluir || enviandoLote) return

    const colaboradorKey = getNomeColaborador(colaboradorParaExcluir)

    if (!colaboradorKey) {
      console.error('Chave do colaborador não encontrada para exclusão.')
      setConfirmDeleteOpen(false)
      setColaboradorParaExcluir(null)
      return
    }

    const novo = new Set(lote.excluidosPorColab)
    novo.add(colaboradorKey)

    setLote((prev) => ({ ...prev, excluidosPorColab: novo }))
    setConfirmDeleteOpen(false)
    setColaboradorParaExcluir(null)
  }

  const cancelarExclusaoColaborador = () => {
    if (enviandoLote) return
    setConfirmDeleteOpen(false)
    setColaboradorParaExcluir(null)
  }

  const limparLote = () => {
    if (enviandoLote) return

    setLote({
      id: null,
      arquivo: null,
      tipo: null,
      rows: [],
      excluidosPorColab: new Set(),
    })

    setFormEnvio({
      periodoInicio: '',
      periodoFim: '',
      competenciaMes: '',
      competenciaAno: String(new Date().getFullYear()),
      vencimento: '',
      recebimentoBeneficio: '',
    })

    setCampoDataReferenciaVT(null)

    setModalOpen(false)
    setData(null)
    setDetailsOpen(false)
    setDetailsTitle('')
    setDetailsBenefits([])
    setDetailsRowKey(null)
    setEditingBenefitIndex(null)
    setEditBenefitValue('')
    setConfirmDeleteOpen(false)
    setColaboradorParaExcluir(null)
    setReviewOpen(false)
    setModalBenedettiOpen(false)
    setBenedettiPendente(null)
    setBenedettiConvertido(false)
    setFilterOnlyErrors(false)
    setFilterOnlyBlocked(false)
    setBuscaNomePreview('')

    setReviewData({
      totalFuncionarios: 0,
      totalMovimentacoes: 0,
      valorTotalBeneficios: 0,
      periodoInicio: '',
      periodoFim: '',
      competenciaMes: '',
      competenciaAno: '',
      vencimento: '',
      recebimentoBeneficio: '',
    })
  }

  const abrirModalEnvio = () => {
    if (enviandoLote) return

    if (!isValeTransporte) {
      setCampoDataReferenciaVT(null)

      setFormEnvio((prev) => ({
        ...prev,
        vencimento: prev.recebimentoBeneficio
          ? subtractDaysFromDateInput(prev.recebimentoBeneficio, 1)
          : '',
      }))
    }

    setModalOpen(true)
  }

  const abrirDetalhes = (row) => {
    if (enviandoLote) return

    setDetailsTitle(getNomeColaborador(row))
    setDetailsBenefits(row?.beneficios || [])
    setDetailsRowKey(getRowKey(row))
    setEditingBenefitIndex(null)
    setEditBenefitValue('')
    setDetailsOpen(true)
  }

  const iniciarEdicaoBeneficio = (index, valorAtual) => {
    if (enviandoLote) return
    setEditingBenefitIndex(index)
    setEditBenefitValue(String(valorAtual || '').replace(',', '.'))
  }

  const cancelarEdicaoBeneficio = () => {
    setEditingBenefitIndex(null)
    setEditBenefitValue('')
  }

  const salvarEdicaoBeneficio = (beneficioIndex) => {
    if (enviandoLote) return

    const novoValor = Number(editBenefitValue)

    if (Number.isNaN(novoValor) || novoValor <= 0) {
      toast.warning('Informe um valor válido para o benefício.')
      return
    }

    const originalIndex = lote.rows.findIndex((row) => getRowKey(row) === detailsRowKey)

    if (originalIndex < 0) {
      toast.error('Não foi possível localizar o colaborador para edição.')
      return
    }

    const clone = [...lote.rows]
    const rowAtual = clone[originalIndex]
    const beneficiosAtualizados = [...(rowAtual.beneficios || [])]

    beneficiosAtualizados[beneficioIndex] = {
      ...beneficiosAtualizados[beneficioIndex],
      valor: novoValor,
    }

    const novoTotal = beneficiosAtualizados.reduce((total, item) => {
      return total + Number(item?.valor || 0)
    }, 0)

    const valorKey = Object.prototype.hasOwnProperty.call(rowAtual, 'valor_total')
      ? 'valor_total'
      : Object.prototype.hasOwnProperty.call(rowAtual, 'valor_recarga_bene')
        ? 'valor_recarga_bene'
        : 'valor'

    clone[originalIndex] = {
      ...rowAtual,
      beneficios: beneficiosAtualizados,
      [valorKey]: novoTotal,
    }

    setLote((prev) => ({
      ...prev,
      rows: clone,
    }))

    setDetailsBenefits(beneficiosAtualizados)
    setEditingBenefitIndex(null)
    setEditBenefitValue('')

    setValidationVersion(prev => prev + 1)

    toast.success('Benefício atualizado com sucesso.')

    setTimeout(() => {
      setDetailsOpen(false)
    }, 1000)
  }

  const abrirModalRevisao = (e) => {
    e.preventDefault()

    if (enviandoLote) return

    if (!validarDatasEnvio()) return

    const datasEnvio = getDatasEnvioNormalizadas()

    if (!data || (!data.data_to_backend && !isValeTransporte)) {
      console.error('Dados de envio não disponíveis')
      toast.error('Erro: dados do arquivo não disponíveis')
      return
    }

    let totalMovimentacoes = 0
    let valorTotalBeneficios = 0

    if (isValeTransporte) {
      totalMovimentacoes = data?.summary?.total_movimentacoes || lote.rows.length;
      valorTotalBeneficios = data?.summary?.valor_total_beneficios ||
        lote.rows.reduce((total, row) => total + getValorRow(row), 0);
    } else {
      linhasValidadas.forEach((row) => {
        const valor = getValorRow(row)
        valorTotalBeneficios += valor

        if (row.beneficios && Array.isArray(row.beneficios)) {
          totalMovimentacoes += row.beneficios.length
        }
      })
    }

    const hoje = new Date()
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0')
    const anoAtual = hoje.getFullYear()

    setReviewData({
      totalFuncionarios: linhasValidadas.length,
      totalMovimentacoes,
      valorTotalBeneficios,
      periodoInicio: formEnvio.periodoInicio || `2026-04-01`,
      periodoFim: formEnvio.periodoFim || `2026-04-30`,
      competenciaMes: formEnvio.competenciaMes || mesAtual,
      competenciaAno: formEnvio.competenciaAno || String(anoAtual),
      vencimento: datasEnvio.vencimento || '',
      recebimentoBeneficio: datasEnvio.recebimentoBeneficio || '',
    })

    setModalOpen(false)
    setReviewOpen(true)
  }

  const enviarPayloadBeneficios = async (payload) => {
    const responseEnvio = await uploadService.confirmUpload(payload)

    toast.success(responseEnvio?.detail || responseEnvio?.message || 'Lote enviado com sucesso!')

    setReviewOpen(false)
    setModalOpen(false)

    setTimeout(() => {
      window.location.href = '/'
    }, 1500)
  }

  const confirmarBenedettiSim = () => {
    if (!benedettiPendente || enviandoLote) return

    const dataAdaptada = adaptarDataParaValeCombustivel(benedettiPendente.data)
    const loteAdaptado = {
      ...benedettiPendente.lote,
      rows: adaptarRowsParaValeCombustivel(benedettiPendente.lote?.rows || []),
    }

    setData(dataAdaptada)
    setLote(loteAdaptado)
    setBenedettiConvertido(true)
    setModalBenedettiOpen(false)
    setBenedettiPendente(null)
    setValidationVersion((prev) => prev + 1)

    toast.success('Benefícios alterados para Vale Combustível.')
  }

  const confirmarBenedettiNao = () => {
    if (enviandoLote) return

    setBenedettiConvertido(false)
    setModalBenedettiOpen(false)
    setBenedettiPendente(null)

    toast.info('Importação mantida com os benefícios originais.')
  }

  const confirmarEnvio = async () => {
    if (enviandoLote) return

    if (!validarDatasEnvio()) return

    const datasEnvio = getDatasEnvioNormalizadas()

    if (!lote || !lote.rows || lote.rows.length === 0) {
      toast.error('Não há dados para enviar')
      return
    }

    try {
      setEnviandoLote(true)

      let responseEnvio;

      if (isValeTransporte) {
        // console.log("Enviando VT para o endpoint /api/upload/vt/confirm/ ...");

        const vencimentoFormatado = datasEnvio.vencimento || reviewData.vencimento || '';
        const periodoInicio = formEnvio.periodoInicio || reviewData.periodoInicio;
        const periodoFim = formEnvio.periodoFim || reviewData.periodoFim;
        const competenciaMes = formEnvio.competenciaMes || reviewData.competenciaMes;
        const competenciaAno = formEnvio.competenciaAno || reviewData.competenciaAno;

        const dadosValidadosAtualizados = (data.dados_validados || []).map(item => {
          const rowCorrespondente = linhasValidadas.find(row =>
            getCpf(row) === item.cpf_funcionario &&
            getCondominio(row) === item.nome_condominio
          )

          if (rowCorrespondente) {
            const valorEditado = getValorRow(rowCorrespondente)
            return {
              ...item,
              valor_beneficio_total: valorEditado,
              valor_editado_manualmente: true
            }
          }
          return item
        })

        const payloadVT = {
          file_upload_id: data.file_upload_id || Number(lote.id?.replace('VT-', '')) || 228,
          administradora_id: user?.administradora_ativa_id || user?.administradora_id || user?.administradora_ativa,
          tipo_processamento: 'VT',
          origem: 'importacao_vale_transporte',
          periodo_inicio: periodoInicio,
          periodo_fim: periodoFim,
          competencia_mes: competenciaMes,
          competencia_ano: competenciaAno,
          vencimento: vencimentoFormatado,
          recebimento_beneficio: datasEnvio.recebimentoBeneficio || '',
          dados_validados: dadosValidadosAtualizados,
          modelo_importacao: "VR-AUTO",
          summary: {
            total_funcionarios: lote.rows.length,
            total_movimentacoes: dadosValidadosAtualizados.length,
            valor_total_beneficios: linhasValidadas.reduce((total, row) => total + getValorRow(row), 0).toFixed(2)
          }
        };

        // console.log("Payload VT:", payloadVT);

        responseEnvio = await vtService.confirmVTUpload(payloadVT);

      } else {
        // console.log("Enviando Benefícios para o endpoint /api/upload/confirm/ ...");

        if (!data || !data.data_to_backend) {
          toast.error('Dados do arquivo não disponíveis')
          setEnviandoLote(false)
          return
        }

        const loteComAjustes = lote
        const dataToBackendSincronizado = prepararDadosParaEnvio(loteComAjustes, data.data_to_backend)

        const vencimentoFormatado = datasEnvio.vencimento || reviewData.vencimento || ''

        dataToBackendSincronizado.periodo_inicio = formEnvio.periodoInicio || reviewData.periodoInicio
        dataToBackendSincronizado.periodo_fim = formEnvio.periodoFim || reviewData.periodoFim
        dataToBackendSincronizado.competencia_mes = formEnvio.competenciaMes || reviewData.competenciaMes
        dataToBackendSincronizado.competencia_ano = formEnvio.competenciaAno || reviewData.competenciaAno
        dataToBackendSincronizado.vencimento = vencimentoFormatado
        dataToBackendSincronizado.recebimento_beneficio = datasEnvio.recebimentoBeneficio || ''
        dataToBackendSincronizado.tipo_processamento = lote.tipo || 'compra'
        dataToBackendSincronizado.origem = 'importacao_faturamento'
        dataToBackendSincronizado.file_upload_id = data.file_upload_id || lote.id?.replace('IMP-', '') || 228

        delete dataToBackendSincronizado.errors
        delete dataToBackendSincronizado.linhas_com_erro

        const dadosParaEnvio = {
          file_upload_id: data.file_upload_id || Number(lote.id?.replace('IMP-', '')) || 228,
          administradora_id: user?.administradora_ativa_id || user?.administradora_id || user?.administradora_ativa || dataToBackendSincronizado.administradora_id,
          condominios: dataToBackendSincronizado.condominios || [],
          summary: dataToBackendSincronizado.summary,
          movimentacoes_detalhada: dataToBackendSincronizado.movimentacoes_detalhada || [],
          periodo_inicio: dataToBackendSincronizado.periodo_inicio,
          periodo_fim: dataToBackendSincronizado.periodo_fim,
          competencia_mes: dataToBackendSincronizado.competencia_mes,
          competencia_ano: dataToBackendSincronizado.competencia_ano,
          vencimento: dataToBackendSincronizado.vencimento,
          recebimento_beneficio: dataToBackendSincronizado.recebimento_beneficio,
          tipo_processamento: dataToBackendSincronizado.tipo_processamento,
          origem: dataToBackendSincronizado.origem,
          modelo_importacao: "VR-BENEFICIOS",
        }

        // console.log("Payload Benefícios:", dadosParaEnvio)

        const dadosParaEnvioFinal = benedettiConvertido
          ? adaptarPayloadBenedettiParaValeCombustivel(dadosParaEnvio)
          : dadosParaEnvio

        await enviarPayloadBeneficios(dadosParaEnvioFinal)
        return
      }

      if (responseEnvio) {
        toast.success(responseEnvio?.detail
          || responseEnvio?.message
          || 'Lote enviado com sucesso!')

        setReviewOpen(false)
        setModalOpen(false)

        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
      }

    } catch (error) {
      console.error('Erro no envio:', error)
      const errorDetail = error.response?.data?.detail
        || error.response?.data?.message
        || error.message;
      toast.error(`Erro: ${errorDetail}`)
    } finally {
      setEnviandoLote(false)
    }
  }

  const totalCompras = useMemo(() => {
    return rowsAtivas.reduce((total, row) => {
      const quantidadeBeneficios = row?.beneficios?.length || 0
      return total + quantidadeBeneficios
    }, 0)
  }, [rowsAtivas])

  const totalFaturamento = useMemo(() => {
    let total = 0

    linhasValidadas.forEach((row) => {
      total += getValorRow(row)
    })

    return total
  }, [linhasValidadas, lote.rows])

  return (
    <PageLayout title="Importação" subtitle="Importe arquivos .txt, .csv ou .xlsx">
      <div className="importacao-container">
        <FileUpload onUpload={handleResult} />

        <div className="importacao-totais">
          <div className="importacao-card compra">
            <h3>Compras de Benefícios</h3>
            <p className="valor">{totalCompras}</p>
          </div>

          <div className="importacao-card faturamento">
            <h3>Faturamento dos Benefícios</h3>
            <p className="valor">{formatCurrency(totalFaturamento)}</p>
          </div>
        </div>

        <div className="lote-card" style={{ marginTop: 16, marginBottom: 16 }}>
          <div className="lote-header">
            <div>
              <h3>Limitador de Crédito</h3>
              <small>
                {loadingRegraValor
                  ? 'Carregando regra...'
                  : isValeTransporte
                    ? '🔸 Regra de valor não se aplica para Vale Transporte'
                    : regraValor?.ativo && regraValor?.valor_limite
                      ? `Bloqueio ativo para valores acima de ${formatCurrency(regraValor.valor_limite)}`
                      : 'Nenhuma trava de valor ativa para esta administradora.'}
              </small>
            </div>

            <button
              className="btn-ghost"
              type="button"
              onClick={abrirModalRegraValor}
              disabled={enviandoLote || loadingRegraValor || isValeTransporte}
            >
              {regraValor?.id ? 'Editar regra' : 'Cadastrar regra'}
            </button>
          </div>
        </div>

        {lote.id && (
          <div className="lote-card">
            <div className="lote-header">
              <div>
                <h3>Pré-validação do Lote</h3>
                <small>
                  Arquivo: <strong>{lote.arquivo}</strong> • Tipo: <strong>{lote.tipo === 'vale_transporte' ? 'Vale Transporte' : lote.tipo}</strong>
                </small>
              </div>

              <button
                className="btn-ghost"
                onClick={limparLote}
                type="button"
                disabled={enviandoLote}
              >
                Descartar lote
              </button>
            </div>

            {totalErrosBackend > 0 && (
              <div className="bloqueios-banner" style={{ border: '1px solid #fde68a', background: '#fffbeb', marginBottom: 16 }}>
                <strong style={{ color: '#b45309' }}>
                  ⚠ {totalErrosBackend} linha(s) com erro no processamento
                </strong>
                <div className="chips" style={{ marginTop: 8 }}>
                  <span className="chip chip-danger" onClick={() => setErrosModalOpen(true)} style={{ cursor: 'pointer' }}>
                    Ver detalhes dos erros
                  </span>
                  <span
                    className={`chip ${filterOnlyErrors ? 'chip-danger' : 'chip-ghost'}`}
                    onClick={toggleFilterErrors}
                    style={{ cursor: 'pointer' }}
                  >
                    {filterOnlyErrors ? 'Mostrar todas' : 'Filtrar apenas erros'}
                  </span>
                </div>
              </div>
            )}

            <div className="lote-kpis">
              <div className="kpi">
                <span className="kpi-label">Condomínios importados</span>
                <span className="kpi-value">
                  {data?.summary?.total_condominios || linhasValidadas.length}
                </span>
              </div>

              <div className="kpi">
                <span className="kpi-label">Condomínios novos</span>
                <span className="kpi-value">
                  {data?.summary?.novos_registros?.['Total de condomínios novos'] || 0}
                </span>
              </div>

              {totalBloqueios > 0 && !isValeTransporte && (
                <div
                  className={`kpi kpi-blocked ${filterOnlyBlocked ? 'active' : ''}`}
                  onClick={toggleFilterBlocked}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="kpi-label">Linhas bloqueadas por regra</span>
                  <span className="kpi-value error">{totalBloqueios}</span>
                </div>
              )}

              {totalErrosBackend > 0 && (
                <div
                  className={`kpi kpi-error ${filterOnlyErrors ? 'active' : ''}`}
                  onClick={() => setErrosModalOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="kpi-label">Linhas com erro no processamento</span>
                  <span className="kpi-value error">{totalErrosBackend}</span>
                </div>
              )}
            </div>

            <div className="preview-search-bar">
              <div className="preview-search-field">
                <input
                  type="text"
                  value={buscaNomePreview}
                  onChange={(e) => setBuscaNomePreview(e.target.value)}
                  placeholder="Buscar colaborador pelo nome"
                  disabled={enviandoLote}
                />

                {buscaNomePreview && (
                  <button
                    type="button"
                    className="preview-search-clear"
                    onClick={() => setBuscaNomePreview('')}
                    disabled={enviandoLote}
                    aria-label="Limpar busca"
                  >
                    ×
                  </button>
                )}
              </div>

              <small>
                Exibindo {linhasExibidas.length} de {linhasValidadas.length} colaboradores
              </small>
            </div>

            <div className="tabela-wrapper">
              <table className="tabela-importacao">
                <thead>
                  <tr>
                    <th>Condomínio</th>
                    <th>Colaborador</th>
                    <th className="col-valor">Valor</th>
                    <th className="col-status">Status</th>
                    <th className="col-acoes">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {linhasExibidas.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                        {buscaNomePreview ? 'Nenhum colaborador encontrado com esse nome.' :
                          filterOnlyErrors ? 'Nenhuma linha com erro encontrada.' :
                            filterOnlyBlocked ? 'Nenhuma linha bloqueada encontrada.' :
                              'Nenhum registro encontrado para pré-visualização.'}
                      </td>
                    </tr>
                  ) : (
                    linhasExibidas.map((r, idx) => {
                      const valorExibicao = getValorRow(r)
                      const nomeColaborador = getNomeColaborador(r)
                      const temErroBackend = hasBackendError(r)
                      const erroBackendMsg = getBackendErrorMessage(r)

                      return (
                        <tr
                          key={`${getRowKey(r)}-${idx}`}
                          className={`${r.bloqueado ? 'row-bloqueado' : ''} ${temErroBackend ? 'row-backend-error' : ''}`}
                        >
                          <td>{getCondominio(r)}</td>
                          <td>{nomeColaborador}</td>

                          <td className="col-valor">
                            R${' '}
                            {Number(valorExibicao).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </td>

                          <td className="col-status">
                            {r.bloqueado ? (
                              <div className="status-stack">
                                <span className="tag tag-danger">Bloqueado</span>
                                {r.errosValidacao?.length > 0 ? (
                                  <small className="status-detail">
                                    {r.errosValidacao.join(' • ')}
                                  </small>
                                ) : null}
                              </div>
                            ) : temErroBackend ? (
                              <div className="status-stack">
                                <span className="tag tag-warning">Erro no processamento</span>
                                <small className="status-detail">
                                  {erroBackendMsg}
                                </small>
                              </div>
                            ) : (
                              <span className="tag tag-ok">OK</span>
                            )}
                          </td>

                          <td className="col-acoes">
                            <div className="acoes-inline">
                              <button
                                className="btn-sm btn-outline btn-icon"
                                title={`Detalhes de ${nomeColaborador}`}
                                onClick={() => abrirDetalhes(r)}
                                type="button"
                                disabled={enviandoLote}
                              >
                                <Eye size={16} />
                                <span className="btn-text">Detalhes</span>
                              </button>

                              <button
                                className="btn-sm btn-outline btn-icon danger"
                                title={`Excluir colaborador ${nomeColaborador}`}
                                onClick={() => abrirConfirmacaoExclusao(r)}
                                type="button"
                                disabled={enviandoLote}
                              >
                                <Trash2 size={16} />
                                <span className="btn-text">Excluir</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="lote-actions">
              <button
                className="btn-primary"
                disabled={!podeEnviar || enviandoLote}
                onClick={abrirModalEnvio}
                type="button"
              >
                Enviar para importação
              </button>

              {!podeEnviar && !isValeTransporte && (
                <span className="hint">Resolva os bloqueios para habilitar o envio.</span>
              )}
            </div>
          </div>
        )}

        {/* Modal Regra Valor */}
        <Modal
          open={modalRegraValorOpen}
          title="Regra de Valor"
          onClose={() => !salvandoRegraValor && setModalRegraValorOpen(false)}
          locked={salvandoRegraValor}
        >
          <div className="form-grid importacao-form-envio">
            <label>
              <span>Ativar bloqueio por valor</span>
              <select
                value={formRegraValor.ativo ? 'true' : 'false'}
                onChange={(e) =>
                  setFormRegraValor((prev) => ({
                    ...prev,
                    ativo: e.target.value === 'true',
                  }))
                }
                disabled={salvandoRegraValor}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </label>

            <label>
              <span>Bloquear valores acima de</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formRegraValor.valor_limite}
                onChange={(e) =>
                  setFormRegraValor((prev) => ({
                    ...prev,
                    valor_limite: e.target.value,
                  }))
                }
                placeholder="Ex: 2500"
                disabled={salvandoRegraValor || !formRegraValor.ativo}
              />
            </label>

            {regraValor?.id && (
              <small>
                Regra atual:{' '}
                {regraValor?.ativo && regraValor?.valor_limite
                  ? `bloqueia acima de ${formatCurrency(regraValor.valor_limite)}`
                  : 'inativa'}
              </small>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setModalRegraValorOpen(false)}
                disabled={salvandoRegraValor}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={salvarRegraValor}
                disabled={salvandoRegraValor}
              >
                {salvandoRegraValor ? 'Salvando...' : 'Salvar regra'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Informações Obrigatórias */}
        <Modal
          open={modalOpen}
          title="Informações obrigatórias"
          onClose={() => !enviandoLote && setModalOpen(false)}
          locked={enviandoLote}
        >
          <form onSubmit={abrirModalRevisao} className="form-grid importacao-form-envio">
            <div className="form-row two-cols">
              <label>
                <span>Período de Utilização — Início</span>
                <DatePickerWrapper
                  value={formEnvio.periodoInicio}
                  onChange={(value) => setFormEnvio(prev => ({ ...prev, periodoInicio: value }))}
                  placeholderText="Selecione a data"
                  disabled={enviandoLote}
                  filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                  required
                />
              </label>

              <label>
                <span>Período de Utilização — Fim</span>
                <DatePickerWrapper
                  value={formEnvio.periodoFim}
                  onChange={(value) => setFormEnvio(prev => ({ ...prev, periodoFim: value }))}
                  placeholderText="Selecione a data"
                  minDate={formEnvio.periodoInicio}
                  disabled={enviandoLote}
                  filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                  required
                />
              </label>
            </div>

            <div className="form-row two-cols">
              <label>
                <span>Competência — Mês</span>
                <select
                  value={formEnvio.competenciaMes}
                  onChange={(e) =>
                    setFormEnvio((prev) => ({ ...prev, competenciaMes: e.target.value }))
                  }
                  required
                  disabled={enviandoLote}
                >
                  <option value="" disabled>
                    Selecione o mês
                  </option>

                  {MESES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Recebimento do benefício</span>
                <DatePickerWrapper
                  value={formEnvio.recebimentoBeneficio || ''}
                  onChange={handleRecebimentoBeneficioChange}
                  required={campoDataReferenciaVT !== 'vencimento'}
                  disabled={enviandoLote || recebimentoCalculadoAutomaticamente}
                  minDate={minDateMesAtual}
                  maxDate={recebimentoMaximo || undefined}
                />
              </label>
            </div>

            <div className="form-row full-width">
              <label>
                <span>Vencimento</span>
                <DatePickerWrapper
                  value={formEnvio.vencimento}
                  onChange={handleVencimentoChange}
                  required={campoDataReferenciaVT !== 'recebimento'}
                  disabled={enviandoLote || vencimentoCalculadoAutomaticamente}
                  minDate={vencimentoMinimo || minDateMesAtual}
                  filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                />

                {!campoDataReferenciaVT && !formEnvio.recebimentoBeneficio && !formEnvio.vencimento && (
                  <small>
                    Preencha recebimento ou vencimento.
                  </small>
                )}

                {(formEnvio.recebimentoBeneficio || formEnvio.vencimento) && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={limparDatasBeneficio}
                    disabled={enviandoLote}
                    style={{ marginTop: 8, alignSelf: 'flex-start' }}
                  >
                    Limpar datas
                  </button>
                )}
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setModalOpen(false)}
                disabled={enviandoLote}
              >
                Cancelar
              </button>

              <button type="submit" className="btn-primary" disabled={enviandoLote}>
                Continuar
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Confirmar Exclusão */}
        <Modal
          open={confirmDeleteOpen}
          title="Confirmar exclusão"
          onClose={cancelarExclusaoColaborador}
          locked={enviandoLote}
        >
          <div className="confirm-delete-content">
            <p className="confirm-delete-text">
              Tem certeza que deseja excluir o colaborador{' '}
              <strong>{getNomeColaborador(colaboradorParaExcluir)}</strong>
              {getCondominio(colaboradorParaExcluir)
                ? ` do condomínio ${getCondominio(colaboradorParaExcluir)}`
                : ''}
              ?
            </p>

            <p className="confirm-delete-warning">
              Essa ação remove o colaborador da pré-validação atual.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={cancelarExclusaoColaborador}
                disabled={enviandoLote}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-outline btn-danger"
                onClick={confirmarExclusaoColaborador}
                disabled={enviandoLote}
              >
                Confirmar exclusão
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Benedetti - Alteração para Vale Combustível */}
        <Modal
          open={modalBenedettiOpen}
          title="Alterar tipo de benefício?"
          onClose={() => {
            if (enviandoLote) return
            setModalBenedettiOpen(false)
            setBenedettiPendente(null)
          }}
          locked={enviandoLote}
        >
          <div className="confirm-delete-content">
            <p className="confirm-delete-text">
              Essa importação pertence à administradora{' '}
              <strong>M BENEDETTI ASSESSORIA CONDOMINIAL LTDA</strong>.
            </p>

            <p className="confirm-delete-warning-2">
              <strong>Deseja alterar o tipo de benefício importado para vale combustível?</strong>
            </p>

            {enviandoLote && (
              <div className="import-processing-box">
                <div className="import-processing-spinner" />

                <div>
                  <strong>Processando importação...</strong>
                  <p>Estamos aplicando a regra e enviando o lote.</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={confirmarBenedettiNao}
                disabled={enviandoLote}
              >
                Não
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={confirmarBenedettiSim}
                disabled={enviandoLote}
              >
                Sim
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Revisão e Envio */}
        <Modal
          open={reviewOpen}
          title="Confirmar envio do lote"
          onClose={() => !enviandoLote && setReviewOpen(false)}
          locked={enviandoLote}
        >
          <div className="review-summary">
            <div className="review-grid">
              <div className="review-card">
                <span className="review-label">Total de colaboradores</span>
                <strong className="review-value">{reviewData.totalFuncionarios}</strong>
              </div>

              <div className="review-card">
                <span className="review-label">Total de movimentações</span>
                <strong className="review-value">{reviewData.totalMovimentacoes}</strong>
              </div>

              <div className="review-card review-card-highlight">
                <span className="review-label">Valor total dos benefícios</span>
                <strong className="review-value">
                  {formatCurrency(reviewData.valorTotalBeneficios)}
                </strong>
              </div>
            </div>

            <div className="review-details">
              <div>
                <strong>Período:</strong> {formatDateBR(reviewData.periodoInicio)} até{' '}
                {formatDateBR(reviewData.periodoFim)}
              </div>

              <div>
                <strong>Competência:</strong>{' '}
                {formatCompetenciaBR(reviewData.competenciaMes, reviewData.competenciaAno)}
              </div>

              <div>
                <strong>Recebimento do benefício:</strong>{' '}
                {formatDateBR(reviewData.recebimentoBeneficio)}
              </div>

              <div>
                <strong>Vencimento:</strong> {formatDateBR(reviewData.vencimento)}
              </div>
            </div>

            {enviandoLote && (
              <div className="import-processing-box">
                <div className="import-processing-spinner" />

                <div>
                  <strong>Processando importação...</strong>
                  <p>Estamos gravando o lote e validando os dados. Não feche esta tela.</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  if (enviandoLote) return

                  setReviewOpen(false)
                  setModalOpen(true)
                }}
                disabled={enviandoLote}
              >
                Voltar
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={confirmarEnvio}
                disabled={enviandoLote}
              >
                {enviandoLote ? 'Processando importação...' : 'Confirmar envio'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Detalhes dos Benefícios */}
        <Modal
          open={detailsOpen}
          title={`Benefícios - ${detailsTitle}`}
          onClose={() => {
            if (enviandoLote) return

            setDetailsOpen(false)
            setEditingBenefitIndex(null)
            setEditBenefitValue('')
          }}
          locked={enviandoLote}
        >
          <div className="details-benefits-list">
            {detailsBenefits.length === 0 ? (
              <div className="details-empty-state">
                Nenhum benefício encontrado para este colaborador.
              </div>
            ) : (
              detailsBenefits.map((beneficio, index) => {
                const isEditingBenefit = editingBenefitIndex === index

                return (
                  <div
                    key={`${beneficio.codigo}-${beneficio.nome}-${index}`}
                    className="details-benefit-card"
                  >
                    <div className="details-benefit-info">
                      <strong className="details-benefit-name">{beneficio.nome}</strong>

                      {beneficio.codigo && (
                        <span className="details-benefit-code">
                          Código: {beneficio.codigo}
                        </span>
                      )}
                    </div>

                    <div className="details-benefit-value">
                      {!isEditingBenefit ? (
                        <>
                          <span>{formatCurrency(beneficio.valor)}</span>

                          <button
                            type="button"
                            className="btn-sm btn-outline btn-icon"
                            onClick={() => iniciarEdicaoBeneficio(index, beneficio.valor)}
                            title="Editar benefício"
                            disabled={enviandoLote}
                          >
                            <PencilLine size={15} />
                            <span className="btn-text">Editar</span>
                          </button>
                        </>
                      ) : (
                        <div className="edit-inline">
                          <span>R$</span>

                          <input
                            className="input-valor"
                            type="number"
                            step="0.01"
                            min="0"
                            value={editBenefitValue}
                            onChange={(e) => setEditBenefitValue(e.target.value)}
                            autoFocus
                            disabled={enviandoLote}
                          />

                          <button
                            type="button"
                            className="btn-sm btn-primary btn-icon"
                            onClick={() => salvarEdicaoBeneficio(index)}
                            title="Salvar"
                            disabled={enviandoLote}
                          >
                            <Check size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn-sm btn-ghost btn-icon"
                            onClick={cancelarEdicaoBeneficio}
                            title="Cancelar"
                            disabled={enviandoLote}
                          >
                            <XIcon size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Modal>

        {/* Modal Erros do Processamento */}
        <Modal
          open={errosModalOpen}
          title="Erros encontrados no processamento"
          onClose={() => setErrosModalOpen(false)}
        >
          <div className="erros-list">
            {linhasComErroBackend.length === 0 ? (
              <div className="details-empty-state">
                Nenhum erro encontrado.
              </div>
            ) : (
              linhasComErroBackend.map((erro, idx) => {
                const tipoLabel = {
                  INFORMACAO_AUSENTE: 'Informações obrigatórias ausentes',
                  VALOR_EXCEDIDO: 'Valor excede o limite',
                  ERRO_PROCESSAMENTO: 'Erro de processamento',
                  ERRO_CONDOMINIO: 'Erro no condomínio',
                }[erro.tipo] || erro.tipo

                const ehErroCondominio =
                  erro.tipo === 'ERRO_CONDOMINIO' ||
                  Boolean(erro.detalhes?.cnpj)

                const nomeRegistro = ehErroCondominio
                  ? (
                    erro.detalhes?.nome ||
                    erro.detalhes?.nome_condominio ||
                    erro.detalhes?.condominio ||
                    ''
                  )
                  : (
                    erro.colaborador ||
                    getNomeColaboradorErro(erro, erro.detalhes || {})
                  )

                const mensagens =
                  Array.isArray(erro.erros) && erro.erros.length > 0
                    ? erro.erros
                    : [erro.mensagem].filter(Boolean)

                return (
                  <div key={`erro-${erro.linha}-${idx}`} className="erro-item">
                    <div className="erro-header">
                      <span className="erro-linha">
                        {erro.linha && erro.linha !== '-'
                          ? `Linha ${erro.linha}`
                          : erro.detalhes?.cnpj
                            ? `CNPJ ${erro.detalhes.cnpj}`
                            : 'Registro'}
                      </span>
                      <span className="erro-mensagem">{tipoLabel}</span>
                    </div>

                    {nomeRegistro && (
                      <p style={{ margin: '8px 0 4px', fontSize: 14, color: '#111827' }}>
                        <strong>
                          {ehErroCondominio ? 'Condomínio:' : 'Colaborador:'}
                        </strong>{' '}
                        {nomeRegistro}
                      </p>
                    )}

                    {mensagens.length === 1 ? (
                      <p style={{ margin: '4px 0', fontSize: 13, color: '#374151' }}>
                        {mensagens[0]}
                      </p>
                    ) : (
                      <ul className="erro-specific-list" style={{ margin: '8px 0', paddingLeft: 20 }}>
                        {mensagens.map((mensagem, mensagemIndex) => (
                          <li key={`erro-msg-${idx}-${mensagemIndex}`}>
                            {mensagem}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      {erro.detalhes?.campo && (
                        <span className="chip chip-ghost">
                          Campo: {erro.detalhes.campo}
                        </span>
                      )}

                      {erro.detalhes?.cpf && (
                        <span className="chip chip-ghost">
                          CPF: {erro.detalhes.cpf}
                        </span>
                      )}

                      {erro.detalhes?.condominio && (
                        <span className="chip chip-ghost">
                          Condomínio: {erro.detalhes.condominio}
                        </span>
                      )}
                    </div>


                  </div>
                )
              })
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setErrosModalOpen(false)}
            >
              Fechar
            </button>
          </div>
        </Modal>

      </div>
    </PageLayout>
  )
}

// arquivo com erro apresentado corretamente 