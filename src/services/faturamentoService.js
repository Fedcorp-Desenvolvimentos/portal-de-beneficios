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

function inferExtension(contentType) {
  const type = (contentType || '').toLowerCase()

  if (type.includes('spreadsheetml')) return 'xlsx'
  if (type.includes('ms-excel')) return 'xls'
  if (type.includes('csv')) return 'csv'
  if (type.includes('json')) return 'json'
  if (type.includes('pdf')) return 'pdf'
  if (type.includes('zip')) return 'zip'

  return 'bin'
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
    return this.importarDocumentos(payload)
  },

  async listarPedidosFuncionario() {
    const response = await api.get('/api/beneficios/importacoes/')
    return response.data
  },

  async listarPedidos() {
    return this.listarPedidosFuncionario()
  },

  async listarDocumentos() {
    return this.listarPedidosFuncionario()
  },

  async listarDocumentosPorPedido(pedidoId) {
    const response = await this.listarPedidosFuncionario()
    const pedidos = normalizeArray(response)

    return pedidos.find((pedido) => String(pedido.id) === String(pedidoId)) || null
  },

  async listarImportacoes() {
    const response = await api.get('/api/beneficios/importacoes/')
    return normalizeArray(response.data)
  },

  async buscarUltimaImportacao() {
    const importacoes = await this.listarImportacoes()

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

    const importacoes = await this.listarImportacoes()

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

  getExportFaturamentoUrl(params = {}) {
    const query = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value)
      }
    })

    const queryString = query.toString()

    const API_BASE =
      import.meta.env.VITE_API_URL || 'http://localhost:8000'

    return `${API_BASE}/api/upload/export/faturamento/${
      queryString ? `?${queryString}` : ''
    }`
  },

  async baixarExportFaturamento(params = {}, nomeBase = 'faturamento') {
    const url = this.getExportFaturamentoUrl(params)
    const token = getAuthToken()

    // console.log('📥 Baixando de:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      let errorMessage = 'Não foi possível baixar o arquivo de faturamento.'
      try {
        const errorData = await response.json()
        if (errorData?.detail) errorMessage = errorData.detail
      } catch {
        // ignora
      }
      throw new Error(errorMessage)
    }

    const contentDisposition = response.headers.get('content-disposition') || ''
    const contentType = response.headers.get('content-type') || ''
    const blob = await response.blob()
    
    // console.log('📄 Content-Type:', contentType)
    // console.log('📎 Content-Disposition:', contentDisposition)
    // console.log('📦 Tamanho do blob:', blob.size, 'bytes')
    
    // Extrair filename do header
    let filename = null
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '')
    }
    
    if (!filename) {
      filename = `${nomeBase}_${Date.now()}.xlsx`
    }

    // Garantir extensão .xlsx
    if (!filename.endsWith('.xlsx') && !filename.endsWith('.xls')) {
      filename = filename.replace(/\.(bin|txt|dat|unknown)$/i, '') + '.xlsx'
    }

    // console.log('💾 Salvando como:', filename)

    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    }, 100)

    return { filename, contentType, size: blob.size }
  },

  async alterarStatusPedido(pedidoId, novoStatus, motivo = '') {
    const payload = {
      status: novoStatus,
      ...(motivo && { motivo }),
    }

    const response = await api.patch(`/api/beneficios/importacoes/${pedidoId}/status/`, payload)
    return response.data
  },

  async baixarTxtCompra(params, filename = 'compra') {
    const query = new URLSearchParams(params).toString()

    const response = await fetch(
      `https://vr-beneficios-backend-fedcorp-ju482.ondigitalocean.app/api/upload/export/txt-compra/?${query}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    )

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || 'Não foi possível baixar o TXT de compra.')
    }

    const text = await response.text()
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${filename}.txt`

    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
  }
}