import api from "./api"

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

  return `${API_BASE}/api/upload/export/faturamento/${
    queryString ? `?${queryString}` : ''
  }`
}

function getCompraVTUrl(params = {}) {
  const query = new URLSearchParams(params).toString()
  const API_BASE = getApiBaseUrl()

  return `${API_BASE}/api/upload/export/vt-compra/${
    query ? `?${query}` : ''
  }`
}

function getCompraTxtUrl(params = {}) {
  const query = new URLSearchParams(params).toString()
  const API_BASE = getApiBaseUrl()

  return `${API_BASE}/api/upload/export/txt-compra/${
    query ? `?${query}` : ''
  }`
}

async function readErrorMessageFromResponse(response, fallbackMessage) {
  try {
    const text = await response.text()

    try {
      const json = JSON.parse(text)
      return json?.detail || json?.message || fallbackMessage
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
      return json?.detail || json?.message || fallbackMessage
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

export const faturamentoService = {
  async importarDocumentos({
    importacaoId,
    competencia,
    arquivoBoleto,
    arquivoNotaDebito,
    arquivoNotaFiscal = null,
  }) {
    const formData = new FormData()

    formData.append('importacao_id', importacaoId)
    formData.append('competencia', competencia)

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

  async listarPedidosFuncionario() {
    const response = await api.get('/api/beneficios/importacoes/')
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

  async listarImportacoes() {
    const response = await api.get('/api/beneficios/importacoes/')
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

    const importacoes = await faturamentoService.listarImportacoes()

    return (
      importacoes.find(
        (item) =>
          String(item.id) === String(importacaoId) ||
          String(item.file_upload_id) === String(importacaoId) ||
          String(item.faturamento_id) === String(importacaoId)
      ) || null
    )
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
        // Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
      finalFilename = filename.endsWith('.xlsx') || filename.endsWith('.xls')
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

  async baixarTxtCompra(params = {}, filename = 'compra') {
    const url = getCompraTxtUrl(params)
    const token = getAuthToken()

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: 'text/plain',
      },
    })

    const contentType = response.headers.get('content-type') || ''

    if (!response.ok) {
      const errorMessage = await readErrorMessageFromResponse(
        response,
        'Não foi possível baixar o TXT de compra.'
      )

      throw new Error(errorMessage)
    }

    const text = await response.text()

    if (!text) {
      throw new Error('O backend retornou um TXT vazio.')
    }

    const blob = new Blob([text], {
      type: contentType || 'text/plain;charset=utf-8',
    })

    const finalFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`

    downloadBlob(blob, finalFilename)

    return {
      filename: finalFilename,
      contentType,
      size: blob.size,
    }
  },
}