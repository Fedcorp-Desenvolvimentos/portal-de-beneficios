import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import {
  FiDownload,
  FiSearch,
  FiCalendar,
  FiFileText,
  FiX,
  FiUpload,
  FiTrash2,
  FiInfo,
  FiCheckCircle,
  FiRefreshCw,
  FiEye,
} from 'react-icons/fi'
import { BiSpreadsheet } from 'react-icons/bi'

import { faturamentoService } from '../../services/faturamentoService'
import { entebenService } from '../../services/entebenService'
import PageLayout from '../../Layouts/PageLayout/PageLayout'
import { S } from './ColaboradorDashboardStyles'

// ============================================
// UTILITÁRIOS
// ============================================
const fmtDate = (s) => {
  if (!s) return '-'
  const value = String(s).trim()
  if (!value) return '-'
  if (value.includes('/')) return value

  if (value.includes('T')) {
    const date = new Date(value)
    if (!isNaN(date.getTime())) return date.toLocaleDateString('pt-BR')
  }

  const parts = value.split('-')

  if (parts.length === 3) {
    if (parts[0]?.length === 4) {
      const [y, m, d] = parts
      return `${d}/${m}/${y}`
    }
    const [d, m, y] = parts
    return y ? `${d}/${m}/${y}` : value
  }

  return value
}

const fmtMonthYear = (value) => {
  if (!value) return '-'
  const raw = String(value).trim()
  if (!raw) return '-'

  if (raw.includes('-')) {
    const parts = raw.split('-')
    if (parts.length >= 2) return `${parts[1]}/${parts[0]}`
  }

  const brMonthYear = raw.match(/^(0?[1-9]|1[0-2])\/(\d{4})$/)
  if (brMonthYear) {
    const [, month, year] = brMonthYear
    return `${month.padStart(2, '0')}/${year}`
  }

  const isoMonthYear = raw.match(/^(\d{4})-(0?[1-9]|1[0-2])$/)
  if (isoMonthYear) {
    const [, year, month] = isoMonthYear
    return `${month.padStart(2, '0')}/${year}`
  }

  return fmtDate(raw)
}

const fmtMoney = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const norm = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const statusMap = {
  AGUARDANDO_FATURAMENTO: 'aprovado',
  EM_FATURAMENTO: 'em_faturamento',
  FATURADO: 'faturado',
  COMPRADO: 'comprado',
  CANCELADO: 'cancelado',
}

const normalizarStatus = (status) => {
  return statusMap[status] || statusMap[String(status || '').toUpperCase()] || 'aprovado'
}

const statusLabel = {
  aprovado: 'Aprovado',
  em_faturamento: 'Em faturamento',
  faturado: 'Faturado',
  comprado: 'Comprado',
  cancelado: 'Cancelado',
}

const statusRank = {
  aprovado: 1,
  em_faturamento: 2,
  faturado: 3,
  comprado: 4,
  cancelado: 99,
}

const timelineSteps = [
  {
    key: 'importacao',
    title: 'Importação recebida',
    description: 'Arquivo importado e processado no sistema.',
    minRank: 0,
  },
  {
    key: 'aprovado',
    title: 'Aprovado',
    description: 'Pedido liberado para iniciar o faturamento.',
    minRank: 1,
  },
  {
    key: 'em_faturamento',
    title: 'Em faturamento',
    description: 'Planilha de faturamento baixada/iniciada.',
    minRank: 2,
  },
  {
    key: 'faturado',
    title: 'Faturado',
    description: 'Documentos importados e faturamento finalizado.',
    minRank: 3,
  },
  {
    key: 'comprado',
    title: 'Comprado',
    description: 'Arquivo enviado para provedora de compra.',
    minRank: 4,
  },
]

const getTimelineItems = (pedido) => {
  const rankAtual = statusRank[pedido?.status] || 0

  const items = timelineSteps.map((step) => ({
    ...step,
    date:
      step.key === 'importacao'
        ? pedido?.dataImportacao
        : step.key === 'aprovado'
          ? pedido?.aprovadoEm
          : step.key === 'em_faturamento'
            ? pedido?.emFaturamentoEm
            : step.key === 'comprado'
              ? pedido?.compradoEm
              : pedido?.faturadoEm,
    done: rankAtual >= step.minRank,
    current: pedido?.status === step.key,
  }))

  if (pedido?.status === 'cancelado') {
    items.push({
      key: 'cancelado',
      title: 'Cancelado',
      description: pedido?.motivoCancelamento || 'Faturamento cancelado.',
      date: pedido?.canceladoEm,
      done: true,
      current: true,
    })
  }

  return items
}

const BENEFICIOS_POR_CODIGO = {
  204: 'Alimentação',
  207: 'Multibenefícios',
  27: 'Alimentação',
  28: 'Vale Combustível',
  201: 'Cesta',
  202: 'Boas Festas',
}

const BENEFICIOS_POR_SIGLA = {
  AXA: 'Alimentação',
  MBF: 'Multibenefícios',
  VBA: 'Alimentação',
  VBV: 'Vale Combustível',
  VCA: 'Cesta',
  NAT: 'Boas Festas',
  VT: 'Vale Transporte',
}

const normalizeBeneficioText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()

const firstValueFromObject = (obj, keys = []) => {
  if (!obj || typeof obj !== 'object') return ''

  for (const key of keys) {
    const value = obj?.[key]

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value
    }
  }

  return ''
}

const getPrimeiraMovimentacaoPedido = (pedidoApi) => {
  const listasPossiveis = [
    pedidoApi?.movimentacoes_detalhada,
    pedidoApi?.movimentacoes,
    pedidoApi?.data_to_backend?.movimentacoes_detalhada,
    pedidoApi?.data_to_backend?.movimentacoes,
    pedidoApi?.summary?.movimentacoes_detalhada,
  ]

  for (const lista of listasPossiveis) {
    if (Array.isArray(lista) && lista.length > 0) {
      return lista[0]
    }
  }

  return null
}

