import api from './api'

function getAuthToken() {
  try {
    const rawAuth = localStorage.getItem('auth') || sessionStorage.getItem('auth')

    if (rawAuth) {
      const parsed = JSON.parse(rawAuth)
      if (parsed?.access) return parsed.access
      if (parsed?.token) return parsed.token
    }
  } catch {
    // ignora parse inválido
  }

  return (
    localStorage.getItem('access') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('access') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    ''
  )
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.pedidos)) return value.pedidos
  if (Array.isArray(value?.importacoes)) return value.importacoes
  return []
}

function extractFilenameFromDisposition(contentDisposition) {
  if (!contentDisposition) return null

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1])

  const basicMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
  return basicMatch?.[1] || null
}

function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_URL ||
    api.defaults.baseURL ||
    'https://vr-beneficios-backend-fedcorp-ju482.ondigitalocean.app'
  ).replace(/\/$/, '')
}

function getExportFaturamentoUrl(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value)
    }
  })

  const queryString = query.toString()
  const API_BASE = getApiBaseUrl()

  return `${API_BASE}/api/upload/export/faturamento/${queryString ? `?${queryString}` : ''}`
}

function getCompraVTUrl(params = {}) {
  const query = new URLSearchParams(params).toString()
  const API_BASE = getApiBaseUrl()

  return `${API_BASE}/api/upload/export/vt-compra/${query ? `?${query}` : ''}`
}

async function readErrorMessageFromResponse(response, fallbackMessage) {
  try {
    const text = await response.text()

    try {
      const json = JSON.parse(text)
      return json?.detail || json?.message || json?.error || fallbackMessage
    } catch {
      return text || fallbackMessage
    }
  } catch {
    return fallbackMessage
  }
}

async function readErrorMessageFromBlob(blob, fallbackMessage) {
  try {
    const text = await blob.text()

    try {
      const json = JSON.parse(text)
      return json?.detail || json?.message || json?.error || fallbackMessage
    } catch {
      return text || fallbackMessage
    }
  } catch {
    return fallbackMessage
  }
}

function downloadBlob(blob, filename) {
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = blobUrl
  link.download = filename

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(blobUrl)
}

function normalizeTxtPayload(payload = {}) {
  const importacaoId =
    payload.importacao_id ||
    payload.importacaoId ||
    payload.id ||
    payload.pedidoId ||
    null

  const movimentacaoIds = Array.isArray(payload.movimentacao_ids)
    ? payload.movimentacao_ids
    : Array.isArray(payload.movimentacaoIds)
      ? payload.movimentacaoIds
      : null

  const dataCompetencia =
    payload.data_competencia ||
    payload.dataCompetencia ||
    payload.competencia ||
    null

  return {
    importacao_id: importacaoId,
    ...(movimentacaoIds?.length ? { movimentacao_ids: movimentacaoIds } : {}),
    ...(dataCompetencia ? { data_competencia: dataCompetencia } : {}),
  }
}

