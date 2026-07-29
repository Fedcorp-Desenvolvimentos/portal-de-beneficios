import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useOutletContext, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
  FiMoreVertical,
  FiChevronRight,
} from 'react-icons/fi'
import { BiSpreadsheet } from 'react-icons/bi'

import { faturamentoService } from '../../services/faturamentoService'
import { entebenService } from '../../services/entebenService'
import { resolveBoletoDisplayStatus } from '../../utils/boletoStatus'
import PageLayout from '../../Layouts/PageLayout/PageLayout'
import DatePickerWrapper from '../../components/DatePicker/DatePickerWrapper'
import { S } from './ColaboradorDashboardStyles'
import './ColaboradorDashboard.css'

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

const parseSortableDate = (value) => {
  if (!value) return null

  const raw = String(value).trim()
  if (!raw || raw === '-') return null

  const datePart = raw.includes('T') ? raw.split('T')[0] : raw

  if (datePart.includes('/')) {
    const [day, month, year] = datePart.split('/').map(Number)

    if (day && month && year) {
      return new Date(year, month - 1, day).getTime()
    }
  }

  if (datePart.includes('-')) {
    const [first, second, third] = datePart.split('-').map(Number)

    if (String(datePart.split('-')[0] || '').length === 4) {
      if (first && second && third) {
        return new Date(first, second - 1, third).getTime()
      }
    } else if (first && second && third) {
      return new Date(third, second - 1, first).getTime()
    }
  }

  const timestamp = new Date(raw).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

const parseSortableMonthYear = (value) => {
  if (!value) return null

  const raw = String(value).trim()
  if (!raw || raw === '-') return null

  const brMatch = raw.match(/^(0?[1-9]|1[0-2])\/(\d{4})$/)
  if (brMatch) {
    const [, month, year] = brMatch
    return Number(year) * 12 + Number(month)
  }

  const isoMatch = raw.match(/^(\d{4})-(0?[1-9]|1[0-2])$/)
  if (isoMatch) {
    const [, year, month] = isoMatch
    return Number(year) * 12 + Number(month)
  }

  return parseSortableDate(raw)
}

const compareNullableValues = (valueA, valueB, direction, compareFn) => {
  const aMissing = valueA === null || valueA === undefined || valueA === ''
  const bMissing = valueB === null || valueB === undefined || valueB === ''

  if (aMissing && bMissing) return 0
  if (aMissing) return 1
  if (bMissing) return -1

  const result = compareFn(valueA, valueB)
  return direction === 'asc' ? result : -result
}

const norm = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const limparCnpj = (value) =>
  String(value || '')
    .replace(/\D/g, '')
    .trim()

const statusMap = {
  AGUARDANDO_FATURAMENTO: 'aprovado',
  EM_FATURAMENTO: 'em_faturamento',
  FATURADO: 'faturado',
  COMPRADO: 'comprado',
  PAGO_PARCIALMENTE: 'pago_parcialmente',
  CANCELADO: 'cancelado',
  PENDING: 'pendente',
}

const normalizarStatus = (status) => {
  return statusMap[status] || statusMap[String(status || '').toUpperCase()] || 'aprovado'
}

const statusLabel = {
  aprovado: 'Aprovado',
  em_faturamento: 'Em faturamento',
  faturado: 'Faturado',
  comprado: 'Comprado',
  pago_parcialmente: 'Pago Parcialmente',
  cancelado: 'Cancelado',
  pendente: 'Pendente',
}

const statusRank = {
  aprovado: 1,
  em_faturamento: 2,
  faturado: 3,
  comprado: 4,
  pago_parcialmente: 5,
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
  {
    key: 'pago_parcialmente',
    title: 'Pago Parcialmente',
    description: 'Pagamento parcial registrado.',
    minRank: 5,
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
              : step.key === 'pago_parcialmente'
                ? pedido?.pagoParcialmenteEm
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

  const modelo = normalizeBeneficioText(pedidoApi?.modelo_importacao)
  if (modelo) {
    if (modelo.includes('VT')) return 'Vale Transporte'
    if (modelo.includes('AUTO') || modelo.includes('COMBUSTIVEL')) return 'Vale Combustível'
    if (modelo.includes('VR') || modelo.includes('BENEFICIO')) return 'Alimentação/Refeição'
  }

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

  return '-'
}

const getCondominioCnpj = (condominio) => {
  return (
    condominio?.condominio_id ||
    condominio?.cnpj ||
    condominio?.documento ||
    condominio?.cpf_cnpj ||
    condominio?.cnpj_condominio ||
    condominio?.condominio?.cnpj ||
    condominio?.condominio?.documento ||
    condominio?.condominio?.cpf_cnpj ||
    ''
  )
}

const getCondominioNome = (condominio, index) => {
  return (
    condominio?.condominio ||
    condominio?.nome_condominio ||
    condominio?.nome ||
    condominio?.razao_social ||
    condominio?.sacado ||
    condominio?.pagador ||
    `Condomínio ${index + 1}`
  )
}

const getCondominioValor = (condominio) => {
  const funcionarios = condominio?.funcionarios || condominio?.colaboradores || []

  return Number(
    condominio?.valor_boleto ||
    condominio?.valor_total ||
    condominio?.total ||
    condominio?.valor ||
    funcionarios.reduce(
      (soma, funcionario) =>
        soma +
        Number(
          funcionario?.valor_total ||
          funcionario?.valor_recarga_bene ||
          funcionario?.valor_beneficio ||
          funcionario?.valor ||
          0
        ),
      0
    ) ||
    0
  )
}

const getCondominioVencimento = (condominio, pedido) => {
  return (
    condominio?.vencimento ||
    condominio?.data_vencimento ||
    condominio?.dataVencimento ||
    pedido?.dataVencimento ||
    ''
  )
}

const getListaCondominiosPedido = (pedido) => {
  const listasPossiveis = [
    pedido?.condominios,
    pedido?.boletos,
    pedido?.documentos,
    pedido?.faturamento_documentos,

    pedido?.raw?.condominios,
    pedido?.raw?.boletos,
    pedido?.raw?.documentos,
    pedido?.raw?.faturamento_documentos,

    pedido?.raw?.dados_requisicao?.condominios,
    pedido?.raw?.dados_requisicao?.boletos,
    pedido?.raw?.dados_requisicao?.documentos,

    pedido?.raw?.data_to_backend?.condominios,
    pedido?.raw?.data_to_backend?.boletos,

    pedido?.raw?.summary?.condominios,
    pedido?.raw?.summary?.boletos,

    pedido?.raw?.faturamento?.condominios,
    pedido?.raw?.faturamento?.boletos,
    pedido?.raw?.faturamento?.documentos,
  ]

  return listasPossiveis.find((lista) => Array.isArray(lista) && lista.length > 0) || []
}

const normalizarCondominiosCompra = (pedido) => {
  const boletos = Array.isArray(pedido?.boletos)
    ? pedido.boletos
    : Array.isArray(pedido?.selectData?.boletos)
      ? pedido.selectData.boletos
      : []

  const condominios = Array.isArray(pedido?.condominios)
    ? pedido.condominios
    : Array.isArray(pedido?.selectData?.condominios)
      ? pedido.selectData.condominios
      : []

  return boletos.map((boleto, index) => {
    const cnpjBoleto = limparCnpj(boleto?.cnpj_cobrado)

    const condominio = condominios.find(
      (item) => limparCnpj(item?.cnpj) === cnpjBoleto
    )

    const funcionarios = Array.isArray(condominio?.funcionarios)
      ? condominio.funcionarios
      : []

    const movimentacaoIds = funcionarios.flatMap((funcionario) =>
      Array.isArray(funcionario?.movimentacoes)
        ? funcionario.movimentacoes.map((mov) => mov.id).filter(Boolean)
        : []
    )

    return {
      ...boleto,
      _index: index,
      _key: boleto?.id || cnpjBoleto || `boleto-${index}`,
      _boletoId: boleto?.id,
      _documento: boleto?.documento || '-',
      _nome: boleto?.nome_cobrado || condominio?.nome || `Boleto ${index + 1}`,
      _cnpjOriginal: boleto?.cnpj_cobrado || condominio?.cnpj || '-',
      _cnpjLimpo: cnpjBoleto,
      _valor: Number(boleto?.valor || 0),
      _vencimento: boleto?.vencimento || '',
      _baixa: Boolean(boleto?.baixa),
      _dtBaixa: boleto?.dt_baixa || null,
      _fatura: boleto?.fatura || '',
      _status: boleto?.status || null,
      _funcionarios: funcionarios,
      _movimentacaoIds: movimentacaoIds,
    }
  })
}

const extrairResumoPedido = (pedidoApi) => {
  const condominios =
    pedidoApi?.condominios ||
    pedidoApi?.boletos ||
    pedidoApi?.documentos ||
    pedidoApi?.faturamento_documentos ||
    pedidoApi?.dados_requisicao?.condominios ||
    pedidoApi?.dados_requisicao?.boletos ||
    pedidoApi?.dados_requisicao?.documentos ||
    pedidoApi?.data_to_backend?.condominios ||
    pedidoApi?.data_to_backend?.boletos ||
    pedidoApi?.summary?.condominios ||
    pedidoApi?.summary?.boletos ||
    pedidoApi?.faturamento?.condominios ||
    pedidoApi?.faturamento?.boletos ||
    pedidoApi?.faturamento?.documentos ||
    []

  return {
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
    pagoParcialmenteEm: pedidoApi.data_pago_parcialmente || null,
    dataRecebimento: pedidoApi.data_recebimento || null,
    numeroFatura: pedidoApi.numero_fatura || '',
    responsavelId: pedidoApi.responsavel || null,
    responsavelNome: pedidoApi.responsavel_nome || '',
    condominios,
    raw: pedidoApi,
  }
}

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
    <td style={{ width: 40 }}>
      <S.SkeletonLine $width="24px" $height="24px" $borderRadius="6px" />
    </td>
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
      <S.SkeletonLine $width="80px" $height="14px" />
    </td>
    <td>
      <S.SkeletonLine $width="80px" $height="14px" />
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
      <S.SkeletonLine $width="70px" $height="28px" $borderRadius="6px" />
    </td>
  </tr>
)

const SkeletonTable = () => (
  <S.TableWrap>
    <S.Table>
      <thead>
        <tr>
          <th style={{ width: 40 }}></th>
          <th>Pedido</th>
          <th>Administradora</th>
          <th>Vencimento</th>
          <th>Competência</th>
          <th>Data Crédito</th>
          <th>Importação</th>
          <th>Valor</th>
          <th>Status</th>
          <th>Excel</th>
          <th>Dados</th>
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
  const { user } = useAuth()
  const userRole = user?.tipo || user?.tipo_usuario || user?.role || user?.perfil

  const admRoles = ['adm', 'cli', 'dep', 'fin']

  if (admRoles.includes(userRole)) {
    return <Navigate to="/home" replace />
  }

  const { enqueueSnackbar } = useSnackbar()
  const outletContext = useOutletContext()
  const sidebarWidth = outletContext?.withSidebar ? 240 : 62

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [dataCreditoInicio, setDataCreditoInicio] = useState('')
  const [dataCreditoFim, setDataCreditoFim] = useState('')
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  const [importOpen, setImportOpen] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadMode, setUploadMode] = useState('substituir')

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
  const [sortConfig, setSortConfig] = useState({
    key: 'dataRecebimento',
    direction: 'asc',
  })

  const [boletoModalOpen, setBoletoModalOpen] = useState(false)
  const [boletoPedido, setBoletoPedido] = useState(null)

  const [importDataOpen, setImportDataOpen] = useState(false)
  const [importDataPedido, setImportDataPedido] = useState(null)
  const [importDataLoading, setImportDataLoading] = useState(false)
  const [importDataInfo, setImportDataInfo] = useState(null)
  const [selectedCondominios, setSelectedCondominios] = useState(new Set())

  const [openActionsId, setOpenActionsId] = useState(null)

  const [expandedPedidoId, setExpandedPedidoId] = useState(null)
  const [expandedBoletos, setExpandedBoletos] = useState([])
  const [expandedLoading, setExpandedLoading] = useState(false)
  const [fullyPaidIds, setFullyPaidIds] = useState(new Set())

  const itemsPerPage = 50
  const fileRef = useRef(null)

  useEffect(() => {
    if (!openActionsId) return undefined

    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-actions-menu]')) {
        setOpenActionsId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openActionsId])

  const condominiosCompra = useMemo(() => {
    return normalizarCondominiosCompra(boletoPedido)
  }, [boletoPedido])

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
      pagoParcialmente: pedidos.filter((p) => p.status === 'pago_parcialmente').length,
      cancelados: pedidos.filter((p) => p.status === 'cancelado').length,
    }),
    [pedidos]
  )

  const filtered = useMemo(() => {
    const q = norm(search)

    const result = pedidos.filter((p) => {
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

      const matchSearch = !q || hay.includes(q)
      const matchStatus = statusFilter === 'todos' ? p.status !== 'cancelado' : p.status === statusFilter
      const matchDataInicio = !dataCreditoInicio || (p.dataRecebimento && p.dataRecebimento >= dataCreditoInicio)
      const matchDataFim = !dataCreditoFim || (p.dataRecebimento && p.dataRecebimento <= dataCreditoFim)

      return matchSearch && matchStatus && matchDataInicio && matchDataFim
    })

    result.sort((a, b) => {
      const { key, direction } = sortConfig

      if (key === 'id') {
        return compareNullableValues(
          Number(a.id),
          Number(b.id),
          direction,
          (valueA, valueB) => valueA - valueB
        )
      }

      if (key === 'nomeAdministradora') {
        return compareNullableValues(
          a.nomeAdministradora,
          b.nomeAdministradora,
          direction,
          (valueA, valueB) =>
            String(valueA).localeCompare(String(valueB), 'pt-BR', {
              sensitivity: 'base',
              numeric: true,
            })
        )
      }

      if (key === 'dataVencimento' || key === 'dataRecebimento') {
        return compareNullableValues(
          parseSortableDate(a[key]),
          parseSortableDate(b[key]),
          direction,
          (valueA, valueB) => valueA - valueB
        )
      }

      if (key === 'mesUtilizacao') {
        return compareNullableValues(
          parseSortableMonthYear(a.mesUtilizacao),
          parseSortableMonthYear(b.mesUtilizacao),
          direction,
          (valueA, valueB) => valueA - valueB
        )
      }

      if (key === 'valorTotal') {
        return compareNullableValues(
          Number(a.valorTotal),
          Number(b.valorTotal),
          direction,
          (valueA, valueB) => valueA - valueB
        )
      }

      if (key === 'status') {
        return compareNullableValues(
          statusLabel[a.status] || a.status,
          statusLabel[b.status] || b.status,
          direction,
          (valueA, valueB) =>
            String(valueA).localeCompare(String(valueB), 'pt-BR', {
              sensitivity: 'base',
            })
        )
      }

      return 0
    })

    return result
  }, [
    pedidos,
    search,
    statusFilter,
    dataCreditoInicio,
    dataCreditoFim,
    sortConfig,
  ])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))

  const paginatedPedidos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, dataCreditoInicio, dataCreditoFim, sortConfig])

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

      showToast(`Planilha do pedido ${pedido.id} baixada com sucesso.`, {
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
    const { refazendo = false, modoAdicionar = false } = options

    if (pedido.status === 'cancelado') {
      showToast('Este pedido está cancelado.', { variant: 'info' })
      return
    }

    if (!refazendo && !modoAdicionar && ['comprado', 'pago_parcialmente'].includes(pedido.status)) {
      showToast('Este pedido já foi comprado. Use "Refazer" para reenviar documentos.', {
        variant: 'info',
      })
      return
    }

    setSelectedPedido({
      ...pedido,
      refazendo,
    })
    setDocs([])
    setUploadMode(modoAdicionar ? 'adicionar' : 'substituir')
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

    if (!['faturado', 'comprado', 'pago_parcialmente'].includes(pedido.status)) {
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

  async function openBoletoModal(pedido) {
    if (pedido.status !== 'faturado') {
      showToast('A compra só fica disponível para pedidos faturados.', {
        variant: 'warning',
      })
      return
    }

    try {
      setDownloadingId(pedido.id)

      const selectData = await faturamentoService.buscarDadosSelecaoImportacao(pedido.id)

      console.log('Dados de seleção retornados:', selectData)

      const pedidoCompleto = {
        ...pedido,
        selectData,
        condominios: selectData?.condominios || [],
        boletos: selectData?.boletos || [],
      }

      const boletos = normalizarCondominiosCompra(pedidoCompleto)

      console.log('Boletos normalizados para TXT:', boletos)

      if (!boletos.length) {
        showToast('Este pedido não possui boletos vinculados.', {
          variant: 'warning',
        })
        return
      }

      setBoletoPedido({
        ...pedidoCompleto,
        boletos,
      })

      setSelectedCondominios(new Set())
      setBoletoModalOpen(true)
    } catch (error) {
      console.error('Erro ao buscar dados do modal:', error)

      showToast(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Não foi possível carregar os boletos deste pedido.',
        { variant: 'error' }
      )
    } finally {
      setDownloadingId(null)
    }
  }
  function closeBoletoModal() {
    if (downloadingId === boletoPedido?.id) return

    setBoletoModalOpen(false)
    setBoletoPedido(null)
    setSelectedCondominios(new Set())
  }

  async function togglePedidoExpand(pedido) {
    if (expandedPedidoId === pedido.id) {
      setExpandedPedidoId(null)
      setExpandedBoletos([])
      return
    }

    setExpandedPedidoId(pedido.id)
    setExpandedLoading(true)
    setExpandedBoletos([])

    try {
      const selectData = await faturamentoService.buscarDadosSelecaoImportacao(pedido.id)
      const normalized = normalizarCondominiosCompra({
        ...pedido,
        selectData,
        condominios: selectData?.condominios || [],
        boletos: selectData?.boletos || [],
      })
      setExpandedBoletos(normalized)

      if (normalized.length > 0 && normalized.every((b) => b._baixa)) {
        setFullyPaidIds((prev) => new Set([...prev, pedido.id]))
      } else {
        setFullyPaidIds((prev) => {
          const next = new Set(prev)
          next.delete(pedido.id)
          return next
        })
      }
    } catch (error) {
      console.error('Erro ao buscar boletos:', error)
      showToast('Não foi possível carregar os boletos deste pedido.', { variant: 'error' })
      setExpandedPedidoId(null)
    } finally {
      setExpandedLoading(false)
    }
  }

  async function handleMarcarResponsavel(pedido) {
    try {
      await faturamentoService.marcarResponsavel(pedido.id)
      showToast('Pedido assumido com sucesso!', { variant: 'success' })
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedido.id
            ? { ...p, responsavelId: user?.id, responsavelNome: user?.nome || user?.email }
            : p
        )
      )
    } catch (error) {
      const detail = error?.response?.data?.detail
      if (error?.response?.status === 409) {
        showToast(detail || 'Pedido já está sendo processado por outro usuário.', { variant: 'warning' })
      } else {
        showToast(detail || 'Não foi possível assumir o pedido.', { variant: 'error' })
      }
    }
  }

  async function handleDesmarcarResponsavel(pedido) {
    try {
      await faturamentoService.desmarcarResponsavel(pedido.id)
      showToast('Pedido liberado.', { variant: 'info' })
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedido.id
            ? { ...p, responsavelId: null, responsavelNome: '' }
            : p
        )
      )
    } catch (error) {
      const detail = error?.response?.data?.detail
      showToast(detail || 'Não foi possível liberar o pedido.', { variant: 'error' })
    }
  }

  function toggleCondominio(index) {
    setSelectedCondominios((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function toggleAllCondominios(check) {
    if (!condominiosCompra.length) return

    setSelectedCondominios(
      check
        ? new Set(condominiosCompra.map((condominio) => condominio._index))
        : new Set()
    )
  }

  async function handleGerarTxt() {
    if (!boletoPedido) return

    if (selectedCondominios.size === 0) {
      showToast('Selecione ao menos um boleto para gerar o TXT.', {
        variant: 'warning',
      })
      return
    }

    const selecionados = condominiosCompra.filter((boleto) =>
      selectedCondominios.has(boleto._index)
    )

    const movimentacaoIdsSelecionados = [
      ...new Set(
        selecionados.flatMap((boleto) => boleto._movimentacaoIds || [])
      ),
    ]

    if (!movimentacaoIdsSelecionados.length) {
      showToast('Nenhuma movimentação foi encontrada nos boletos selecionados.', {
        variant: 'warning',
      })
      return
    }

    const todosSelecionados = selecionados.length === condominiosCompra.length

    try {
      setDownloadingId(boletoPedido.id)

      await faturamentoService.baixarTxtCompra(
        {
          importacao_id: boletoPedido.id,
          movimentacao_ids: movimentacaoIdsSelecionados,
        },
        `compra-${boletoPedido.id}`
      )

      setPedidos((prev) =>
        prev.map((item) =>
          item.id === boletoPedido.id
            ? {
              ...item,
              status: todosSelecionados ? 'comprado' : 'faturado',
              compradoEm: todosSelecionados ? new Date().toISOString() : item.compradoEm,
            }
            : item
        )
      )

      showToast(
        todosSelecionados
          ? `Arquivo de compra do pedido ${boletoPedido.id} gerado com todos os boletos selecionados.`
          : `Arquivo de compra do pedido ${boletoPedido.id} gerado com ${selecionados.length} boleto(s). O pedido continuará como faturado.`,
        { variant: 'success' }
      )

      closeBoletoModal()
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
    const isAdicionando = uploadMode === 'adicionar' && selectedPedido?.status === 'faturado'

    setConfirmFinalize({
      open: true,
      title: isRefazendoPedido ? 'Confirmar reenvio de documentos' : isAdicionando ? 'Confirmar inclusão de novos documentos' : 'Confirmar importação',
      message: isRefazendoPedido
        ? 'Ao reenviar a documentação, os documentos anteriores deste pedido poderão ser substituídos e o pedido voltará para faturado. Deseja continuar?'
        : isAdicionando
          ? 'Os novos documentos serão adicionados aos existentes. Documentos já processados não serão substituídos. Deseja continuar?'
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
          mode: uploadMode,
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
          : uploadMode === 'adicionar'
            ? `Novos documentos incluídos no pedido ${selectedPedido.id}.`
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

  async function openImportDataModal(pedido) {
    if (!pedido?.id) {
      showToast('Pedido inválido.', { variant: 'error' })
      return
    }

    setImportDataPedido(pedido)
    setImportDataOpen(true)
    setImportDataLoading(true)
    setImportDataInfo(null)

    try {
      const data = await faturamentoService.buscarMovimentacoesImportacao(pedido.id)
      setImportDataInfo(data)
    } catch (error) {
      console.error('Erro ao buscar dados da importação:', error)
      showToast('Não foi possível carregar os dados da importação.', { variant: 'error' })
      setImportDataOpen(false)
      setImportDataPedido(null)
    } finally {
      setImportDataLoading(false)
    }
  }

  function closeImportDataModal() {
    setImportDataOpen(false)
    setImportDataPedido(null)
    setImportDataInfo(null)
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

      const hoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
      const labels = { 'boleto-original/': 'boleto', 'nota-fiscal-original/': 'nota_fiscal', 'nota-debito-original/': 'nota_debito', 'originais/': 'faturamento' }
      const label = labels[tipo] || 'documento'
      const nomeAdm = pedido?.nomeAdministradora
      const iniciais = nomeAdm ? nomeAdm.split(' ').filter(p => p).map(p => p[0].toUpperCase()).join('') : 'SN'
      const ext = tipo === 'originais/' ? '.zip' : '.pdf'
      const nomeArquivo = `${label} - ${hoje} - ${iniciais}${ext}`

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
      } else if (boletoModalOpen && downloadingId !== boletoPedido?.id) {
        closeBoletoModal()
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
    boletoModalOpen,
    boletoPedido,
    downloadingId,
  ])


  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const renderSortableHeader = (label, key) => {
    const isActive = sortConfig.key === key
    const directionLabel = sortConfig.direction === 'asc' ? 'crescente' : 'decrescente'

    return (
      <button
        type="button"
        onClick={() => handleSort(key)}
        title={
          isActive
            ? `Ordenação ${directionLabel}. Clique para inverter.`
            : `Ordenar ${label.toLowerCase()}`
        }
        style={{
          appearance: 'none',
          border: 0,
          background: 'transparent',
          color: 'inherit',
          font: 'inherit',
          fontWeight: 'inherit',
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{label}</span>
        <span
          aria-hidden="true"
          style={{
            fontSize: 11,
            lineHeight: 1,
            opacity: isActive ? 1 : 0.35,
          }}
        >
          {isActive ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    )
  }

  const closeActionsMenu = () => {
    setOpenActionsId(null)
  }

  const renderAcoesPedido = (p) => {
    const isFaturadoOuComprado = ['faturado', 'comprado', 'pago_parcialmente'].includes(p.status)
    const podeGerarTxt = p.status === 'faturado'
    const jaComprado = ['comprado', 'pago_parcialmente'].includes(p.status)
    const souResponsavel = p.responsavelId === user?.id
    const bloqueadoPorOutro = p.responsavelId && p.responsavelId !== user?.id
    const podeEditar = !bloqueadoPorOutro && p.status !== 'cancelado'

    return (
      <>
        {!p.responsavelId ? (
          <S.ActionItem
            type="button"
            className="primary"
            onClick={() => {
              handleMarcarResponsavel(p)
              closeActionsMenu()
            }}
          >
            <FiCheckCircle size={14} />
            <span>Assumir pedido</span>
          </S.ActionItem>
        ) : souResponsavel ? (
          <S.ActionItem
            type="button"
            onClick={() => {
              handleDesmarcarResponsavel(p)
              closeActionsMenu()
            }}
          >
            <FiRefreshCw size={14} />
            <span>Liberar pedido</span>
          </S.ActionItem>
        ) : (
          <S.ActionStatus>Bloqueado por {p.responsavelNome}</S.ActionStatus>
        )}

        <S.ActionItem
          type="button"
          onClick={() => {
            handleDownload(p)
            closeActionsMenu()
          }}
          disabled={!podeEditar || downloadingId === p.id}
        >
          <FiDownload size={14} />
          <span>Baixar Excel</span>
        </S.ActionItem>

        <S.ActionItem
          type="button"
          onClick={() => {
            openImportDataModal(p)
            closeActionsMenu()
          }}
          disabled={bloqueadoPorOutro}
        >
          <FiInfo size={14} />
          <span>Dados da importação</span>
        </S.ActionItem>

        {isFaturadoOuComprado ? (
          <>
            <S.ActionItem
              type="button"
              onClick={() => {
                abrirDocsImportados(p)
                closeActionsMenu()
              }}
              disabled={bloqueadoPorOutro}
            >
              <FiEye size={14} />
              <span>Ver documentos</span>
            </S.ActionItem>

            <S.ActionItem
              type="button"
              onClick={() => {
                openImport(p, { refazendo: true })
                closeActionsMenu()
              }}
              disabled={!podeEditar || refazendoId === p.id}
            >
              <FiRefreshCw size={14} />
              <span>Gerenciar documentos</span>
            </S.ActionItem>
          </>
        ) : (
          <S.ActionItem
            type="button"
            onClick={() => {
              openImport(p)
              closeActionsMenu()
            }}
            disabled={!podeEditar}
          >
            <BiSpreadsheet size={14} />
            <span>Importar documentos</span>
          </S.ActionItem>
        )}

        {podeGerarTxt ? (
          <S.ActionItem
            type="button"
            className="primary"
            onClick={() => {
              openBoletoModal(p)
              closeActionsMenu()
            }}
            disabled={!podeEditar || downloadingId === p.id}
          >
            <FiFileText size={14} />
            <span>{downloadingId === p.id ? 'Gerando...' : 'Gerar TXT'}</span>
          </S.ActionItem>
        ) : jaComprado ? (
          <S.ActionStatus>TXT gerado ✓</S.ActionStatus>
        ) : (
          <S.ActionStatus>Compra indisponível</S.ActionStatus>
        )}

        {podeEditar && p.status !== 'cancelado' && (
          <S.ActionItem
            type="button"
            className="danger"
            onClick={() => {
              setCancelPedido(p)
              setCancelReason('')
              setCancelError('')
              setCancelOpen(true)
              closeActionsMenu()
            }}
          >
            <FiTrash2 size={14} />
            <span>Cancelar pedido</span>
          </S.ActionItem>
        )}
      </>
    )
  }

  return (
    <PageLayout
      title="Dashboard do Colaborador"
      subtitle="Gerencie seus pedidos de faturamento, acompanhe o status e importe documentos."
      className="dashboard-wide"
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
                <option value="pago_parcialmente">Pago Parcialmente</option>
                <option value="cancelado">Cancelados</option>
                <option value="pendente">Pendentes</option>
              </S.Select>

              <S.DateFilter>
                <FiCalendar size={15} />

                <DatePickerWrapper
                  value={dataCreditoInicio}
                  onChange={setDataCreditoInicio}
                  placeholderText="Inicio"
                  maxDate={dataCreditoFim || undefined}
                />

                <DatePickerWrapper
                  value={dataCreditoFim}
                  onChange={setDataCreditoFim}
                  placeholderText="Fim"
                  minDate={dataCreditoInicio || undefined}
                />
                {(dataCreditoInicio || dataCreditoFim) && (
                  <S.SearchClear onClick={() => { setDataCreditoInicio(''); setDataCreditoFim('') }}>
                    <FiX size={14} />
                  </S.SearchClear>
                )}
              </S.DateFilter>
            </S.Filters>

            <S.TableWrap>
              <S.Table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th aria-sort={sortConfig.key === 'id' ? sortConfig.direction : 'none'}>
                      {renderSortableHeader('Pedido', 'id')}
                    </th>
                    <th>Fatura</th>
                    <th
                      aria-sort={
                        sortConfig.key === 'nomeAdministradora'
                          ? sortConfig.direction
                          : 'none'
                      }
                    >
                      {renderSortableHeader('Administradora', 'nomeAdministradora')}
                    </th>
                    <th
                      aria-sort={
                        sortConfig.key === 'dataVencimento'
                          ? sortConfig.direction
                          : 'none'
                      }
                    >
                      {renderSortableHeader('Vencimento', 'dataVencimento')}
                    </th>
                    <th
                      aria-sort={
                        sortConfig.key === 'mesUtilizacao'
                          ? sortConfig.direction
                          : 'none'
                      }
                    >
                      {renderSortableHeader('Competência', 'mesUtilizacao')}
                    </th>
                    <th
                      aria-sort={
                        sortConfig.key === 'dataRecebimento'
                          ? sortConfig.direction
                          : 'none'
                      }
                    >
                      {renderSortableHeader('Data Crédito', 'dataRecebimento')}
                    </th>
                    <th
                      aria-sort={
                        sortConfig.key === 'dataImportacao'
                          ? sortConfig.direction
                          : 'none'
                      }
                    >
                      {renderSortableHeader('Importação', 'dataImportacao')}
                    </th>
                    <th
                      aria-sort={
                        sortConfig.key === 'valorTotal'
                          ? sortConfig.direction
                          : 'none'
                      }
                    >
                      {renderSortableHeader('Valor', 'valorTotal')}
                    </th>
                    <th
                      aria-sort={
                        sortConfig.key === 'status'
                          ? sortConfig.direction
                          : 'none'
                      }
                    >
                      {renderSortableHeader('Status', 'status')}
                    </th>

                    <th>Responsável</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <S.Empty colSpan={12}>
                        Nenhum pedido encontrado.
                      </S.Empty>
                    </tr>
                  ) : (
                    paginatedPedidos.map((p) => (
                      <React.Fragment key={p.id}>
                      <tr className={fullyPaidIds.has(p.id) ? 'cf-row-fully-paid' : ''}>
                        <td style={{ width: 40, textAlign: 'center' }}>
                          <S.ExpandBtn
                            type="button"
                            onClick={() => togglePedidoExpand(p)}
                            title={expandedPedidoId === p.id ? 'Recolher boletos' : 'Ver boletos'}
                          >
                            <FiChevronRight
                              size={14}
                              style={{
                                transform: expandedPedidoId === p.id ? 'rotate(90deg)' : 'none',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </S.ExpandBtn>
                        </td>
                        <td data-label="Pedido">
                          <S.IdMain>Pedido #{p.id}</S.IdMain>
                          <S.IdSub>{p.tipoBeneficio}</S.IdSub>

                          {p.status === 'cancelado' && p.motivoCancelamento && (
                            <S.IdSub style={{ color: '#b91c1c' }}>
                              Motivo: {p.motivoCancelamento}
                            </S.IdSub>
                          )}
                        </td>

                        <td data-label="Fatura">
                          {['faturado', 'comprado', 'pago_parcialmente', 'pendente'].includes(p.status) ? (
                            p.numeroFatura ? (
                              <S.FaturaTag>{p.numeroFatura}</S.FaturaTag>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                            )
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                          )}
                        </td>

                        <S.AdminCell data-label="Administradora">
                          <S.AdminName>{p.nomeAdministradora}</S.AdminName>
                        </S.AdminCell>

                        <td data-label="Vencimento">
                          <S.Inline>
                            <FiCalendar size={14} />
                            {fmtDate(p.dataVencimento)}
                          </S.Inline>
                        </td>

                        <td data-label="Competência" style={{ fontSize: 13 }}>{p.mesUtilizacao}</td>

                        <td data-label="Data Crédito" style={{ fontSize: 13 }}>{fmtDate(p.dataRecebimento)}</td>

                        <td data-label="Importação" style={{ fontSize: 13 }}>{fmtDate(p.dataImportacao)}</td>

                        <td data-label="Valor" style={{ fontWeight: 600, color: '#16a34a' }}>
                          {fmtMoney(p.valorTotal)}
                        </td>

                        <td data-label="Status">
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
                              <option value="pago_parcialmente">Pago Parcialmente</option>
                              <option value="cancelado">Cancelar</option>
                              <option value="pendente">Pendente</option>
                            </select>
                          </S.StatusSelect>
                        </td>

                        <td data-label="Responsável">
                          {p.responsavelId ? (
                            p.responsavelId === user?.id ? (
                              <S.ResponsavelTag $mine>Você</S.ResponsavelTag>
                            ) : (
                              <S.ResponsavelTag>{p.responsavelNome}</S.ResponsavelTag>
                            )
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                          )}
                        </td>

                        <td data-label="Ações" className="cd-actions-td">
                          <S.ActionsMenuWrap data-actions-menu>
                            <S.ActionsMenuButton
                              type="button"
                              onClick={() =>
                                setOpenActionsId((current) => (current === p.id ? null : p.id))
                              }
                            >
                              <FiMoreVertical size={16} />
                              Ações
                            </S.ActionsMenuButton>

                            {openActionsId === p.id && (
                              <S.ActionsDropdown>{renderAcoesPedido(p)}</S.ActionsDropdown>
                            )}
                          </S.ActionsMenuWrap>
                        </td>
                      </tr>

                      {expandedPedidoId === p.id && (
                        <tr className="cf-expand-row">
                          <td colSpan={12}>
                            <div className="cf-expand-content">
                              {expandedLoading ? (
                                <div className="cf-expand-loading">Carregando boletos...</div>
                              ) : expandedBoletos.length === 0 ? (
                                <div className="cf-expand-empty">Nenhum boleto encontrado para este pedido.</div>
                              ) : (
                                <>
                                  <div className="cf-expand-header">
                                    Boletos ({expandedBoletos.length}) —{' '}
                                    {expandedBoletos.filter((b) => resolveBoletoDisplayStatus(b).variant === 'pago').length} pago(s),{' '}
                                    {expandedBoletos.filter((b) => resolveBoletoDisplayStatus(b).variant === 'pendente').length} pendente(s){' '}
                                    {expandedBoletos.filter((b) => resolveBoletoDisplayStatus(b).variant === 'cancelado').length > 0 && (
                                      <>, {expandedBoletos.filter((b) => resolveBoletoDisplayStatus(b).variant === 'cancelado').length} cancelado(s)</>
                                    )}
                                  </div>
                                  <table className="cf-expand-table">
                                    <thead>
                                      <tr>
                                        <th>Condomínio</th>
                                        <th>CNPJ</th>
                                        <th>Documento</th>
                                        <th>Vencimento</th>
                                        <th>Valor</th>
                                        <th>Status</th>
                                        <th>Data Pagamento</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {expandedBoletos.map((bl, idx) => {
                                        const displayStatus = resolveBoletoDisplayStatus(bl)
                                        return (
                                          <tr key={bl._key || idx}>
                                            <td>{bl._nome}</td>
                                            <td>{bl._cnpjOriginal}</td>
                                            <td>{bl._documento}</td>
                                            <td>{fmtDate(bl._vencimento)}</td>
                                            <td className="cf-expand-valor">{fmtMoney(bl._valor)}</td>
                                            <td>
                                              <span className={`cf-expand-badge ${displayStatus.variant}`}>
                                                {displayStatus.label}
                                              </span>
                                            </td>
                                            <td>{bl._dtBaixa ? fmtDate(bl._dtBaixa) : '-'}</td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
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

      {/* Modal de Dados da Importação */}
      {importDataOpen && importDataPedido && (
        <S.Overlay
          onMouseDown={(e) =>
            e.target === e.currentTarget && !importDataLoading && closeImportDataModal()
          }
        >
          <S.Modal style={{ maxWidth: 600 }}>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Dados da Importação</S.ModalTitle>
                <S.ModalSub>
                  Pedido {importDataPedido.id} · {importDataPedido.nomeAdministradora || importDataPedido.nomeCondominio}
                </S.ModalSub>
              </div>

              <S.ModalClose onClick={closeImportDataModal} disabled={importDataLoading}>
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.ModalBody>
              {importDataLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <span style={{ color: 'var(--sub)', fontSize: 13 }}>Carregando dados...</span>
                </div>
              ) : importDataInfo ? (
                <>
                  <S.InfoGrid>


                    <div className="info-item">
                      <span className="info-label">Data de Importação</span>
                      <span className="info-value">{fmtDate(importDataInfo.importacao?.data_importacao)}</span>
                    </div>

                    <div className="info-item full-width">
                      <span className="info-label">Usuário Responsável</span>
                      <span className="info-value">{importDataInfo.importacao?.nome_usuario || '-'}</span>
                    </div>
                  </S.InfoGrid>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--sub)', fontSize: 13 }}>
                  Nenhum dado encontrado.
                </div>
              )}
            </S.ModalBody>

            <S.ModalFooter>
              <S.Btn
                onClick={() => {
                  const s3Url = importDataInfo?.importacao?.arquivo_s3
                  if (s3Url) {
                    window.open(s3Url, '_blank')
                  } else {
                    showToast('Arquivo original não disponível.', { variant: 'warning' })
                  }
                }}
                disabled={!importDataInfo?.importacao?.arquivo_s3}
              >
                <FiDownload size={14} />
                Baixar planilha original
              </S.Btn>
              <S.Btn
                onClick={() => {
                  const s3Url = importDataInfo?.importacao?.arquivo_s3_editado
                  if (s3Url) {
                    window.open(s3Url, '_blank')
                  } else {
                    showToast('Arquivo editado não disponível.', { variant: 'warning' })
                  }
                }}
                disabled={!importDataInfo?.importacao?.arquivo_s3_editado}
              >
                <FiDownload size={14} />
                Baixar planilha editada
              </S.Btn>
              <S.Btn onClick={closeImportDataModal} disabled={importDataLoading}>
                Fechar
              </S.Btn>
            </S.ModalFooter>
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
                  {selectedPedido.refazendo ? 'Reenviar documentos' : uploadMode === 'adicionar' ? 'Incluir novos documentos' : 'Importar documentos'}
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
              {selectedPedido.status === 'faturado' && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: uploadMode === 'substituir' ? '#1e293b' : '#64748b' }}>
                    <input
                      type="radio"
                      name="uploadMode"
                      value="substituir"
                      checked={uploadMode === 'substituir'}
                      onChange={() => setUploadMode('substituir')}
                      disabled={uploading}
                    />
                    Substituir documentos
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: uploadMode === 'adicionar' ? '#1e293b' : '#64748b' }}>
                    <input
                      type="radio"
                      name="uploadMode"
                      value="adicionar"
                      checked={uploadMode === 'adicionar'}
                      onChange={() => setUploadMode('adicionar')}
                      disabled={uploading}
                    />
                    Incluir novos documentos
                  </label>
                </div>
              )}

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
                    : uploadMode === 'adicionar'
                      ? 'Incluir documentos'
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

      {/* Modal Seleção de Boletos */}
      {boletoModalOpen && boletoPedido && (
        <S.Overlay
          $sidebarWidth={sidebarWidth}
          onMouseDown={(e) => e.target === e.currentTarget && closeBoletoModal()}
        >
          <S.BoletoModal>
            <S.ModalHeader>
              <div>
                <S.ModalTitle>Selecionar boletos</S.ModalTitle>
                <S.ModalSub>
                  Pedido {boletoPedido.id} · {condominiosCompra.length} boleto(s)
                </S.ModalSub>
              </div>

              <S.ModalClose
                onClick={closeBoletoModal}
                disabled={downloadingId === boletoPedido.id}
              >
                <FiX size={18} />
              </S.ModalClose>
            </S.ModalHeader>

            <S.BoletoModalBody>
              <S.BoletoTableWrap>
                <S.BoletoTable>
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            condominiosCompra.length > 0 &&
                            selectedCondominios.size === condominiosCompra.length
                          }
                          onChange={(e) => toggleAllCondominios(e.target.checked)}
                          disabled={!condominiosCompra.length}
                          style={{
                            cursor: condominiosCompra.length ? 'pointer' : 'not-allowed',
                          }}
                        />
                      </th>

                      <th>Condomínio</th>
                      <th>CNPJ</th>
                      <th>Vencimento</th>
                      <th>Valor</th>

                    </tr>
                  </thead>

                  <tbody>
                    {condominiosCompra.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'center',
                            padding: 32,
                            color: '#9ca3af',
                          }}
                        >
                          Nenhum boleto encontrado.
                        </td>
                      </tr>
                    ) : (
                      condominiosCompra.map((condominio) => {
                        const checked = selectedCondominios.has(condominio._index)

                        return (
                          <tr
                            key={`${condominio._key}-${condominio._index}`}
                            style={{
                              cursor: 'pointer',
                              background: checked
                                ? 'rgba(37, 99, 235, 0.06)'
                                : undefined,
                            }}
                            onClick={() => toggleCondominio(condominio._index)}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  toggleCondominio(condominio._index)
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>

                            <td>
                              <strong>{condominio._nome}</strong>

                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                                Documento: {condominio._documento}
                              </div>

                              <div
                                style={{
                                  fontSize: 12,
                                  color: condominio._baixa ? '#16a34a' : '#dc2626',
                                  marginTop: 2,
                                  fontWeight: 700,
                                }}
                              >
                                {condominio._baixa ? 'Pago/Baixado' : 'Pendente'}
                              </div>
                            </td>

                            <td style={{ color: '#64748b', fontSize: 13 }}>
                              {condominio._cnpjOriginal}
                            </td>

                            <td style={{ color: '#64748b', fontSize: 13 }}>
                              {fmtDate(condominio._vencimento)}
                            </td>

                            <td style={{ fontWeight: 700 }}>
                              {fmtMoney(condominio._valor)}
                            </td>

                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </S.BoletoTable>
              </S.BoletoTableWrap>
            </S.BoletoModalBody>

            <S.ModalFooter>
              <S.BoletoFooterInfo>
                {selectedCondominios.size} de {condominiosCompra.length} boleto(s)
                selecionado(s)
              </S.BoletoFooterInfo>

              <S.Btn
                onClick={closeBoletoModal}
                disabled={downloadingId === boletoPedido.id}
              >
                Cancelar
              </S.Btn>

              <S.Btn
                $variant="primary"
                onClick={handleGerarTxt}
                disabled={
                  downloadingId === boletoPedido.id ||
                  selectedCondominios.size === 0
                }
              >
                {downloadingId === boletoPedido.id
                  ? 'Gerando...'
                  : `Gerar TXT (${selectedCondominios.size})`}
              </S.Btn>
            </S.ModalFooter>
          </S.BoletoModal>
        </S.Overlay>
      )}

    </PageLayout>
  )
}