const getTipoBeneficioPedido = (pedidoApi) => {
  const primeiraMovimentacao = getPrimeiraMovimentacaoPedido(pedidoApi)

  const codigoRaw =
    firstValueFromObject(pedidoApi, [
      'beneficio_alterado_para_codigo',
      'codigo_produto',
      'produto_codigo',
      'cod_produto',
      'codigo',
      'codigo_beneficio',
      'tipo_beneficio_codigo',
    ]) ||
    firstValueFromObject(primeiraMovimentacao, [
      'beneficio_alterado_para_codigo',
      'codigo_produto',
      'produto_codigo',
      'cod_produto',
      'codigo',
      'codigo_beneficio',
      'tipo_beneficio_codigo',
    ])

  const codigo = Number(codigoRaw)

  if (!Number.isNaN(codigo) && BENEFICIOS_POR_CODIGO[codigo]) {
    return BENEFICIOS_POR_CODIGO[codigo]
  }

  const sigla = normalizeBeneficioText(
    firstValueFromObject(pedidoApi, [
      'beneficio_alterado_para_sigla',
      'sigla_produto',
      'sigla',
      'tipo_beneficio_sigla',
    ]) ||
      firstValueFromObject(primeiraMovimentacao, [
        'beneficio_alterado_para_sigla',
        'sigla_produto',
        'sigla',
        'tipo_beneficio_sigla',
      ])
  )

  if (sigla && BENEFICIOS_POR_SIGLA[sigla]) {
    return BENEFICIOS_POR_SIGLA[sigla]
  }

  const descricao = normalizeBeneficioText(
    firstValueFromObject(pedidoApi, [
      'beneficio_alterado_para',
      'beneficio_alterado_para_descricao',
      'tipo_beneficio',
      'nome_beneficio',
      'beneficio_nome',
      'beneficio',
      'nome_produto',
      'produto_nome',
      'produto',
      'descricao_produto',
      'descricao',
    ]) ||
      firstValueFromObject(primeiraMovimentacao, [
        'beneficio_alterado_para',
        'beneficio_alterado_para_descricao',
        'tipo_beneficio',
        'nome_beneficio',
        'beneficio_nome',
        'beneficio',
        'nome_produto',
        'produto_nome',
        'produto',
        'descricao_produto',
        'descricao',
      ])
  )

  if (
    descricao.includes('COMBUSTIVEL') ||
    descricao.includes('COMBUSTÍVEL') ||
    descricao === 'AUTO'
  ) {
    return 'Vale Combustível'
  }

  if (descricao.includes('TRANSPORTE')) {
    return 'Vale Transporte'
  }

  if (descricao.includes('MULTIBENEFICIO') || descricao.includes('MULTIBENEFICIOS')) {
    return 'Multibenefícios'
  }

  if (descricao.includes('CESTA')) {
    return 'Cesta'
  }

  if (descricao.includes('BOAS FESTAS') || descricao.includes('NATAL')) {
    return 'Boas Festas'
  }

  if (descricao.includes('ALIMENTACAO') || descricao.includes('REFEICAO')) {
    return 'Alimentação/Refeição'
  }

  const modelo = normalizeBeneficioText(pedidoApi?.modelo_importacao)

  if (modelo.includes('VT')) {
    return 'Vale Transporte'
  }

  if (modelo.includes('AUTO') || modelo.includes('COMBUSTIVEL')) {
    return 'Vale Combustível'
  }

  if (modelo.includes('VR')) {
    return 'Alimentação/Refeição'
  }

  return '-'
}

const extrairResumoPedido = (pedidoApi) => ({
  id: pedidoApi.id,
  downloadId:
    pedidoApi.faturamento_id ||
    pedidoApi.faturamento?.id ||
    pedidoApi.importacao_id ||
    pedidoApi.id,
  nomeAdministradora: pedidoApi.nome_administradora || '-',
  fileId: pedidoApi.file_upload_id || pedidoApi.file || null,
  status: normalizarStatus(pedidoApi.status),
  dataVencimento: pedidoApi.data_vencimento,
  mesUtilizacao: fmtMonthYear(pedidoApi.vigencia_inicio || pedidoApi.competencia),
  quantidadeDias: pedidoApi.quantidade_dias || '-',
  dataImportacao: pedidoApi.data_importacao,
  tipoBeneficio: getTipoBeneficioPedido(pedidoApi),
  valorTotal: parseFloat(pedidoApi.valor_total || 0),
  totalFuncionarios: pedidoApi.total_funcionarios || pedidoApi.registros_processados || 0,
  nomeCondominio: pedidoApi.nome_condominio || `Pedido ${pedidoApi.id}`,
  cnpj: pedidoApi.cnpj || '-',
  cidade: pedidoApi.cidade || '-',
  uf: pedidoApi.uf || '-',
  importadoEm: pedidoApi.data_importacao,
  aprovadoEm: pedidoApi.data_aprovacao || pedidoApi.data_importacao,
  emFaturamentoEm: pedidoApi.data_em_faturamento || null,
  faturadoEm: pedidoApi.data_faturamento || null,
  canceladoEm: pedidoApi.data_cancelamento || null,
  motivoCancelamento: pedidoApi.motivo_cancelamento || '',
  compradoEm: pedidoApi.data_compra || pedidoApi.data_comprado || null,
})

// ============================================
// SKELETON COMPONENTS
// ============================================
const SkeletonStats = () => (
  <S.PageHeader>
    <S.StatsMini>
      {[...Array(3)].map((_, i) => (
        <S.StatMini key={i} $color="#94a3b8">
          <S.SkeletonLine $width="40px" $height="28px" $marginBottom="4px" />
          <S.SkeletonLine $width="80px" $height="12px" />
        </S.StatMini>
      ))}
    </S.StatsMini>
  </S.PageHeader>
)

const SkeletonFilters = () => (
  <S.Filters>
    <S.Search style={{ position: 'relative' }}>
      <S.SkeletonIcon $width="15px" $height="15px" />
      <S.SkeletonLine $width="100%" $height="40px" $borderRadius="12px" />
    </S.Search>
    <S.SkeletonLine $width="180px" $height="40px" $borderRadius="12px" />
  </S.Filters>
)

const SkeletonTableRow = () => (
  <tr>
    <td>
      <S.SkeletonLine $width="80px" $height="18px" $marginBottom="6px" />
      <S.SkeletonLine $width="100px" $height="12px" />
    </td>
    <td>
      <S.SkeletonLine $width="140px" $height="16px" />
    </td>
    <td>
      <S.SkeletonLine $width="90px" $height="14px" />
    </td>
    <td>
      <S.SkeletonLine $width="70px" $height="14px" />
    </td>
    <td>
      <S.SkeletonLine $width="80px" $height="18px" />
    </td>
    <td>
      <S.SkeletonLine $width="120px" $height="32px" $borderRadius="8px" />
    </td>
    <td>
      <S.SkeletonLine $width="50px" $height="28px" $borderRadius="6px" />
    </td>
    <td>
      <S.SkeletonLine $width="70px" $height="28px" $borderRadius="6px" />
    </td>
    <td>
      <S.SkeletonLine $width="70px" $height="28px" $borderRadius="6px" />
    </td>
    <td>
      <S.SkeletonLine $width="60px" $height="28px" $borderRadius="6px" />
    </td>
  </tr>
)

