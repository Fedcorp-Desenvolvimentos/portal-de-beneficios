import React, { useMemo, useState } from 'react'
import FileUpload from '../../components/FileUpload'
import { PencilLine, Trash2, Check, X as XIcon, Eye } from 'lucide-react'
import '../../styles/Importacao.css'
import { uploadService } from '../../services/uploadService'
import { toast } from 'react-toastify'
import {
  aplicarAjusteLimiteBeneficios,
  prepararDadosParaEnvio,
} from '../../utils/ajuste_calculo_importacao'

import { useAuth } from '../../context/AuthContext'

function Modal({ open, title, onClose, children }) {
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
  return Number(row?.quantidade_dias || row?.quantidade || row?.dias || row?.dias_trabalhados || row?.quantidadeDias || 0)
}

function getRowValidation(row) {
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

  const bloqueadoPorValor = Number(valor) > 2500

  return {
    erros,
    bloqueadoPorValor,
    bloqueado: erros.length > 0 || bloqueadoPorValor,
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

export default function Importacao() {
  const [data, setData] = useState(null)
  const [dataSincronizada, setDataSincronizada] = useState(null)

  const { user } = useAuth()

  // console.log("data", data)

  const [lote, setLote] = useState({
    id: null,
    arquivo: null,
    tipo: null,
    rows: [],
    excluidosPorColab: new Set(),
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [mostrarSomenteAcima2500, setMostrarSomenteAcima2500] = useState(false)

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

  const [reviewData, setReviewData] = useState({
    totalFuncionarios: 0,
    totalMovimentacoes: 0,
    valorTotalBeneficios: 0,
    periodoInicio: '',
    periodoFim: '',
    competenciaMes: '',
    competenciaAno: '',
    vencimento: '',
  })

  const [formEnvio, setFormEnvio] = useState({
    periodoInicio: '',
    periodoFim: '',
    competenciaMes: '',
    competenciaAno: String(new Date().getFullYear()),
    vencimento: '',
  })

  async function handleResult({ file }) {
    try {
      const response = await uploadService.uploadFile(file, user?.administradora_id)

      const id = 'IMP-' + (response?.file_upload_id || Date.now())
      const tipo = file.name.toLowerCase().includes('fat') ? 'faturamento' : 'compra'

      const movimentacoes = getMovimentacoesBackend(response)

      const previewRowsBackend =
        response?.summary?.total_por_beneficiario ||
        response?.data_to_backend?.summary?.total_por_beneficiario ||
        response?.total_por_beneficiario ||
        response?.resumo ||
        response?.preview ||
        []

      const previewRows =
        Array.isArray(previewRowsBackend) && previewRowsBackend.length > 0
          ? previewRowsBackend
          : Array.isArray(movimentacoes) && movimentacoes.length > 0
            ? buildPreviewRowsFromMovimentacoes(movimentacoes)
            : []

      const parsed = enrichRowsWithBenefits(previewRows, movimentacoes)

      const errosImportacao =
        response?.errors ||
        response?.invalid_rows ||
        response?.rejeitados ||
        response?.linhas_com_erro ||
        response?.summary?.errors ||
        response?.data_to_backend?.summary?.errors ||
        []

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

        setDetailsOpen(false)
        setDetailsTitle('')
        setDetailsBenefits([])
        setDetailsRowKey(null)
        setEditingBenefitIndex(null)
        setEditBenefitValue('')
        setConfirmDeleteOpen(false)
        setColaboradorParaExcluir(null)
        setReviewOpen(false)
        setMostrarSomenteAcima2500(false)

        setReviewData({
          totalFuncionarios: 0,
          totalMovimentacoes: 0,
          valorTotalBeneficios: 0,
          periodoInicio: '',
          periodoFim: '',
          competenciaMes: '',
          competenciaAno: '',
          vencimento: '',
        })

        let mensagemErro =
          response?.detail ||
          response?.message ||
          response?.error ||
          'Nenhum registro válido foi encontrado no arquivo. Verifique CPF e demais campos obrigatórios.'

        if (Array.isArray(errosImportacao) && errosImportacao.length > 0) {
          const primeiroErro =
            typeof errosImportacao[0] === 'string'
              ? errosImportacao[0]
              : errosImportacao[0]?.message ||
                errosImportacao[0]?.erro ||
                JSON.stringify(errosImportacao[0])

          mensagemErro = `Importação rejeitada. ${primeiroErro}`
        }

        toast.error(mensagemErro)

        return {
          success: false,
        }
      }

      setData(response)

      setLote({
        id,
        arquivo: file.name,
        tipo,
        rows: parsed,
        excluidosPorColab: new Set(),
      })

      setDetailsOpen(false)
      setDetailsTitle('')
      setDetailsBenefits([])
      setDetailsRowKey(null)
      setEditingBenefitIndex(null)
      setEditBenefitValue('')
      setConfirmDeleteOpen(false)
      setColaboradorParaExcluir(null)
      setReviewOpen(false)
      setMostrarSomenteAcima2500(false)

      setReviewData({
        totalFuncionarios: 0,
        totalMovimentacoes: 0,
        valorTotalBeneficios: 0,
        periodoInicio: '',
        periodoFim: '',
        competenciaMes: '',
        competenciaAno: '',
        vencimento: '',
      })

      toast.success(response?.detail || 'Importação realizada com sucesso')

      return {
        success: true,
      }
    } catch (error) {
      const errorMessage = error.message.includes('API Error')
        ? error.message.split('API Error: ')[1]
        : 'Erro desconhecido na comunicação com o servidor.'

      console.error('Erro no processamento da importação:', error)
      toast.error(errorMessage)

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

  const linhasValidadas = useMemo(() => {
    return rowsAtivas.map((r) => {
      const validacao = getRowValidation(r)

      return {
        ...r,
        bloqueado: validacao.bloqueado,
        bloqueadoPorValor: validacao.bloqueadoPorValor,
        errosValidacao: validacao.erros,
      }
    })
  }, [rowsAtivas])

  const totalBloqueios = useMemo(
    () => linhasValidadas.filter((r) => r.bloqueado).length,
    [linhasValidadas]
  )

  const linhasExibidas = useMemo(() => {
    if (mostrarSomenteAcima2500) {
      return linhasValidadas.filter((r) => r.bloqueado)
    }

    return linhasValidadas
  }, [linhasValidadas, mostrarSomenteAcima2500])

  const podeEnviar = linhasValidadas.length > 0 && totalBloqueios === 0

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
    })

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
    setMostrarSomenteAcima2500(false)

    setReviewData({
      totalFuncionarios: 0,
      totalMovimentacoes: 0,
      valorTotalBeneficios: 0,
      periodoInicio: '',
      periodoFim: '',
      competenciaMes: '',
      competenciaAno: '',
      vencimento: '',
    })
  }

  const abrirModalEnvio = () => {
    if (enviandoLote) return
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

    toast.success('Benefício atualizado com sucesso.')
  }

  const abrirModalRevisao = (e) => {
    e.preventDefault()

    if (enviandoLote) return

    if (!data || !data.data_to_backend) {
      console.error('Dados de envio não disponíveis')
      toast.error('Erro: dados do arquivo não disponíveis')
      return
    }

    const dataSincronizada = prepararDadosParaEnvio(lote, data.data_to_backend, 2500)

    let totalMovimentacoes = 0
    let valorTotalBeneficios = 0

    linhasValidadas.forEach((row) => {
      const valor = getValorRow(row)
      valorTotalBeneficios += valor

      if (row.beneficios && Array.isArray(row.beneficios)) {
        totalMovimentacoes += row.beneficios.length
      }
    })

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
      vencimento: formEnvio.vencimento || `2026-04-30`,
    })

    setDataSincronizada(dataSincronizada)

    setModalOpen(false)
    setReviewOpen(true)
  }

  const confirmarEnvio = async () => {
    if (enviandoLote) return

    if (!lote || !lote.rows || lote.rows.length === 0) {
      toast.error('Não há dados para enviar')
      return
    }

    if (!data || !data.data_to_backend) {
      toast.error('Dados do arquivo não disponíveis')
      return
    }

    try {
      setEnviandoLote(true)

      const loteComAjustes = aplicarAjusteLimiteBeneficios(lote, 2500)
      const dataToBackendSincronizado = prepararDadosParaEnvio(loteComAjustes, data.data_to_backend, 2500)

      const vencimentoFormatado = formEnvio.vencimento || reviewData.vencimento || ''

      dataToBackendSincronizado.periodo_inicio = formEnvio.periodoInicio || reviewData.periodoInicio
      dataToBackendSincronizado.periodo_fim = formEnvio.periodoFim || reviewData.periodoFim
      dataToBackendSincronizado.competencia_mes = formEnvio.competenciaMes || reviewData.competenciaMes
      dataToBackendSincronizado.competencia_ano = formEnvio.competenciaAno || reviewData.competenciaAno
      dataToBackendSincronizado.vencimento = vencimentoFormatado
      dataToBackendSincronizado.tipo_processamento = lote.tipo || 'compra'
      dataToBackendSincronizado.origem = 'importacao_faturamento'
      dataToBackendSincronizado.file_upload_id = data.file_upload_id || lote.id?.replace('IMP-', '') || 228

      let totalFuncionarios = 0
      let totalMovimentacoes = 0
      let valorTotalBeneficios = 0
      const funcionariosMap = new Map()

      loteComAjustes.rows.forEach((func) => {
        if (!funcionariosMap.has(func.cpf)) {
          funcionariosMap.set(func.cpf, func)
          totalFuncionarios++
        }

        const valor = typeof func.valor_total === 'string' ? parseFloat(func.valor_total) : func.valor_total
        valorTotalBeneficios += valor

        if (func.beneficios) {
          totalMovimentacoes += func.beneficios.length
        }
      })

      if (!dataToBackendSincronizado.summary) {
        dataToBackendSincronizado.summary = {}
      }

      dataToBackendSincronizado.summary.total_funcionarios = totalFuncionarios
      dataToBackendSincronizado.summary.total_movimentacoes = totalMovimentacoes
      dataToBackendSincronizado.summary.valor_total_beneficios = valorTotalBeneficios.toFixed(2)

      const errosAtuais = []

      loteComAjustes.rows.forEach((func) => {
        const valor = typeof func.valor_total === 'string' ? parseFloat(func.valor_total) : func.valor_total

        if (valor > 2500) {
          errosAtuais.push(
            `Valor total do funcionário ${func.nome_funcionario} R$ ${valor.toFixed(2)} excede limite de R$ 2.500,00`
          )
        }
      })

      dataToBackendSincronizado.errors = errosAtuais
      dataToBackendSincronizado.linhas_com_erro = errosAtuais.map(erro => ({ mensagem: erro }))

      let administradoraId = user?.administradora_id || dataToBackendSincronizado.administradora_id || null
      
      // Montar objeto final para envio
      const dadosParaEnvio = {
        file_upload_id: data.file_upload_id || Number(lote.id?.replace('IMP-', '')) || 228,
        administradora_id: administradoraId,
        condominios: dataToBackendSincronizado.condominios || [],
        errors: errosAtuais,
        linhas_com_erro: dataToBackendSincronizado.linhas_com_erro || [],
        summary: dataToBackendSincronizado.summary,
        movimentacoes_detalhada: dataToBackendSincronizado.movimentacoes_detalhada || [],
        periodo_inicio: dataToBackendSincronizado.periodo_inicio,
        periodo_fim: dataToBackendSincronizado.periodo_fim,
        competencia_mes: dataToBackendSincronizado.competencia_mes,
        competencia_ano: dataToBackendSincronizado.competencia_ano,
        vencimento: dataToBackendSincronizado.vencimento,
        tipo_processamento: dataToBackendSincronizado.tipo_processamento,
        origem: dataToBackendSincronizado.origem,
        status: 'PARSED',
        detail: 'Arquivo processado. Confirme os dados para gravação.',
      }

      const responseEnvio = await uploadService.confirmUpload(dadosParaEnvio)

      toast.success(responseEnvio?.detail || responseEnvio?.message || 'Lote enviado com sucesso!')

      setReviewOpen(false)
      setModalOpen(false)

      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (error) {
      console.error('Erro no envio:', error)
      toast.error(`Erro: ${error.message}`)
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

      {lote.id && (
        <div className="lote-card">
          <div className="lote-header">
            <div>
              <h3>Pré-validação do Lote</h3>
              <small>
                Arquivo: <strong>{lote.arquivo}</strong> • Tipo: <strong>{lote.tipo}</strong>
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

            <button
              type="button"
              className={`kpi kpi-button ${totalBloqueios > 0 ? 'kpi-alert' : ''} ${
                mostrarSomenteAcima2500 ? 'kpi-active' : ''
              }`}
              onClick={() => {
                if (totalBloqueios > 0 && !enviandoLote) {
                  setMostrarSomenteAcima2500((prev) => !prev)
                }
              }}
              disabled={totalBloqueios === 0 || enviandoLote}
            >
              <span className="kpi-label">
                {mostrarSomenteAcima2500
                  ? 'Mostrando registros com bloqueio'
                  : 'Filtrar registros com bloqueio'}
              </span>
              <span className="kpi-value">{totalBloqueios}</span>
            </button>
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
                      Nenhum registro encontrado para pré-visualização.
                    </td>
                  </tr>
                ) : (
                  linhasExibidas.map((r, idx) => {
                    const valorExibicao = getValorRow(r)
                    const nomeColaborador = getNomeColaborador(r)

                    return (
                      <tr
                        key={`${getRowKey(r)}-${idx}`}
                        className={r.bloqueado ? 'row-bloqueado' : ''}
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
                              ) : r.bloqueadoPorValor ? (
                                <small className="status-detail">
                                  Valor acima de R$ 2.500,00
                                </small>
                              ) : null}
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

            {!podeEnviar && (
              <span className="hint">Resolva os bloqueios para habilitar o envio.</span>
            )}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title="Informações obrigatórias"
        onClose={() => !enviandoLote && setModalOpen(false)}
        locked={enviandoLote}
      >
        <form onSubmit={abrirModalRevisao} className="form-grid">
          <div className="form-row two-cols">
            <label>
              <span>Período de Utilização — Início</span>
              <input
                type="date"
                value={formEnvio.periodoInicio}
                onChange={(e) =>
                  setFormEnvio((prev) => ({ ...prev, periodoInicio: e.target.value }))
                }
                required
                disabled={enviandoLote}
              />
            </label>

            <label>
              <span>Período de Utilização — Fim</span>
              <input
                type="date"
                min={formEnvio.periodoInicio || undefined}
                value={formEnvio.periodoFim}
                onChange={(e) =>
                  setFormEnvio((prev) => ({ ...prev, periodoFim: e.target.value }))
                }
                required
                disabled={enviandoLote}
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
          </div>

          <label>
            <span>Vencimento</span>
            <input
              type="date"
              value={formEnvio.vencimento}
              onChange={(e) =>
                setFormEnvio((prev) => ({ ...prev, vencimento: e.target.value }))
              }
              required
              disabled={enviandoLote}
            />
          </label>

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
    </div>
  )
}