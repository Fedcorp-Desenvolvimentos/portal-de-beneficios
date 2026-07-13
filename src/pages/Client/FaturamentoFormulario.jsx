import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  PencilLine,
  Check,
  X as XIcon,
  Search,
} from 'lucide-react'

import { entebenService } from '../../services/entebenService'
import DatePickerWrapper from '../../components/DatePicker/DatePickerWrapper'

import '../../styles/FaturamentoFormulario.css'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const initialState = {
  competencia: '',
  empresa: '',
  beneficio: '',
  diasUteis: '',
  periodoInicio: '',
  periodoFim: '',
  vencimento: '',
  recebimentoBeneficio: '',
  observacao: '',
}

const formatCurrency = (value) =>
  `R$ ${Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
  })}`

const formatDateBR = (dateStr) => {
  if (!dateStr) return '—'

  const onlyDate = String(dateStr).split('T')[0]

  if (/^\d{4}-\d{2}-\d{2}$/.test(onlyDate)) {
    const [year, month, day] = onlyDate.split('-')
    return `${day}/${month}/${year}`
  }

  const date = new Date(`${onlyDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('pt-BR')
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.importacoes)) return value.importacoes
  return []
}

const parseMaybeJson = (value) => {
  if (!value) return null
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

const onlyDigits = (value) => String(value || '').replace(/\D/g, '')

const getDadosRequisicao = (data) =>
  parseMaybeJson(data?.dados_requisicao) ||
  parseMaybeJson(data?.raw?.ultima?.dados_requisicao) ||
  parseMaybeJson(data?.raw?.metaUltima?.dados_requisicao) ||
  parseMaybeJson(data?.data_to_backend) ||
  {}

const getCondominios = (data) => {
  const dadosReq = getDadosRequisicao(data)

  if (Array.isArray(data?.condominios) && data.condominios.length) {
    return data.condominios
  }

  if (Array.isArray(data?.data_to_backend?.condominios) && data.data_to_backend.condominios.length) {
    return data.data_to_backend.condominios
  }

  if (Array.isArray(dadosReq?.condominios) && dadosReq.condominios.length) {
    return dadosReq.condominios
  }

  if (Array.isArray(data?.raw?.ultima?.condominios) && data.raw.ultima.condominios.length) {
    return data.raw.ultima.condominios
  }

  if (
    Array.isArray(data?.raw?.metaUltima?.condominios) &&
    data.raw.metaUltima.condominios.length
  ) {
    return data.raw.metaUltima.condominios
  }

  return []
}

const getMovimentacoesDiretas = (data) => {
  const dadosReq = getDadosRequisicao(data)

  const possibilidades = [
    data?.movimentacoes_detalhada,
    data?.movimentacoes,
    data?.preview,
    data?.total_por_beneficiario,

    data?.summary?.total_por_beneficiario,
    data?.summary?.movimentacoes_detalhada,

    data?.data_to_backend?.movimentacoes_detalhada,
    data?.data_to_backend?.movimentacoes,
    data?.data_to_backend?.summary?.total_por_beneficiario,

    dadosReq?.movimentacoes_detalhada,
    dadosReq?.movimentacoes,
    dadosReq?.summary?.total_por_beneficiario,

    data?.raw?.state?.movimentacoes_detalhada,
    data?.raw?.state?.data_to_backend?.movimentacoes_detalhada,
    data?.raw?.state?.summary?.total_por_beneficiario,

    data?.raw?.ultima?.movimentacoes_detalhada,
    data?.raw?.ultima?.data_to_backend?.movimentacoes_detalhada,
    data?.raw?.ultima?.summary?.total_por_beneficiario,

    data?.raw?.metaUltima?.movimentacoes_detalhada,
    data?.raw?.metaUltima?.data_to_backend?.movimentacoes_detalhada,
    data?.raw?.metaUltima?.summary?.total_por_beneficiario,
  ]

  for (const item of possibilidades) {
    if (Array.isArray(item) && item.length) return item
  }

  return []
}

const getFuncionarios = (data) =>
  getCondominios(data).flatMap((condo) => {
    if (Array.isArray(condo?.funcionarios)) return condo.funcionarios
    if (Array.isArray(condo?.colaboradores)) return condo.colaboradores
    return []
  })

const getMovimentacoes = (data) => {
  const diretas = getMovimentacoesDiretas(data)

  if (diretas.length) return diretas

  return getFuncionarios(data).flatMap((func) => {
    if (Array.isArray(func?.movimentacoes)) return func.movimentacoes
    if (Array.isArray(func?.beneficios)) return func.beneficios
    return []
  })
}

const getNomeColaborador = (row) =>
  row?.nome_funcionario ||
  row?.nome_func ||
  row?.colaborador ||
  row?.nome_colaborador ||
  row?.nome ||
  row?.funcionario ||
  row?.nome_funcionário ||
  ''

const getCondominioRow = (row) =>
  row?.condominio ||
  row?.nome_condominio ||
  row?.condominio_nome ||
  row?.NomeCondominio ||
  row?.razao_social ||
  row?.nome_cond ||
  ''

const getCpf = (row) =>
  String(
    row?.cpf ||
    row?.cpf_func ||
    row?.cpf_funcionario ||
    row?.CPF ||
    row?.documento ||
    ''
  ).trim()

const getNomeProduto = (item) =>
  item?.nome_produto ||
  item?.produto_nome ||
  item?.produto ||
  item?.nome_beneficio ||
  item?.beneficio_nome ||
  item?.beneficio ||
  item?.descricao_produto ||
  item?.descricao ||
  item?.tipo ||
  'Benefício'

const getCodigoProduto = (item) =>
  String(
    item?.codigo_produto ||
    item?.produto_codigo ||
    item?.cod_produto ||
    item?.codigo ||
    ''
  ).trim()

const getValorRow = (row) => {
  const candidates = [
    row?.valor_total,
    row?.valor_recarga_bene,
    row?.valor_beneficio,
    row?.valor_beneficio_total,
    row?.valor,
    row?.total,
    row?.amount,
    row?.preco,
  ]

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === '') continue

    const parsed =
      typeof candidate === 'string'
        ? Number(candidate.replace(/\./g, '').replace(',', '.'))
        : Number(candidate)

    if (!Number.isNaN(parsed)) return parsed
  }

  return 0
}

const getValorProduto = (item) =>
  Number(
    item?.valor_recarga_bene ||
    item?.valor_total ||
    item?.valor_beneficio ||
    item?.valor_beneficio_total ||
    item?.valor ||
    item?.total ||
    0
  )

const getRowKey = (row) => {
  const condominio = getCondominioRow(row)
  const nome = getNomeColaborador(row)
  const cpf = getCpf(row)

  if (cpf) return `${condominio}::${nome}::${cpf}`

  return `${condominio}::${nome}`
}

const getValorTotal = (data) => {
  const dadosReq = getDadosRequisicao(data)

  const totalMovimentacoes = getMovimentacoes(data).reduce(
    (sum, mov) =>
      sum +
      Number(
        mov?.valor ||
        mov?.valor_total ||
        mov?.valor_beneficio ||
        mov?.valor_beneficio_total ||
        mov?.valor_recarga_bene ||
        mov?.total ||
        0
      ),
    0
  )

  return Number(
    totalMovimentacoes ||
    data?.resumo_anterior?.valorTotal ||
    data?.resumo_anterior?.valor_total ||
    data?.valor_total ||
    data?.total ||
    data?.valor_total_beneficios ||
    data?.summary?.valor_total_beneficios ||
    data?.summary?.valor_total ||
    data?.summary?.total ||
    data?.resumo?.valor_total_beneficios ||
    data?.resumo?.total ||
    dadosReq?.valor_total_beneficios ||
    dadosReq?.valor_total ||
    dadosReq?.total ||
    dadosReq?.total_geral ||
    dadosReq?.summary?.valor_total_beneficios ||
    dadosReq?.summary?.valor_total ||
    dadosReq?.summary?.total ||
    dadosReq?.resumo?.valor_total_beneficios ||
    dadosReq?.resumo?.total ||
    data?.raw?.ultima?.valor_total ||
    data?.raw?.ultima?.total ||
    data?.raw?.ultima?.summary?.valor_total_beneficios ||
    data?.raw?.metaUltima?.valor_total ||
    data?.raw?.metaUltima?.total ||
    data?.raw?.metaUltima?.summary?.valor_total_beneficios ||
    0
  )
}

const getQtdCondominios = (data) => {
  const dadosReq = getDadosRequisicao(data)

  return Number(
    getCondominios(data).length ||
    data?.resumo_anterior?.condominios ||
    data?.total_condominios ||
    data?.qtd_condominios ||
    data?.summary?.total_condominios ||
    dadosReq?.total_condominios ||
    dadosReq?.qtd_condominios ||
    dadosReq?.summary?.total_condominios ||
    data?.raw?.metaUltima?.total_condominios ||
    0
  )
}

const getQtdColaboradores = (data) => {
  const dadosReq = getDadosRequisicao(data)

  return Number(
    getFuncionarios(data).length ||
    data?.resumo_anterior?.colaboradores ||
    data?.total_funcionarios ||
    data?.qtd_funcionarios ||
    data?.total_colaboradores ||
    data?.registros_processados ||
    data?.summary?.total_funcionarios ||
    data?.summary?.total_colaboradores ||
    dadosReq?.total_funcionarios ||
    dadosReq?.qtd_funcionarios ||
    dadosReq?.total_colaboradores ||
    dadosReq?.summary?.total_funcionarios ||
    dadosReq?.summary?.total_colaboradores ||
    data?.raw?.metaUltima?.registros_processados ||
    data?.raw?.ultima?.registros_processados ||
    0
  )
}

const getQtdMovimentacoes = (data) => {
  const dadosReq = getDadosRequisicao(data)

  return Number(
    getMovimentacoes(data).length ||
    data?.resumo_anterior?.movimentacoes ||
    data?.total_movimentacoes ||
    data?.qtd_movimentacoes ||
    data?.registros_processados ||
    data?.summary?.total_movimentacoes ||
    dadosReq?.total_movimentacoes ||
    dadosReq?.qtd_movimentacoes ||
    dadosReq?.summary?.total_movimentacoes ||
    data?.raw?.metaUltima?.registros_processados ||
    data?.raw?.ultima?.registros_processados ||
    0
  )
}

const getPreviewPeriodo = (data) => {
  const inicio =
    data?.vigencia_inicio ||
    data?.raw?.metaUltima?.vigencia_inicio ||
    data?.raw?.ultima?.vigencia_inicio

  const fim =
    data?.vigencia_fim ||
    data?.raw?.metaUltima?.vigencia_fim ||
    data?.raw?.ultima?.vigencia_fim

  if (inicio && fim) {
    return `${formatDateBR(inicio)} até ${formatDateBR(fim)}`
  }

  return '—'
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

const getPreviewVencimento = (data) =>
  data?.data_vencimento ||
  data?.vencimento ||
  data?.raw?.metaUltima?.data_vencimento ||
  data?.raw?.ultima?.data_vencimento ||
  ''

const getPreviewRecebimento = (data) =>
  data?.recebimento_beneficio ||
  data?.recebimentoBeneficio ||
  data?.raw?.metaUltima?.recebimento_beneficio ||
  data?.raw?.ultima?.recebimento_beneficio ||
  ''

const getPreviewPeriodoInicio = (data) =>
  data?.vigencia_inicio ||
  data?.periodo_inicio ||
  data?.raw?.metaUltima?.vigencia_inicio ||
  data?.raw?.ultima?.vigencia_inicio ||
  ''

const getPreviewPeriodoFim = (data) =>
  data?.vigencia_fim ||
  data?.periodo_fim ||
  data?.raw?.metaUltima?.vigencia_fim ||
  data?.raw?.ultima?.vigencia_fim ||
  ''

const getPreviewId = (preview) =>
  preview?.id ||
  preview?.file_upload_id ||
  preview?.importacao_id ||
  preview?.faturamento_id ||
  preview?.raw?.metaUltima?.id ||
  preview?.raw?.ultima?.id ||
  null

const buildBenefitsIndexes = (movimentacoes = []) => {
  const byCondominioNomeCpf = new Map()
  const byNomeCpf = new Map()
  const byCondominioNome = new Map()

  movimentacoes.forEach((item) => {
    const nome = normalizeText(getNomeColaborador(item))
    const condominio = normalizeText(getCondominioRow(item))
    const cpf = onlyDigits(getCpf(item))

    const beneficio = {
      codigo: getCodigoProduto(item),
      nome: getNomeProduto(item),
      valor: getValorProduto(item),
    }

    if (!beneficio.nome && !beneficio.valor) return

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

const enrichRowsWithBenefits = (rows = [], movimentacoes = []) => {
  const indexes = buildBenefitsIndexes(movimentacoes)

  return rows.map((row) => {
    const nome = normalizeText(getNomeColaborador(row))
    const condominio = normalizeText(getCondominioRow(row))
    const cpf = onlyDigits(getCpf(row))

    const keyCondominioNomeCpf = `${condominio}::${nome}::${cpf}`
    const keyNomeCpf = `${nome}::${cpf}`
    const keyCondominioNome = `${condominio}::${nome}`

    const beneficios =
      (cpf && indexes.byCondominioNomeCpf.get(keyCondominioNomeCpf)) ||
      (cpf && indexes.byNomeCpf.get(keyNomeCpf)) ||
      indexes.byCondominioNome.get(keyCondominioNome) ||
      row?.beneficios ||
      row?.movimentacoes ||
      []

    const beneficiosNormalizados = beneficios.map((item) => ({
      codigo: getCodigoProduto(item),
      nome: getNomeProduto(item),
      valor: getValorProduto(item),
    }))

    const valorTotal =
      beneficiosNormalizados.length > 0
        ? beneficiosNormalizados.reduce((sum, item) => sum + Number(item.valor || 0), 0)
        : getValorRow(row)

    return {
      ...row,
      beneficios: beneficiosNormalizados,
      valor_total: valorTotal,
    }
  })
}

const buildRowsFromMovimentacoes = (movimentacoes = []) => {
  const mapa = new Map()

  movimentacoes.forEach((item) => {
    const condominio = getCondominioRow(item)
    const nome = getNomeColaborador(item)
    const cpf = getCpf(item)
    const key = cpf ? `${condominio}::${nome}::${cpf}` : `${condominio}::${nome}`

    const beneficio = {
      codigo: getCodigoProduto(item),
      nome: getNomeProduto(item),
      valor: getValorProduto(item),
    }

    if (!mapa.has(key)) {
      mapa.set(key, {
        ...item,
        condominio,
        nome_funcionario: nome,
        cpf_funcionario: cpf,
        valor_total: 0,
        beneficios: [],
      })
    }

    const atual = mapa.get(key)

    atual.valor_total += Number(beneficio.valor || 0)

    if (beneficio.nome || beneficio.valor > 0) {
      atual.beneficios.push(beneficio)
    }

    mapa.set(key, atual)
  })

  return Array.from(mapa.values())
}

const buildRowsFromCondominios = (data) => {
  const condominios = getCondominios(data)
  const rows = []

  condominios.forEach((condominio) => {
    const nomeCondominio =
      condominio?.condominio ||
      condominio?.nome_condominio ||
      condominio?.nome ||
      condominio?.razao_social ||
      ''

    const funcionarios = [
      ...(Array.isArray(condominio?.funcionarios) ? condominio.funcionarios : []),
      ...(Array.isArray(condominio?.colaboradores) ? condominio.colaboradores : []),
    ]

    funcionarios.forEach((funcionario) => {
      rows.push({
        ...funcionario,
        condominio: nomeCondominio,
        nome_funcionario: getNomeColaborador(funcionario),
        cpf_funcionario: getCpf(funcionario),
        valor_total: getValorRow(funcionario),
        beneficios: funcionario?.beneficios || funcionario?.movimentacoes || [],
      })
    })
  })

  return rows
}

const buildPreviewRows = (data) => {
  const movimentacoes = getMovimentacoes(data)

  const previewRowsBackend =
    data?.summary?.total_por_beneficiario ||
    data?.data_to_backend?.summary?.total_por_beneficiario ||
    getDadosRequisicao(data)?.summary?.total_por_beneficiario ||
    data?.total_por_beneficiario ||
    data?.preview ||
    []

  if (Array.isArray(previewRowsBackend) && previewRowsBackend.length) {
    return enrichRowsWithBenefits(previewRowsBackend, movimentacoes)
  }

  const rowsCondominios = buildRowsFromCondominios(data)

  if (rowsCondominios.length) {
    return enrichRowsWithBenefits(rowsCondominios, movimentacoes)
  }

  return buildRowsFromMovimentacoes(movimentacoes)
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null

  return (
    <div className="fat-modal-overlay">
      <div className="fat-modal-card">
        <div className="fat-modal-header">
          <h3>{title}</h3>

          <button className="fat-preview-btn ghost" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="fat-modal-body">{children}</div>
      </div>
    </div>
  )
}

export default function FaturamentoFormulario({ modo = 'novo' }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState(initialState)
  const [preview, setPreview] = useState(null)
  const [previewRows, setPreviewRows] = useState([])
  const [excluidosPorColab, setExcluidosPorColab] = useState(new Set())
  const [previewAberto, setPreviewAberto] = useState(false)
  const [buscaPreview, setBuscaPreview] = useState('')

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsTitle, setDetailsTitle] = useState('')
  const [detailsBenefits, setDetailsBenefits] = useState([])

  const [detailsRowKey, setDetailsRowKey] = useState(null)
  const [editingBenefitIndex, setEditingBenefitIndex] = useState(null)
  const [editBenefitValue, setEditBenefitValue] = useState('')

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState(null)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [campoLocked, setCampoLocked] = useState(null)

  useEffect(() => {
    if (modo === 'repetir') {
      carregarUltimoFaturamento()
    }
  }, [modo])

  async function carregarUltimoFaturamento() {
    try {
      setLoading(true)
      setError('')

      const dadosState = location.state?.ultimaImportacao || null

      const [ultimaImportacao, historicoData] = await Promise.all([
        entebenService.getUltimaImportacao(),
        entebenService.getImportacoes(),
      ])

      const historico = toArray(historicoData)
      const metaUltima = historico[0] || null

      const dados = {
        ...(dadosState || {}),
        ...(metaUltima || {}),
        ...(ultimaImportacao || {}),
        raw: {
          state: dadosState,
          metaUltima,
          ultima: ultimaImportacao,
        },
      }

      const condominios =
        getCondominios(ultimaImportacao).length > 0
          ? getCondominios(ultimaImportacao)
          : getCondominios(metaUltima).length > 0
            ? getCondominios(metaUltima)
            : getCondominios(dadosState)

      const dadosCompletos = {
        ...dados,
        condominios,
        resumo_anterior: {
          condominios:
            condominios.length ||
            getQtdCondominios(ultimaImportacao) ||
            getQtdCondominios(metaUltima) ||
            getQtdCondominios(dadosState),

          colaboradores:
            getQtdColaboradores({ ...dados, condominios }) ||
            getQtdColaboradores(ultimaImportacao) ||
            getQtdColaboradores(metaUltima) ||
            getQtdColaboradores(dadosState),

          movimentacoes:
            getQtdMovimentacoes({ ...dados, condominios }) ||
            getQtdMovimentacoes(ultimaImportacao) ||
            getQtdMovimentacoes(metaUltima) ||
            getQtdMovimentacoes(dadosState),

          valorTotal:
            getValorTotal({ ...dados, condominios }) ||
            getValorTotal(ultimaImportacao) ||
            getValorTotal(metaUltima) ||
            getValorTotal(dadosState),
        },
      }

      if (!ultimaImportacao && !metaUltima && !dadosState) {
        setError('Nenhuma movimentação anterior encontrada.')
        return
      }

      const rows = buildPreviewRows(dadosCompletos)

      setPreview(dadosCompletos)
      setPreviewRows(rows)
      setExcluidosPorColab(new Set())
    } catch (error) {
      console.error('Erro ao carregar última movimentação:', error)
      setError('Não foi possível carregar a última movimentação.')
    } finally {
      setLoading(false)
    }
  }

  const rowsAtivas = useMemo(() => {
    if (!previewRows.length) return []

    if (!excluidosPorColab.size) return previewRows

    return previewRows.filter((row) => !excluidosPorColab.has(getRowKey(row)))
  }, [previewRows, excluidosPorColab])

  const rowsFiltradasPreview = useMemo(() => {
    const termo = normalizeText(buscaPreview)

    if (!termo) return rowsAtivas

    return rowsAtivas.filter((row) =>
      normalizeText(getNomeColaborador(row)).includes(termo)
    )
  }, [rowsAtivas, buscaPreview])

  const previewResumo = useMemo(() => {
    if (!preview) {
      return {
        condominios: 0,
        colaboradores: 0,
        movimentacoes: 0,
        valorTotal: 0,
      }
    }

    const condominiosUnicos = new Set(
      rowsAtivas
        .map((row) => normalizeText(getCondominioRow(row)))
        .filter(Boolean)
    )

    const movimentacoes = rowsAtivas.reduce((sum, row) => {
      return sum + Number(row?.beneficios?.length || 0)
    }, 0)

    const valorTotal = rowsAtivas.reduce((sum, row) => {
      return sum + Number(getValorRow(row) || 0)
    }, 0)

    return {
      condominios:
        condominiosUnicos.size ||
        Number(preview?.resumo_anterior?.condominios) ||
        getQtdCondominios(preview),

      colaboradores:
        rowsAtivas.length ||
        Number(preview?.resumo_anterior?.colaboradores) ||
        getQtdColaboradores(preview),

      movimentacoes:
        movimentacoes ||
        Number(preview?.resumo_anterior?.movimentacoes) ||
        getQtdMovimentacoes(preview),

      valorTotal:
        valorTotal ||
        Number(preview?.resumo_anterior?.valorTotal) ||
        getValorTotal(preview),
    }
  }, [preview, rowsAtivas])

  function handleChange(e) {
    const { name, value } = e.target
    const isComplete = value.length === 10

    if (campoLocked === name && value) return

    if (name === 'recebimentoBeneficio') {
      setForm((prev) => ({
        ...prev,
        recebimentoBeneficio: value,
        vencimento: isComplete ? subtractDaysFromDateInput(value, 1) : '',
      }))
      setCampoLocked(isComplete ? 'vencimento' : null)
      return
    }

    if (name === 'vencimento') {
      setForm((prev) => ({
        ...prev,
        vencimento: value,
        recebimentoBeneficio: isComplete ? addDaysToDateInput(value, 1) : '',
      }))
      setCampoLocked(isComplete ? 'recebimentoBeneficio' : null)
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function validateForm() {
    if (!preview && modo === 'repetir') {
      return 'Nenhuma base de faturamento encontrada.'
    }

    if (modo === 'repetir' && rowsAtivas.length === 0) {
      return 'Nenhum colaborador disponível para repetir o faturamento.'
    }

    if (!form.competencia) return 'Preencha a competência.'
    if (!form.vencimento.trim()) return 'Preencha o vencimento.'

    return ''
  }

  function abrirDetalhes(row) {
    setDetailsTitle(getNomeColaborador(row))
    setDetailsBenefits(row?.beneficios || [])
    setDetailsRowKey(getRowKey(row))
    setEditingBenefitIndex(null)
    setEditBenefitValue('')
    setDetailsOpen(true)
  }

  function iniciarEdicaoBeneficio(index, valorAtual) {
    setEditingBenefitIndex(index)
    setEditBenefitValue(String(valorAtual || '').replace(',', '.'))
  }

  function cancelarEdicaoBeneficio() {
    setEditingBenefitIndex(null)
    setEditBenefitValue('')
  }

  function salvarEdicaoBeneficio(beneficioIndex) {
    const novoValor = Number(editBenefitValue)

    if (Number.isNaN(novoValor) || novoValor <= 0) {
      setError('Informe um valor válido para o benefício.')
      return
    }

    const rowIndex = previewRows.findIndex(
      (row) => getRowKey(row) === detailsRowKey
    )

    if (rowIndex < 0) {
      setError('Não foi possível localizar o colaborador para edição.')
      return
    }

    const clone = [...previewRows]
    const rowAtual = clone[rowIndex]
    const beneficiosAtualizados = [...(rowAtual.beneficios || [])]

    beneficiosAtualizados[beneficioIndex] = {
      ...beneficiosAtualizados[beneficioIndex],
      valor: novoValor,
    }

    const novoTotal = beneficiosAtualizados.reduce((total, item) => {
      return total + Number(item?.valor || 0)
    }, 0)

    clone[rowIndex] = {
      ...rowAtual,
      beneficios: beneficiosAtualizados,
      valor_total: novoTotal,
    }

    setPreviewRows(clone)
    setDetailsBenefits(beneficiosAtualizados)
    setEditingBenefitIndex(null)
    setEditBenefitValue('')
    setError('')
  }

  function abrirConfirmacaoExclusao(row) {
    setColaboradorParaExcluir(row)
    setConfirmDeleteOpen(true)
  }

  function cancelarExclusaoColaborador() {
    setColaboradorParaExcluir(null)
    setConfirmDeleteOpen(false)
  }

  function confirmarExclusaoColaborador() {
    if (!colaboradorParaExcluir) return

    const novo = new Set(excluidosPorColab)
    novo.add(getRowKey(colaboradorParaExcluir))

    setExcluidosPorColab(novo)
    setColaboradorParaExcluir(null)
    setConfirmDeleteOpen(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setSaving(true)
      setError('')

      const validationError = validateForm()

      if (validationError) {
        setError(validationError)
        return
      }

      const importacaoId = getPreviewId(preview)

      const payload = {
        competencia: form.competencia,
        referencia: MESES[Number(form.competencia) - 1] + '/' + new Date().getFullYear(),
        dias_uteis: form.diasUteis,
        periodo_inicio: form.periodoInicio,
        periodo_fim: form.periodoFim,
        data_vencimento: form.vencimento,
        vencimento: form.vencimento,
        recebimento_beneficio: form.recebimentoBeneficio,
        observacao: form.observacao,

        importacao_id: importacaoId,
        faturamento_id: importacaoId,

        resumo_anterior: previewResumo,
        condominios: getCondominios(preview),
        colaboradores: rowsAtivas,
        origem: modo === 'repetir' ? 'repetir_faturamento' : 'novo_faturamento',
      }

      console.log('PAYLOAD FINAL PARA BACKEND:', payload)

      alert('Payload pronto para envio ao backend. Confira o console.')
    } catch (error) {
      console.error(error)
      setError('Não foi possível criar o faturamento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fat-form-page">
      <div className="fat-form-card">
        <div className="fat-form-header">
          <h1>
            {modo === 'repetir'
              ? 'Repetir último faturamento'
              : 'Novo faturamento'}
          </h1>

          <p className="fat-form-subtitle">
            {modo === 'repetir'
              ? 'Preencha os dados do novo faturamento usando a última movimentação apenas como base.'
              : 'Preencha os dados para criar um novo faturamento.'}
          </p>
        </div>

        {error && <div className="fat-form-alert error">{error}</div>}

        {loading ? (
          <div className="fat-form-loading">
            Carregando última movimentação...
          </div>
        ) : (
          <>
            {modo === 'repetir' && preview && (
              <div className="fat-preview-card">
                <div className="fat-preview-header">
                  <div>
                    <h3>Preview do mês anterior</h3>
                    <p>
                      Base:{' '}
                      <strong>IMP-{getPreviewId(preview) || 'última'}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    className="fat-preview-toggle"
                    onClick={() => setPreviewAberto((prev) => !prev)}
                  >
                    {previewAberto ? (
                      <>
                        Ocultar preview <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        Ver preview <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>

                <div className="fat-preview-grid">
                  <div className="fat-preview-item">
                    <span>Condomínios</span>
                    <strong>{previewResumo.condominios}</strong>
                  </div>

                  <div className="fat-preview-item">
                    <span>Colaboradores</span>
                    <strong>{previewResumo.colaboradores}</strong>
                  </div>

                  <div className="fat-preview-item">
                    <span>Movimentações</span>
                    <strong>{previewResumo.movimentacoes}</strong>
                  </div>

                  <div className="fat-preview-item">
                    <span>Valor total anterior</span>
                    <strong>{formatCurrency(previewResumo.valorTotal)}</strong>
                  </div>
                </div>

                <br />

                <div className="fat-preview-meta">
                  <span>
                    Vigência anterior:{' '}
                    <strong>{getPreviewPeriodo(preview)}</strong>
                  </span>

                  <br />
                  <br />

                  {getPreviewVencimento(preview) && (
                    <span>
                      Vencimento anterior:{' '}
                      <strong>{formatDateBR(getPreviewVencimento(preview))}</strong>
                    </span>
                  )}
                </div>

                {previewAberto && (
                  <>
                    <div className="fat-preview-search">
                      <Search size={18} />

                      <input
                        type="text"
                        value={buscaPreview}
                        onChange={(e) => setBuscaPreview(e.target.value)}
                        placeholder="Buscar colaborador por nome"
                      />

                      {buscaPreview && (
                        <button
                          type="button"
                          className="fat-preview-search-clear"
                          onClick={() => setBuscaPreview('')}
                          aria-label="Limpar busca"
                          title="Limpar busca"
                        >
                          <XIcon size={16} />
                        </button>
                      )}
                    </div>

                    <div className="fat-preview-table-wrap">
                      <table className="fat-preview-table">
                        <thead>
                          <tr>
                            <th>Condomínio</th>
                            <th>Colaborador</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Ações</th>
                          </tr>
                        </thead>

                        <tbody>
                          {rowsFiltradasPreview.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="fat-preview-empty">
                                {buscaPreview
                                  ? 'Nenhum colaborador encontrado para esta busca.'
                                  : 'Nenhum registro encontrado para pré-visualização.'}
                              </td>
                            </tr>
                          ) : (
                            rowsFiltradasPreview.map((row, index) => {
                              const nomeColaborador = getNomeColaborador(row)

                              return (
                                <tr key={`${getRowKey(row)}-${index}`}>
                                  <td>{getCondominioRow(row) || '—'}</td>
                                  <td>{nomeColaborador || '—'}</td>
                                  <td>{formatCurrency(getValorRow(row))}</td>
                                  <td>
                                    <span className="fat-status-ok">OK</span>
                                  </td>
                                  <td>
                                    <div className="fat-preview-actions">
                                      <button
                                        type="button"
                                        className="fat-preview-btn"
                                        onClick={() => abrirDetalhes(row)}
                                      >
                                        <Eye size={14} />
                                      </button>

                                      <button
                                        type="button"
                                        className="fat-preview-btn danger"
                                        onClick={() => abrirConfirmacaoExclusao(row)}
                                      >
                                        <Trash2 size={14} />
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
                  </>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="fat-form">
              <div className="fat-form-grid">
                <div className="form-group">
                  <label htmlFor="competencia">Competência</label>
                  <select
                    id="competencia"
                    value={form.competencia}
                    onChange={(e) => setForm((prev) => ({ ...prev, competencia: e.target.value }))}
                    required
                  >
                    <option value="">Selecionar</option>
                    {MESES.map((mes, i) => (
                      <option key={i} value={String(i + 1).padStart(2, '0')}>{mes}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="diasUteis">Dias úteis</label>
                  <input
                    id="diasUteis"
                    name="diasUteis"
                    type="number"
                    min="0"
                    value={form.diasUteis}
                    onChange={handleChange}
                    placeholder="Ex: 20"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="periodoInicio">Período início</label>
                  <DatePickerWrapper
                    id="periodoInicio"
                    value={form.periodoInicio}
                    onChange={(value) => handleChange({ target: { name: 'periodoInicio', value } })}
                    filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="periodoFim">Período fim</label>
                  <DatePickerWrapper
                    id="periodoFim"
                    value={form.periodoFim}
                    onChange={(value) => handleChange({ target: { name: 'periodoFim', value } })}
                    filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="recebimentoBeneficio">Recebimento do benefício</label>
                  <DatePickerWrapper
                    id="recebimentoBeneficio"
                    value={form.recebimentoBeneficio}
                    onChange={(value) => handleChange({ target: { name: 'recebimentoBeneficio', value } })}
                    disabled={campoLocked === 'recebimentoBeneficio'}
                    filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vencimento">Vencimento</label>
                  <DatePickerWrapper
                    id="vencimento"
                    value={form.vencimento}
                    onChange={(value) => handleChange({ target: { name: 'vencimento', value } })}
                    required
                    disabled={campoLocked === 'vencimento'}
                    filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                  />

                </div>
              </div>

              <div className="form-group">
                <label htmlFor="observacao">Observação</label>
                <textarea
                  id="observacao"
                  name="observacao"
                  value={form.observacao}
                  onChange={handleChange}
                  placeholder="Adicione uma observação, se necessário"
                  rows={5}
                />
              </div>

              <div className="fat-form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => navigate('/faturamento')}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar faturamento'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <Modal
        open={detailsOpen}
        title={`Benefícios - ${detailsTitle || 'Colaborador'}`}
        onClose={() => {
          setDetailsOpen(false)
          setEditingBenefitIndex(null)
          setEditBenefitValue('')
        }}
      >
        <div className="fat-benefits-list">
          {detailsBenefits.length === 0 ? (
            <div className="fat-preview-empty">
              Nenhum benefício encontrado para este colaborador.
            </div>
          ) : (
            detailsBenefits.map((beneficio, index) => {
              const isEditing = editingBenefitIndex === index

              return (
                <div
                  key={`${beneficio.codigo}-${beneficio.nome}-${index}`}
                  className="fat-benefit-card"
                >
                  <div>
                    <strong>{beneficio.nome}</strong>
                    <br />
                    {beneficio.codigo && (
                      <span>Código: {beneficio.codigo}</span>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="fat-benefit-value-actions inline">
                      <strong>{formatCurrency(beneficio.valor)}</strong>

                      <button
                        type="button"
                        className="fat-preview-btn edit-inline"
                        onClick={() => iniciarEdicaoBeneficio(index, beneficio.valor)}
                        title="Editar valor"
                      >
                        <PencilLine size={14} />
                        <span>Editar</span>
                      </button>
                    </div>
                  ) : (
                    <div className="fat-benefit-edit-inline">
                      <span className="fat-money-prefix">R$</span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editBenefitValue}
                        onChange={(e) => setEditBenefitValue(e.target.value)}
                        autoFocus
                      />

                      <button
                        type="button"
                        className="fat-icon-action success"
                        onClick={() => salvarEdicaoBeneficio(index)}
                        title="Salvar"
                      >
                        <Check size={15} />
                      </button>

                      <button
                        type="button"
                        className="fat-icon-action ghost"
                        onClick={cancelarEdicaoBeneficio}
                        title="Cancelar"
                      >
                        <XIcon size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </Modal>

      <Modal
        open={confirmDeleteOpen}
        title="Confirmar exclusão"
        onClose={cancelarExclusaoColaborador}
      >
        <div className="fat-confirm-content">
          <p>
            Tem certeza que deseja excluir o colaborador{' '}
            <strong>{getNomeColaborador(colaboradorParaExcluir)}</strong>
            {getCondominioRow(colaboradorParaExcluir)
              ? ` do condomínio ${getCondominioRow(colaboradorParaExcluir)}`
              : ''}
            ?
          </p>

          <small>
            Essa ação remove o colaborador somente desta repetição.
          </small>

          <div className="fat-modal-actions">
            <button
              type="button"
              className="fat-preview-btn ghost"
              onClick={cancelarExclusaoColaborador}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="fat-preview-btn danger"
              onClick={confirmarExclusaoColaborador}
            >
              Confirmar exclusão
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}