const SkeletonTable = () => (
  <S.TableWrap>
    <S.Table>
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Administradora</th>
          <th>Vencimento</th>
          <th>Competência</th>
          <th>Valor</th>
          <th>Status</th>
          {/* <th>Timeline</th> */}
          <th>Excel</th>
          <th>Docs</th>
          <th>Compra</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, i) => (
          <SkeletonTableRow key={i} />
        ))}
      </tbody>
    </S.Table>
  </S.TableWrap>
)

const SkeletonPagination = () => (
  <S.Pagination>
    <S.SkeletonLine $width="250px" $height="16px" />
    <S.PaginationActions className="actions">
      <S.SkeletonLine $width="80px" $height="34px" $borderRadius="8px" />
      <S.SkeletonLine $width="100px" $height="16px" />
      <S.SkeletonLine $width="80px" $height="34px" $borderRadius="8px" />
    </S.PaginationActions>
  </S.Pagination>
)

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ColaboradorDashboard() {
  const { enqueueSnackbar } = useSnackbar()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  const [importOpen, setImportOpen] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [docsOpen, setDocsOpen] = useState(false)
  const [docsPedido, setDocsPedido] = useState(null)
  const [docDownloading, setDocDownloading] = useState('')

  const [refazendoId, setRefazendoId] = useState(null)
  const [isRefazendo, setIsRefazendo] = useState(false)
  const [refazerConfirm, setRefazerConfirm] = useState({
    open: false,
    pedido: null,
  })

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsPedido, setDetailsPedido] = useState(null)

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [cancelPedido, setCancelPedido] = useState(null)
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  const [confirm, setConfirm] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  })

  const [confirmFinalize, setConfirmFinalize] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  })

  const [statusConfirm, setStatusConfirm] = useState({
    open: false,
    pedido: null,
    newStatus: '',
  })

  const [statusChanging, setStatusChanging] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10
  const fileRef = useRef(null)

  const showToast = (message, options = {}) => {
    enqueueSnackbar(message, {
      variant: options.variant || 'info',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      ...options,
    })
  }

  async function carregarPedidos() {
    try {
      setLoading(true)
      const response = await faturamentoService.listarPedidosFuncionario()

      let lista = []

      if (Array.isArray(response)) lista = response
      else if (response?.results && Array.isArray(response.results)) lista = response.results
      else if (response?.data && Array.isArray(response.data)) lista = response.data
      else lista = []

      const pedidosFormatados = lista.map(extrairResumoPedido)
      setPedidos(pedidosFormatados)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      showToast('Não foi possível carregar os pedidos.', { variant: 'error' })
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPedidos()
  }, [])

  const stats = useMemo(
    () => ({
      total: pedidos.length,
      aprovados: pedidos.filter((p) => p.status === 'aprovado').length,
      emFat: pedidos.filter((p) => p.status === 'em_faturamento').length,
      faturados: pedidos.filter((p) => p.status === 'faturado').length,
      comprado: pedidos.filter((p) => p.status === 'comprado').length,
      cancelados: pedidos.filter((p) => p.status === 'cancelado').length,
    }),
    [pedidos]
  )

  const filtered = useMemo(() => {
    const q = norm(search)

    return pedidos.filter((p) => {
      const hay = norm(
        [
          p.id,
          p.nomeAdministradora,
          p.tipoBeneficio,
          p.mesUtilizacao,
          p.dataVencimento,
          p.nomeCondominio,
          p.cnpj,
          p.cidade,
          p.uf,
        ].join(' ')
      )

      return (!q || hay.includes(q)) && (statusFilter === 'todos' || p.status === statusFilter)
    })
  }, [pedidos, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))

  const paginatedPedidos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  async function handleDownload(pedido) {
    if (pedido.status === 'cancelado') {
      showToast('Não é possível baixar o faturamento de um pedido cancelado.', {
        variant: 'warning',
      })
      return
    }

    try {
      setDownloadingId(pedido.id)

      await faturamentoService.baixarExportFaturamento(
        { importacao_id: pedido.id },
        `pedido-${pedido.id}.xlsx`
      )

      setPedidos((prev) =>
        prev.map((item) =>
          item.id === pedido.id
            ? {
                ...item,
                status: 'em_faturamento',
                emFaturamentoEm: new Date().toISOString(),
              }
            : item
        )
      )

      showToast(`O pedido ${pedido.id} foi movido para "Em faturamento".`, {
        variant: 'success',
      })
    } catch (error) {
      console.error('Erro no download:', error)

      showToast(error?.message || 'Não foi possível baixar a planilha deste pedido.', {
        variant: 'error',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleChangeStatus(pedido, newStatus) {
    if (newStatus === 'cancelado') {
      setCancelPedido(pedido)
      setCancelReason('')
      setCancelError('')
      setCancelOpen(true)
      return
    }

    await faturamentoService.alterarStatusPedido(pedido.id, newStatus)

    setPedidos((prev) =>
      prev.map((item) =>
        item.id === pedido.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    )

    showToast(`Pedido ${pedido.id} alterado para "${statusLabel[newStatus]}".`, {
      variant: 'success',
    })
  }

  function requestStatusChange(pedido, newStatus) {
    if (!pedido || !newStatus || newStatus === pedido.status) return

    if (newStatus === 'cancelado') {
      setCancelPedido(pedido)
      setCancelReason('')
      setCancelError('')
      setStatusConfirm({ open: false, pedido: null, newStatus: '' })
      setCancelOpen(true)
      return
    }

    setStatusConfirm({
      open: true,
      pedido,
      newStatus,
    })
  }

  async function confirmStatusChange() {
    if (!statusConfirm.pedido || !statusConfirm.newStatus || statusChanging) return

    try {
      setStatusChanging(true)
      await handleChangeStatus(statusConfirm.pedido, statusConfirm.newStatus)
      setStatusConfirm({
        open: false,
        pedido: null,
        newStatus: '',
      })
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      showToast(error?.message || 'Não foi possível alterar o status.', {
        variant: 'error',
      })
    } finally {
      setStatusChanging(false)
    }
  }

  function cancelStatusChange() {
    if (statusChanging) return

    setStatusConfirm({
      open: false,
      pedido: null,
      newStatus: '',
    })
  }

  async function handleCancelBilling() {
    const motivo = cancelReason.trim()

    if (!cancelPedido?.id) {
      showToast('Pedido inválido para cancelamento.', {
        variant: 'error',
      })
      return
    }

    if (!motivo) {
      setCancelError('Informe o motivo do cancelamento.')
      return
    }

    if (motivo.length < 5) {
      setCancelError('Descreva um motivo mais claro para o cancelamento.')
      return
    }

    try {
      setCancelSubmitting(true)

      await faturamentoService.alterarStatusPedido(cancelPedido.id, 'cancelado', motivo)

      setPedidos((prev) =>
        prev.map((item) =>
          item.id === cancelPedido.id
            ? {
                ...item,
                status: 'cancelado',
                motivoCancelamento: motivo,
                canceladoEm: new Date().toISOString(),
              }
            : item
        )
      )

      showToast(`O pedido ${cancelPedido.id} foi cancelado.`, {
        variant: 'warning',
      })

      setCancelOpen(false)
      setCancelPedido(null)
      setCancelReason('')
      setCancelError('')
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      showToast(error?.message || 'Não foi possível cancelar o pedido.', {
        variant: 'error',
      })
    } finally {
      setCancelSubmitting(false)
    }
  }

  function openImport(pedido, options = {}) {
    const { refazendo = false } = options

    if (pedido.status === 'cancelado') {
      showToast('Este pedido está cancelado.', { variant: 'info' })
      return
    }

    if (!refazendo && pedido.status === 'comprado') {
      showToast('Este pedido já foi comprado. Use "Refazer" para reenviar documentos.', {
        variant: 'info',
      })
      return
    }

    if (!refazendo && pedido.status === 'faturado') {
      showToast('Este pedido já foi faturado. Use "Refazer" para reenviar documentos.', {
        variant: 'info',
      })
      return
    }

    setSelectedPedido({
      ...pedido,
      refazendo,
    })
    setDocs([])
    setImportOpen(true)
  }

  function requestRefazerFaturamento(pedido) {
    if (!pedido) return

    if (pedido.status === 'cancelado') {
      showToast('Não é possível refazer um pedido cancelado.', {
        variant: 'warning',
      })
      return
    }

    if (!['faturado', 'comprado'].includes(pedido.status)) {
      showToast('Só é possível refazer pedidos faturados ou comprados.', {
        variant: 'warning',
      })
      return
    }

    setRefazerConfirm({
      open: true,
      pedido,
    })
  }

  async function confirmarRefazerFaturamento() {
    const pedido = refazerConfirm.pedido

    if (!pedido?.id || refazendoId === pedido.id) return

    try {
      setRefazendoId(pedido.id)
      setIsRefazendo(true)

      if (typeof faturamentoService.refazerFaturamento === 'function') {
        await faturamentoService.refazerFaturamento(pedido.id)
      } else {
        await faturamentoService.alterarStatusPedido(
          pedido.id,
          'em_faturamento',
          'Refazendo faturamento'
        )
      }

      const pedidoAtualizado = {
        ...pedido,
        status: 'em_faturamento',
        faturadoEm: null,
        compradoEm: null,
        refazendo: true,
      }

      setPedidos((prev) =>
        prev.map((item) => (item.id === pedido.id ? pedidoAtualizado : item))
      )

      setRefazerConfirm({
        open: false,
        pedido: null,
      })

      showToast(`Pedido ${pedido.id} liberado para refazer faturamento.`, {
        variant: 'success',
      })

      openImport(pedidoAtualizado, { refazendo: true })
    } catch (error) {
      console.error('Erro ao refazer faturamento:', error)
      showToast(error?.message || 'Não foi possível refazer o faturamento.', {
        variant: 'error',
      })
    } finally {
      setRefazendoId(null)
      setIsRefazendo(false)
    }
  }

  function cancelRefazerFaturamento() {
    if (isRefazendo) return

    setRefazerConfirm({
      open: false,
      pedido: null,
    })
  }

  async function handleCompra(pedido) {
    if (pedido.status !== 'faturado') {
      showToast('A compra só fica disponível para pedidos faturados.', {
        variant: 'warning',
      })
      return
    }

    const isVT = pedido.tipoBeneficio?.includes('Transporte')

    try {
      setDownloadingId(pedido.id)

      if (isVT) {
        await faturamentoService.baixarExcelCompraVT(
          { importacao_id: pedido.id },
          `compra-vt-${pedido.id}`
        )
      } else {
        await faturamentoService.baixarTxtCompra(
          { importacao_id: pedido.id },
          `compra-${pedido.id}`
        )
      }

      setPedidos((prev) =>
        prev.map((item) =>
          item.id === pedido.id
            ? {
                ...item,
                status: 'comprado',
                compradoEm: new Date().toISOString(),
              }
            : item
        )
      )

      showToast(
        isVT
          ? `Excel de compra VT do pedido ${pedido.id} baixado com sucesso.`
          : `TXT do pedido ${pedido.id} baixado com sucesso.`,
        { variant: 'success' }
      )
    } catch (error) {
      console.error('Erro ao baixar arquivo de compra:', error)
      showToast(error?.message || 'Não foi possível baixar o arquivo de compra.', {
        variant: 'error',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  function closeImport() {
    if (uploading) return
    setImportOpen(false)
    setSelectedPedido(null)
    setDocs([])
  }

  function handleFiles(list) {
    const allowed = []
    const rejected = []

    for (const f of Array.from(list || [])) {
      if (/\.(pdf|xml|png|jpg|jpeg)$/i.test(f.name)) allowed.push(f)
      else rejected.push(f)
    }

    if (rejected.length) {
      showToast(
        `Formatos aceitos: PDF, XML, PNG, JPG. Ignorados: ${rejected
          .slice(0, 3)
          .map((r) => r.name)
          .join(', ')}`,
        {
          variant: 'warning',
        }
      )
    }

    setDocs((prev) => {
      const keys = new Set(prev.map((f) => `${f.name}-${f.size}`))
      return [...prev, ...allowed.filter((f) => !keys.has(`${f.name}-${f.size}`))]
    })
  }

  function requestRemove(idx) {
    const file = docs[idx]

    setConfirm({
      open: true,
      title: 'Remover documento',
      message: `Remover "${file?.name}" da lista?`,
      onConfirm: () => {
        setDocs((prev) => prev.filter((_, i) => i !== idx))
        setConfirm({
          open: false,
          title: '',
          message: '',
          onConfirm: null,
        })
        showToast('Documento removido da lista.', {
          variant: 'info',
        })
      },
    })
  }

  function requestFinalizeImport() {
    if (!docs.length) {
      showToast('Selecione pelo menos um documento.', {
        variant: 'warning',
      })
      return
    }

    const isRefazendoPedido = selectedPedido?.refazendo

    setConfirmFinalize({
      open: true,
      title: isRefazendoPedido ? 'Confirmar reenvio de documentos' : 'Confirmar importação',
      message: isRefazendoPedido
        ? 'Ao reenviar a documentação, os documentos anteriores deste pedido poderão ser substituídos e o pedido voltará para faturado. Deseja continuar?'
        : 'Ao importar a documentação, o pedido ficará disponível para o funcionário. Deseja continuar?',
      onConfirm: async () => {
        setConfirmFinalize({
          open: false,
          title: '',
          message: '',
          onConfirm: null,
        })
        await handleUpload()
      },
    })
  }

  async function handleUpload() {
    if (!docs.length || !selectedPedido?.id) return

    const arquivoBoleto = docs.find((file) => {
      const name = file.name.toLowerCase()
      return name.includes('boleto') || name.includes('recibo')
    })

    const arquivoNotaDebito = docs.find((file) => {
      const name = file.name.toLowerCase()
      return name.includes('debito') || name.includes('débito')
    })

    const arquivoNotaFiscal = docs.find((file) => {
      const name = file.name.toLowerCase()
      return name.includes('fiscal') || name.includes('nota_fiscal') || name.includes('nf')
    })

    if (!arquivoBoleto && !arquivoNotaDebito && !arquivoNotaFiscal) {
      showToast('Envie boleto/recibo, nota de débito ou nota fiscal.', {
        variant: 'warning',
      })
      return
    }

    try {
      setUploading(true)
      setUploadProgress(1)

      await faturamentoService.importarDocumentos(
        {
          importacaoId: selectedPedido.id,
          competencia:
            selectedPedido.competencia ||
            selectedPedido.dataVencimento ||
            selectedPedido.mesUtilizacao,
          arquivoBoleto,
          arquivoNotaDebito,
          arquivoNotaFiscal,
        },
        (percent) => setUploadProgress(percent)
      )

      setUploadProgress(100)

      await faturamentoService.alterarStatusPedido(
        selectedPedido.id,
        'faturado',
        selectedPedido.refazendo ? 'Documentos reenviados no refaturamento' : undefined
      )

      setPedidos((prev) =>
        prev.map((item) =>
          item.id === selectedPedido.id
            ? {
                ...item,
                status: 'faturado',
                importadoEm: new Date().toISOString(),
                faturadoEm: new Date().toISOString(),
                compradoEm: null,
              }
            : item
        )
      )

      showToast(
        selectedPedido.refazendo
          ? `Documentos reenviados para o pedido ${selectedPedido.id}.`
          : `Documentos enviados para ${selectedPedido.id}.`,
        {
          variant: 'success',
        }
      )

      setConfirmFinalize({
        open: false,
        title: '',
        message: '',
        onConfirm: null,
      })

      closeImport()
      await carregarPedidos()
    } catch (error) {
      console.error('Erro ao importar:', error)
      showToast(error?.message || 'Não foi possível concluir a importação.', {
        variant: 'error',
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  function abrirDocsImportados(pedido) {
    if (!pedido?.id) {
      showToast('Pedido inválido para consulta de documentos.', {
        variant: 'error',
      })
      return
    }

    setDocsPedido(pedido)
    setDocsOpen(true)
  }

  function fecharDocsImportados() {
    if (docDownloading) return

    setDocsOpen(false)
    setDocsPedido(null)
  }

  async function baixarDocumentoFaturamento(pedido, tipo = '') {
    const faturamentoId = pedido?.downloadId || pedido?.faturamento_id || pedido?.id

    if (!faturamentoId) {
      showToast('ID do faturamento não encontrado para download.', {
        variant: 'error',
      })
      return
    }

    try {
      const key = `${faturamentoId}-${tipo}`
      setDocDownloading(key)

      const blob = await entebenService.downloadDocumentoFaturamento(faturamentoId, tipo)
      const fileURL = window.URL.createObjectURL(blob)

      const nomeArquivo =
        tipo !== 'originais/'
          ? `${tipo.replaceAll('/', '').replaceAll('-', '_')}-${faturamentoId}.pdf`
          : `faturamento-${faturamentoId}.zip`

      const a = document.createElement('a')
      a.href = fileURL
      a.download = nomeArquivo
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(fileURL)

      showToast(`Download iniciado: ${nomeArquivo}`, {
        variant: 'success',
      })
    } catch (error) {
      console.error('Erro ao baixar documento:', error)

      showToast(error?.message || 'Não foi possível baixar o documento.', {
        variant: 'error',
      })
    } finally {
      setDocDownloading('')
    }
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key !== 'Escape') return

      if (refazerConfirm.open && !isRefazendo) {
        cancelRefazerFaturamento()
      } else if (statusConfirm.open && !statusChanging) {
        cancelStatusChange()
      } else if (confirm.open) {
        setConfirm({
          open: false,
          title: '',
          message: '',
          onConfirm: null,
        })
      } else if (confirmFinalize.open && !uploading) {
        setConfirmFinalize({
          open: false,
          title: '',
          message: '',
          onConfirm: null,
        })
      } else if (cancelOpen && !cancelSubmitting) {
        setCancelOpen(false)
        setCancelPedido(null)
        setCancelReason('')
        setCancelError('')
      } else if (importOpen && !uploading) {
        closeImport()
      } else if (docsOpen && !docDownloading) {
        fecharDocsImportados()
      } else if (detailsOpen) {
        setDetailsOpen(false)
        setDetailsPedido(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [
    importOpen,
    confirm.open,
    confirmFinalize.open,
    cancelOpen,
    uploading,
    detailsOpen,
    docsOpen,
    docDownloading,
    statusConfirm.open,
    statusChanging,
    refazerConfirm.open,
    isRefazendo,
    cancelSubmitting,
  ])

  return (
    <PageLayout
      title="Dashboard do Colaborador"
      subtitle="Gerencie seus pedidos de faturamento, acompanhe o status e importe documentos."
    >
      <S.Root>
        {loading ? (
          <>
            <SkeletonStats />
            <SkeletonFilters />
            <SkeletonTable />
            <SkeletonPagination />
          </>
        ) : (
          <>
            <S.PageHeader>
              <S.StatsMini>
                <S.StatMini $color="#16a34a">
                  <span className="value">{stats.aprovados}</span>
                  <span className="label">Aprovados</span>
                </S.StatMini>

                <S.StatMini $color="#d97706">
                  <span className="value">{stats.emFat}</span>
                  <span className="label">Em Faturamento</span>
                </S.StatMini>

                <S.StatMini $color="#2563eb">
                  <span className="value">{stats.faturados}</span>
                  <span className="label">Faturados</span>
                </S.StatMini>
              </S.StatsMini>
            </S.PageHeader>

            <S.Filters>
              <S.Search>
                <FiSearch size={15} />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por pedido, administradora, CNPJ..."
                />

                {search && (
                  <S.SearchClear onClick={() => setSearch('')}>
                    <FiX size={14} />
                  </S.SearchClear>
                )}
              </S.Search>

              <S.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="todos">Todos os status</option>
                <option value="aprovado">Aprovados</option>
                <option value="em_faturamento">Em faturamento</option>
                <option value="faturado">Faturados</option>
                <option value="comprado">Comprado</option>
                <option value="cancelado">Cancelados</option>
              </S.Select>
            </S.Filters>

            <S.TableWrap>
              <S.Table>
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Administradora</th>
                    <th>Vencimento</th>
                    <th>Competência</th>
                    <th>Valor</th>
                    <th>Status</th>
                    {/* <th>Timeline</th> */}
                    <th>Excel</th>
                    <th>Docs</th>
                    <th>Compra</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <S.Empty colSpan={10}>Nenhum pedido encontrado.</S.Empty>
                    </tr>
                  ) : (
                    paginatedPedidos.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <S.IdMain>Pedido #{p.id}</S.IdMain>
                          <S.IdSub>{p.tipoBeneficio}</S.IdSub>

                          {p.status === 'cancelado' && p.motivoCancelamento && (
                            <S.IdSub style={{ color: '#b91c1c' }}>
                              Motivo: {p.motivoCancelamento}
                            </S.IdSub>
                          )}
                        </td>

                        <S.AdminCell>
                          <S.AdminName>{p.nomeAdministradora}</S.AdminName>
                        </S.AdminCell>

                        <td>
                          <S.Inline>
                            <FiCalendar size={14} />
                            {fmtDate(p.dataVencimento)}
                          </S.Inline>
                        </td>

                        <td style={{ fontSize: 13 }}>{p.mesUtilizacao}</td>

                        <td style={{ fontWeight: 600, color: '#16a34a' }}>
                          {fmtMoney(p.valorTotal)}
                        </td>

                        <td>
                          <S.StatusSelect $status={p.status}>
                            <select
                              value={p.status}
                              disabled={statusChanging || cancelSubmitting}
                              onChange={(e) => requestStatusChange(p, e.target.value)}
                            >
                              <option value="aprovado">Aprovado</option>
                              <option value="em_faturamento">Em faturamento</option>
                              <option value="faturado">Faturado</option>
                              <option value="comprado">Comprado</option>
                              <option value="cancelado">Cancelar</option>
                            </select>
                          </S.StatusSelect>
                        </td>

                        {/* <td>
                          <S.Btn
                            $size="sm"
                            onClick={() => {
                              setDetailsPedido(p)
                              setDetailsOpen(true)
                            }}
                            title="Ver timeline"
                          >
                            <FiInfo size={14} />
                            Ver
                          </S.Btn>
                        </td> */}

                        <td>
                          <S.Btn
                            onClick={() => handleDownload(p)}
                            disabled={downloadingId === p.id || p.status === 'cancelado'}
                          >
                            <FiDownload size={14} />
                            {/* {downloadingId === p.id ? 'Baixando…' : 'Baixar'} */}
                          </S.Btn>
                        </td>

                        <td>
                          {['faturado', 'comprado'].includes(p.status) ? (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <S.Btn
                                onClick={() => abrirDocsImportados(p)}
                                title="Ver documentos importados"
                              >
                                <FiEye size={14} />
                                
                              </S.Btn>

                              <S.Btn
                                onClick={() => requestRefazerFaturamento(p)}
                                disabled={p.status === 'cancelado' || refazendoId === p.id}
                                title="Refazer faturamento e reenviar documentos"
                              >
                                <FiRefreshCw size={14} />
                                {/* {refazendoId === p.id ? 'Refazendo…' : 'Refazer'} */}
                              </S.Btn>
                            </div>
                          ) : (
                            <S.Btn
                              onClick={() => openImport(p)}
                              disabled={p.status === 'cancelado'}
                            >
                              <BiSpreadsheet size={14} />
                              Importar
                            </S.Btn>
                          )}
                        </td>

                        <td>
                          {p.status === 'faturado' ? (
                            <S.Btn
                              $variant="primary"
                              onClick={() => handleCompra(p)}
                              disabled={downloadingId === p.id}
                            >
                              <FiDownload size={14} />
                              {downloadingId === p.id ? 'Baixando…' : 'Compra'}
                            </S.Btn>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </S.Table>
            </S.TableWrap>

            {filtered.length > 0 && (
              <S.Pagination>
                <S.PaginationInfo>
                  Mostrando {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}{' '}
                  pedidos
                </S.PaginationInfo>

                <S.PaginationActions className="actions">
                  <S.Btn
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </S.Btn>

                  <S.PaginationPage>
                    Página {currentPage} de {totalPages}
                  </S.PaginationPage>

                  <S.Btn
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </S.Btn>
                </S.PaginationActions>
              </S.Pagination>
            )}
          </>
        )}
      </S.Root>

      {/* Modal de Timeline */}
      {detailsOpen && detailsPedido && (
        <S.Overlay
          onMouseDown={(e) =>
            e.target === e.currentTarget && (setDetailsOpen(false), setDetailsPedido(null))
          }
        >
          <S.Modal style={{ maxWidth: 520 }}>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Timeline do pedido</S.ModalTitle>
                <S.ModalSub>
                  Pedido {detailsPedido.id} · {detailsPedido.nomeCondominio}
                </S.ModalSub>
              </div>

              <S.ModalClose
                onClick={() => {
                  setDetailsOpen(false)
                  setDetailsPedido(null)
                }}
              >
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.ModalBody>
              <S.Timeline>
                {getTimelineItems(detailsPedido).map((item) => (
                  <S.TimelineStep key={item.key}>
                    <S.TimelineMarker $done={item.done} $current={item.current}>
                      {item.done ? <FiCheckCircle size={14} /> : <span />}
                    </S.TimelineMarker>

                    <S.TimelineContent $current={item.current}>
                      <S.TimelineTop>
                        <strong>{item.title}</strong>
                        <span>{item.date ? fmtDate(item.date) : 'Pendente'}</span>
                      </S.TimelineTop>

                      <S.TimelineDescription>{item.description}</S.TimelineDescription>
                    </S.TimelineContent>
                  </S.TimelineStep>
                ))}
              </S.Timeline>
            </S.ModalBody>
          </S.Modal>
        </S.Overlay>
      )}

      {/* Modal de Documentos Importados */}
      {docsOpen && docsPedido && (
        <S.Overlay
          onMouseDown={(e) =>
            e.target === e.currentTarget && !docDownloading && fecharDocsImportados()
          }
        >
          <S.Modal style={{ maxWidth: 560 }}>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Documentos importados</S.ModalTitle>
                <S.ModalSub>
                  Pedido {docsPedido.id} · {docsPedido.nomeCondominio}
                </S.ModalSub>
              </div>

              <S.ModalClose onClick={fecharDocsImportados} disabled={!!docDownloading}>
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.ModalBody>
              <S.ConfirmMsg>
                Baixe os documentos gerados/importados para este faturamento.
              </S.ConfirmMsg>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <S.Btn
                  onClick={() => baixarDocumentoFaturamento(docsPedido, 'boleto-original/')}
                  disabled={!!docDownloading}
                >
                  <FiDownload size={14} />
                  {docDownloading === `${docsPedido.downloadId || docsPedido.id}-boleto-original/`
                    ? 'Baixando...'
                    : 'Boleto'}
                </S.Btn>

                <S.Btn
                  onClick={() => baixarDocumentoFaturamento(docsPedido, 'nota-fiscal-original/')}
                  disabled={!!docDownloading}
                >
                  <FiDownload size={14} />
                  {docDownloading === `${docsPedido.downloadId || docsPedido.id}-nota-fiscal-original/`
                    ? 'Baixando...'
                    : 'NF'}
                </S.Btn>

                <S.Btn
                  onClick={() => baixarDocumentoFaturamento(docsPedido, 'nota-debito-original/')}
                  disabled={!!docDownloading}
                >
                  <FiDownload size={14} />
                  {docDownloading === `${docsPedido.downloadId || docsPedido.id}-nota-debito-original/`
                    ? 'Baixando...'
                    : 'Nota Débito'}
                </S.Btn>

                <S.Btn
                  $variant="primary"
                  onClick={() => baixarDocumentoFaturamento(docsPedido, 'originais/')}
                  disabled={!!docDownloading}
                >
                  <FiDownload size={14} />
                  {docDownloading === `${docsPedido.downloadId || docsPedido.id}-originais/`
                    ? 'Baixando...'
                    : 'Baixar todos'}
                </S.Btn>
              </div>
            </S.ModalBody>

            <S.ModalFooter>
              <S.Btn onClick={fecharDocsImportados} disabled={!!docDownloading}>
                Fechar
              </S.Btn>
            </S.ModalFooter>
          </S.Modal>
        </S.Overlay>
      )}

      {/* Modal de Importação / Reenvio */}
      {importOpen && selectedPedido && (
        <S.Overlay
          onMouseDown={(e) => e.target === e.currentTarget && !uploading && closeImport()}
        >
          <S.Modal>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>
                  {selectedPedido.refazendo ? 'Reenviar documentos' : 'Importar documentos'}
                </S.ModalTitle>

                <S.ModalSub>
                  Pedido {selectedPedido.id} · {selectedPedido.nomeCondominio}
                </S.ModalSub>
              </div>

              <S.ModalClose onClick={closeImport} disabled={uploading}>
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.ModalBody>
              <S.Dropzone
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (!uploading) handleFiles(e.dataTransfer.files)
                }}
                onClick={() => !uploading && fileRef.current?.click()}
              >
                <S.DropzoneIcon>
                  <FiUpload size={16} />
                </S.DropzoneIcon>

                <div>
                  <S.DropzoneTitle>Arraste ou clique para selecionar</S.DropzoneTitle>
                  <S.DropzoneHint>PDF, XML, PNG, JPG · múltiplos arquivos</S.DropzoneHint>
                </div>

                <S.FileInput
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.xml,.png,.jpg,.jpeg"
                  onChange={(e) => handleFiles(e.target.files)}
                  disabled={uploading}
                />
              </S.Dropzone>

              {docs.length === 0 ? (
                <S.FilesEmpty>Nenhum documento selecionado ainda.</S.FilesEmpty>
              ) : (
                <S.FilesList>
                  {docs.map((f, i) => (
                    <S.FileRow key={`${f.name}-${f.size}-${i}`}>
                      <S.FileLeft>
                        <FiFileText size={15} />

                        <div>
                          <S.FileName>{f.name}</S.FileName>
                          <S.FileSub>
                            {(f.size / 1024).toFixed(1)} KB · {f.type || 'tipo desconhecido'}
                          </S.FileSub>
                        </div>
                      </S.FileLeft>

                      <S.FileRemove onClick={() => requestRemove(i)} disabled={uploading}>
                        <FiTrash2 size={14} />
                      </S.FileRemove>
                    </S.FileRow>
                  ))}
                </S.FilesList>
              )}

              {uploading && (
                <S.UploadProgress>
                  <S.UploadProgressTop>
                    <span>Enviando documentos...</span>
                    <strong>{uploadProgress}%</strong>
                  </S.UploadProgressTop>

                  <S.UploadProgressBar>
                    <S.UploadProgressFill style={{ width: `${uploadProgress}%` }} />
                  </S.UploadProgressBar>
                </S.UploadProgress>
              )}
            </S.ModalBody>

            <S.ModalFooter>
              <S.Btn onClick={closeImport} disabled={uploading}>
                Cancelar
              </S.Btn>

              <S.Btn
                $variant="primary"
                onClick={requestFinalizeImport}
                disabled={!docs.length || uploading}
              >
                <FiUpload size={14} />
                {uploading
                  ? `Enviando ${uploadProgress}%`
                  : selectedPedido.refazendo
                    ? 'Reenviar documentos'
                    : 'Enviar documentos'}
              </S.Btn>
            </S.ModalFooter>
          </S.Modal>
        </S.Overlay>
      )}

      {/* Modal de Cancelamento */}
      {cancelOpen && cancelPedido && (
        <S.Overlay
          onMouseDown={(e) =>
            e.target === e.currentTarget &&
            !cancelSubmitting &&
            (setCancelOpen(false),
            setCancelPedido(null),
            setCancelReason(''),
            setCancelError(''))
          }
        >
          <S.Modal style={{ maxWidth: 460 }}>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Cancelar faturamento</S.ModalTitle>
                <S.ModalSub>Pedido {cancelPedido.id}</S.ModalSub>
              </div>

              <S.ModalClose
                onClick={() => {
                  if (cancelSubmitting) return
                  setCancelOpen(false)
                  setCancelPedido(null)
                  setCancelReason('')
                  setCancelError('')
                }}
                disabled={cancelSubmitting}
              >
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.ModalBody>
              <S.FieldLabel htmlFor="cancel-reason">Motivo do cancelamento</S.FieldLabel>

              <S.Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value)
                  setCancelError('')
                }}
                placeholder="Descreva o motivo..."
                rows={4}
                disabled={cancelSubmitting}
              />

              {cancelError && <S.FieldError>{cancelError}</S.FieldError>}
            </S.ModalBody>

            <S.ModalFooter>
              <S.Btn
                onClick={() => {
                  if (cancelSubmitting) return
                  setCancelOpen(false)
                  setCancelPedido(null)
                  setCancelReason('')
                  setCancelError('')
                }}
                disabled={cancelSubmitting}
              >
                Voltar
              </S.Btn>

              <S.Btn
                $variant="primary"
                onClick={handleCancelBilling}
                disabled={cancelSubmitting}
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                {cancelSubmitting ? 'Cancelando...' : 'Confirmar cancelamento'}
              </S.Btn>
            </S.ModalFooter>
          </S.Modal>
        </S.Overlay>
      )}

      {/* Confirm Modal Genérico */}
      {confirm.open && (
        <S.Overlay
          onMouseDown={(e) =>
            e.target === e.currentTarget &&
            setConfirm({
              open: false,
              title: '',
              message: '',
              onConfirm: null,
            })
          }
        >
          <S.Modal style={{ maxWidth: 400 }}>
            <S.ModalHeader>
              <S.ModalTitle>{confirm.title}</S.ModalTitle>

              <S.ModalClose
                onClick={() =>
                  setConfirm({
                    open: false,
                    title: '',
                    message: '',
                    onConfirm: null,
                  })
                }
              >
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.ModalBody>
              <S.ConfirmMsg>{confirm.message}</S.ConfirmMsg>
            </S.ModalBody>

            <S.ModalFooter>
              <S.Btn
                onClick={() =>
                  setConfirm({
                    open: false,
                    title: '',
                    message: '',
                    onConfirm: null,
                  })
                }
              >
                Cancelar
              </S.Btn>

              <S.Btn
                $variant="primary"
                onClick={() => confirm.onConfirm && confirm.onConfirm()}
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
              >
                Remover
              </S.Btn>
            </S.ModalFooter>
          </S.Modal>
        </S.Overlay>
      )}

      {/* Confirm Finalize Modal */}
      {confirmFinalize.open && (
        <S.Overlay
          onMouseDown={(e) =>
            !uploading &&
            e.target === e.currentTarget &&
            setConfirmFinalize({
              open: false,
              title: '',
              message: '',
              onConfirm: null,
            })
          }
        >
          <S.Modal style={{ maxWidth: 400 }}>
            <S.ModalHeader>
              <S.ModalTitle>{confirmFinalize.title}</S.ModalTitle>

              <S.ModalClose
                onClick={() =>
                  !uploading &&
                  setConfirmFinalize({
                    open: false,
                    title: '',
                    message: '',
                    onConfirm: null,
                  })
                }
              >
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.ModalBody>
              <S.ConfirmMsg>{confirmFinalize.message}</S.ConfirmMsg>
            </S.ModalBody>

            <S.ModalFooter>
              <S.Btn
                onClick={() =>
                  !uploading &&
                  setConfirmFinalize({
                    open: false,
                    title: '',
                    message: '',
                    onConfirm: null,
                  })
                }
                disabled={uploading}
              >
                Cancelar
              </S.Btn>

              <S.Btn
                $variant="primary"
                onClick={() => confirmFinalize.onConfirm && confirmFinalize.onConfirm()}
                disabled={uploading}
              >
                {uploading ? 'Processando...' : 'Confirmar envio'}
              </S.Btn>
            </S.ModalFooter>
          </S.Modal>
        </S.Overlay>
      )}

      {/* Confirm Refazer Faturamento */}
      {refazerConfirm.open && refazerConfirm.pedido && (
        <S.Overlay
          onMouseDown={(e) =>
            !isRefazendo && e.target === e.currentTarget && cancelRefazerFaturamento()
          }
        >
          <S.Modal style={{ maxWidth: 430 }}>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Refazer faturamento</S.ModalTitle>
                <S.ModalSub>Pedido {refazerConfirm.pedido.id}</S.ModalSub>
              </div>

              <S.ModalClose onClick={cancelRefazerFaturamento} disabled={isRefazendo}>
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.ModalBody>
              <S.ConfirmMsg>
                Deseja refazer o faturamento deste pedido? Após confirmar, ele será liberado
                para reenviar a documentação.
              </S.ConfirmMsg>
            </S.ModalBody>

            <S.ModalFooter>
              <S.Btn onClick={cancelRefazerFaturamento} disabled={isRefazendo}>
                Cancelar
              </S.Btn>

              <S.Btn
                $variant="primary"
                onClick={confirmarRefazerFaturamento}
                disabled={isRefazendo}
              >
                {isRefazendo ? 'Refazendo...' : 'Refazer faturamento'}
              </S.Btn>
            </S.ModalFooter>
          </S.Modal>
        </S.Overlay>
      )}

      {/* Status Confirm Modal */}
      {statusConfirm.open && (
        <S.Overlay
          onMouseDown={(e) =>
            !statusChanging && e.target === e.currentTarget && cancelStatusChange()
          }
        >
          <S.Modal style={{ maxWidth: 400 }}>
            <S.ModalHeader>
              <S.ModalTitle>Confirmar alteração de status</S.ModalTitle>

              <S.ModalClose onClick={cancelStatusChange} disabled={statusChanging}>
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.ModalBody>
              <S.ConfirmMsg>
                Deseja alterar o pedido {statusConfirm.pedido?.id || ''} para "
                {statusLabel[statusConfirm.newStatus] || statusConfirm.newStatus}"?
              </S.ConfirmMsg>
            </S.ModalBody>

            <S.ModalFooter>
              <S.Btn onClick={cancelStatusChange} disabled={statusChanging}>
                Cancelar
              </S.Btn>

              <S.Btn
                $variant="primary"
                onClick={confirmStatusChange}
                disabled={statusChanging}
              >
                {statusChanging ? 'Alterando...' : 'Alterar status'}
              </S.Btn>
            </S.ModalFooter>
          </S.Modal>
        </S.Overlay>
      )}
    </PageLayout>
  )
}