export const faturamentoService = {
  async importarDocumentos({
    importacaoId,
    competencia,
    arquivoBoleto,
    arquivoNotaDebito,
    arquivoNotaFiscal = null,
    mode = 'substituir',
  }) {
    const formData = new FormData()

    formData.append('importacao_id', importacaoId)
    formData.append('competencia', competencia)
    formData.append('mode', mode)

    if (arquivoBoleto) {
      formData.append('arquivo_boleto', arquivoBoleto)
    }

    if (arquivoNotaDebito) {
      formData.append('arquivo_nota_debito', arquivoNotaDebito)
    }

    if (arquivoNotaFiscal) {
      formData.append('arquivo_nota_fiscal', arquivoNotaFiscal)
    }

    const response = await api.post('/api/upload/faturamento/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  },

  async uploadDocumentos(payload) {
    return faturamentoService.importarDocumentos(payload)
  },

  async listarPedidosFuncionario(page = 1, limit = 500) {
    const response = await api.get('/api/beneficios/importacoes/', {
      params: { page, limit },
    })
    return response.data
  },

  async listarPedidos() {
    return faturamentoService.listarPedidosFuncionario()
  },

  async listarDocumentos() {
    return faturamentoService.listarPedidosFuncionario()
  },

  async listarDocumentosPorPedido(pedidoId) {
    const response = await faturamentoService.listarPedidosFuncionario()
    const pedidos = normalizeArray(response)

    return pedidos.find((pedido) => String(pedido.id) === String(pedidoId)) || null
  },

  async listarImportacoes(page = 1, limit = 100) {
    const response = await api.get('/api/beneficios/importacoes/', {
      params: { page, limit },
    })
    return normalizeArray(response.data)
  },

  async buscarUltimaImportacao() {
    const importacoes = await faturamentoService.listarImportacoes()

    return (
      importacoes
        .filter(Boolean)
        .sort((a, b) =>
          String(
            b.data_importacao ||
              b.processed_at ||
              b.created_at ||
              b.updated_at ||
              ''
          ).localeCompare(
            String(
              a.data_importacao ||
                a.processed_at ||
                a.created_at ||
                a.updated_at ||
                ''
            )
          )
        )[0] || null
    )
  },

  async buscarImportacaoPorId(importacaoId) {
    if (!importacaoId) return null

    try {
      const response = await api.get(`/api/beneficios/importacoes/${importacaoId}/`)
      const data = response.data
      return data?.importacao || data
    } catch (error) {
      console.warn(
        `Não foi possível buscar detalhe da importação ${importacaoId}. Tentando fallback pela listagem...`,
        error
      )

      const importacoes = await faturamentoService.listarImportacoes()

      return (
        importacoes.find(
          (item) =>
            String(item.id) === String(importacaoId) ||
            String(item.file_upload_id) === String(importacaoId) ||
            String(item.faturamento_id) === String(importacaoId) ||
            String(item.importacao_id) === String(importacaoId)
        ) || null
      )
    }
  },

  async buscarDadosSelecaoImportacao(importacaoId) {
    if (!importacaoId) {
      throw new Error('ID da importação não informado.')
    }

    const response = await api.get(`/api/upload/importacao/${importacaoId}/select-data/`)
    return response.data
  },

  async criarFaturamento(payload) {
    const response = await api.post('/api/upload/faturamento/repetir/', payload)
    return response.data
  },

  async criarFaturamentoIndividual(payload) {
    const response = await api.post('/api/upload/faturamento/individual/', payload)
    return response.data
  },

  getExportFaturamentoUrl(params = {}) {
    return getExportFaturamentoUrl(params)
  },

  async baixarExportFaturamento(params = {}, nomeBase = 'faturamento') {
    const url = getExportFaturamentoUrl(params)
    const token = getAuthToken()

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    const contentDisposition = response.headers.get('content-disposition') || ''
    const contentType = response.headers.get('content-type') || ''

    if (!response.ok) {
      const errorMessage = await readErrorMessageFromResponse(
        response,
        'Não foi possível baixar o arquivo de faturamento.'
      )

      throw new Error(errorMessage)
    }

    const blob = await response.blob()

    const isInvalidResponse =
      contentType.includes('application/json') ||
      contentType.includes('text/html') ||
      contentType.includes('text/plain')

    if (isInvalidResponse) {
      const errorMessage = await readErrorMessageFromBlob(
        blob,
        'O backend não retornou um Excel válido.'
      )

      console.error('Resposta inválida ao baixar Excel:', {
        url,
        contentType,
        contentDisposition,
        size: blob.size,
        errorMessage,
      })

      throw new Error(errorMessage)
    }

    if (!blob.size) {
      throw new Error('O backend retornou um arquivo vazio.')
    }

    let filename = extractFilenameFromDisposition(contentDisposition)

    if (!filename) {
      filename =
        nomeBase.endsWith('.xlsx') || nomeBase.endsWith('.xls')
          ? nomeBase
          : `${nomeBase}.xlsx`
    }

    if (!filename.endsWith('.xlsx') && !filename.endsWith('.xls')) {
      filename = `${filename}.xlsx`
    }

    downloadBlob(blob, filename)

    return {
      filename,
      contentType,
      size: blob.size,
    }
  },

  async alterarStatusPedido(pedidoId, novoStatus, motivo = '') {
    const payload = {
      status: novoStatus,
      ...(motivo && { motivo }),
    }

    const response = await api.patch(
      `/api/beneficios/importacoes/${pedidoId}/status/`,
      payload
    )

    return response.data
  },

  async refazerFaturamento(pedidoId) {
    try {
      const response = await api.post(
        `/api/beneficios/importacoes/${pedidoId}/refazer-faturamento/`
      )

      return response.data
    } catch (error) {
      console.error('Erro ao refazer faturamento:', error)

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Não foi possível refazer o faturamento.'

      throw new Error(message)
    }
  },

  async baixarExcelCompraVT(params = {}, filename = 'compra-vt') {
    const url = getCompraVTUrl(params)
    const token = getAuthToken()

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })

    const contentDisposition = response.headers.get('content-disposition') || ''
    const contentType = response.headers.get('content-type') || ''

    if (!response.ok) {
      const errorMessage = await readErrorMessageFromResponse(
        response,
        'Não foi possível baixar o Excel de compra VT.'
      )

      throw new Error(errorMessage)
    }

    const blob = await response.blob()

    const isInvalidResponse =
      contentType.includes('application/json') ||
      contentType.includes('text/html') ||
      contentType.includes('text/plain')

    if (isInvalidResponse) {
      const errorMessage = await readErrorMessageFromBlob(
        blob,
        'O backend não retornou um Excel de compra VT válido.'
      )

      console.error('Resposta inválida ao baixar Excel VT:', {
        url,
        contentType,
        contentDisposition,
        size: blob.size,
        errorMessage,
      })

      throw new Error(errorMessage)
    }

    if (!blob.size) {
      throw new Error('O backend retornou um arquivo vazio.')
    }

    let finalFilename = extractFilenameFromDisposition(contentDisposition)

    if (!finalFilename) {
      finalFilename =
        filename.endsWith('.xlsx') || filename.endsWith('.xls')
          ? filename
          : `${filename}.xlsx`
    }

    if (!finalFilename.endsWith('.xlsx') && !finalFilename.endsWith('.xls')) {
      finalFilename = `${finalFilename}.xlsx`
    }

    downloadBlob(blob, finalFilename)

    return {
      filename: finalFilename,
      contentType,
      size: blob.size,
    }
  },

  async baixarTxtCompra(payload = {}, filename = 'compra') {
    const finalPayload = normalizeTxtPayload(payload)

    if (!finalPayload.importacao_id) {
      throw new Error('ID da importação não informado para gerar o TXT de compra.')
    }

    const response = await api.post('/api/upload/export/txt-compra/', finalPayload, {
      responseType: 'blob',
      headers: {
        Accept: 'text/plain, application/octet-stream, */*',
        'Content-Type': 'application/json',
      },
    })

    const blob = response.data
    const contentDisposition = response.headers?.['content-disposition'] || ''
    const contentType = response.headers?.['content-type'] || ''

    const isInvalidResponse =
      contentType.includes('application/json') ||
      contentType.includes('text/html')

    if (isInvalidResponse) {
      const errorMessage = await readErrorMessageFromBlob(
        blob,
        'O backend não retornou um TXT válido.'
      )

      console.error('Resposta inválida ao baixar TXT:', {
        contentType,
        contentDisposition,
        size: blob?.size,
        errorMessage,
        payload: finalPayload,
      })

      throw new Error(errorMessage)
    }

    if (!blob?.size) {
      throw new Error('O backend retornou um TXT vazio.')
    }

    let finalFilename = extractFilenameFromDisposition(contentDisposition)

    if (!finalFilename) {
      finalFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`
    }

    if (!finalFilename.endsWith('.txt')) {
      finalFilename = `${finalFilename}.txt`
    }

    downloadBlob(blob, finalFilename)

    return {
      filename: finalFilename,
      contentType,
      size: blob.size,
    }
  },

  async buscarDadosSelecaoImportacao(importacaoId) {
    if (!importacaoId) {
      throw new Error('ID da importação não informado.')
    }

    const response = await api.get(`/api/upload/importacao/${importacaoId}/select-data/`)
    return response.data
  },

  async buscarMovimentacoesImportacao(importacaoId, movPage = 1, movLimit = 100) {
    if (!importacaoId) {
      throw new Error('ID da importação não informado.')
    }

    const response = await api.get(`/api/beneficios/importacoes/${importacaoId}/`, {
      params: { mov_page: movPage, mov_limit: movLimit },
    })
    return response.data
  },

  async marcarResponsavel(importacaoId) {
    if (!importacaoId) {
      throw new Error('ID da importação não informado.')
    }

    const response = await api.patch(`/api/beneficios/importacoes/${importacaoId}/responsavel/`, {
      acao: 'marcar',
    })
    return response.data
  },

  async desmarcarResponsavel(importacaoId) {
    if (!importacaoId) {
      throw new Error('ID da importação não informado.')
    }

    const response = await api.patch(`/api/beneficios/importacoes/${importacaoId}/responsavel/`, {
      acao: 'desmarcar',
    })
    return response.data
  },
}