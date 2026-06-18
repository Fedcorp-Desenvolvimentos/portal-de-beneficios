import api from "./api"

const limparParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ''
    )
  )

const buscarCondominios = async (params = {}) => {
  const response = await api.get('/api/entidades/condominios/', {
    params: limparParams(params),
  })

  return response.data
}

export const entebenService = {
  getCondominios: async (cnpjOuParams = '', page = 1) => {
  try {
    let params = {}

    if (typeof cnpjOuParams === 'object' && cnpjOuParams !== null) {
      params = { ...cnpjOuParams }
    } else {
      if (cnpjOuParams) params.cnpj = cnpjOuParams
      if (page > 1) params.page = page
    }

    return await buscarCondominios(params)
  } catch (error) {
    console.error('Erro ao buscar condomínios:', error)
    throw error
  }
},

  // createCondominio: async (data) => {
  //   try {
  //     // console.log("Criando condomínio com dados:", data)
  //     const response = await api.post('/api/entidades/condominios/', data)
  //     return response.data
  //   } catch (error) {
  //     console.error('Erro ao criar condomínio:', error)
  //     throw error
  //   }
  // },

  updateCondominio: async (cnpj, data) => {
    try {
      const response = await api.put(`/api/entidades/condominios/${cnpj}/`, data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar condomínio:', error)
      throw error
    }
  },

  deleteCondominio: async (cnpj) => {
    try {
      const response = await api.delete(`/api/entidades/condominios/${cnpj}/`)
      return response.data
    } catch (error) {
      console.error('Erro ao excluir condomínio:', error)
      throw error
    }
  },

  getFuncionarios: async () => {
    try {
      const response = await api.get('/api/entidades/funcionarios/')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error)
      throw error
    }
  },

  createFuncionario: async (data) => {
    try {
      const response = await api.post('/api/entidades/funcionarios/', data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar funcionário:', error)
      throw error
    }
  },

  updateFuncionario: async (cpf, data) => {
    try {
      // console.log("Atualizando funcionário com CPF:", cpf, "e dados:", data)
      const response = await api.put(`/api/entidades/funcionarios/${cpf}/`, data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error)
      throw error
    }
  },
  
  getMovimentacoes: async () => {
    try {
      const response = await api.get('/api/beneficios/movimentacoes/')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error)
      throw error
    }
  },

  getcondominios: async () => {
    try {
      const response = await api.get('/api/entidades/condominios/')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error)
      throw error
    }
  },

  getImportacoes: async () => {
    try {
      const response = await api.get('/api/beneficios/importacoes/')
      // console.log("Importações recebidas:", response.data)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar importações:', error)
      throw error
    }
  },

  getUltimaImportacao: async () => {
    try {
      const response = await api.get('/api/beneficios/importacoes/ultima/')
      // console.log("Última importação recebida:", response.data)
      return response.data
    } catch (error) {
      const message = String(error?.message || '')

      if (
        message.includes('404') ||
        message.includes('Nenhuma importação encontrada') ||
        error.response?.status === 404
      ) {
        return null
      }

      console.error('Erro ao buscar última importação:', error)
      throw error
    }
  },

  getUltimaMovimentacao: async () => {
    try {
      const response = await api.get('/api/beneficios/importacoes/ultima-movimentacao/')
      // console.log("Response MOVIMENTAÇÃO:", response.data)
      return response.data
    } catch (error) {
      const message = String(error?.message || '')
      console.error('Erro ao buscar última movimentação:', error)
      
      if (message.includes('404') || error.response?.status === 404) {
        return null
      }
      
      throw error
    }
  },

  repetirUltimoFaturamento: async () => {
    try {
      const [ultimaResponse, importacoesResponse] = await Promise.all([
        api.get('/api/beneficios/importacoes/ultima/'),
        api.get('/api/beneficios/importacoes/'),
      ])

      const ultima = ultimaResponse.data
      const importacoes = importacoesResponse.data

      const historico = Array.isArray(importacoes)
        ? importacoes
        : importacoes?.results || importacoes?.data || []

      const metaUltima = historico[0] || {}

      const condominios =
        ultima?.condominios ||
        ultima?.dados_requisicao?.condominios ||
        metaUltima?.condominios ||
        metaUltima?.dados_requisicao?.condominios ||
        []

      const funcionarios = condominios.flatMap((condo) =>
        Array.isArray(condo?.funcionarios) ? condo.funcionarios : []
      )

      const movimentacoes = funcionarios.flatMap((func) =>
        Array.isArray(func?.movimentacoes) ? func.movimentacoes : []
      )

      const valorTotalMovimentacoes = movimentacoes.reduce(
        (sum, mov) => sum + Number(mov?.valor || mov?.valor_total || 0),
        0
      )

      const valorTotal =
        valorTotalMovimentacoes ||
        ultima?.valor_total ||
        ultima?.total ||
        ultima?.valor_total_beneficios ||
        ultima?.summary?.valor_total_beneficios ||
        ultima?.dados_requisicao?.valor_total_beneficios ||
        ultima?.dados_requisicao?.total ||
        ultima?.dados_requisicao?.total_geral ||
        ultima?.dados_requisicao?.summary?.valor_total_beneficios ||
        metaUltima?.valor_total ||
        metaUltima?.total ||
        metaUltima?.valor_total_beneficios ||
        metaUltima?.summary?.valor_total_beneficios ||
        metaUltima?.dados_requisicao?.valor_total_beneficios ||
        metaUltima?.dados_requisicao?.total ||
        metaUltima?.dados_requisicao?.total_geral ||
        metaUltima?.dados_requisicao?.summary?.valor_total_beneficios ||
        0

      return {
        ...metaUltima,
        ...ultima,

        id: metaUltima?.id || ultima?.id,
        importacao_id: metaUltima?.id || ultima?.id,
        faturamento_id: metaUltima?.faturamento_id || metaUltima?.id || ultima?.id,

        competencia: metaUltima?.vigencia_inicio
          ? metaUltima.vigencia_inicio.slice(0, 7)
          : '',

        referencia:
          metaUltima?.vigencia_inicio && metaUltima?.vigencia_fim
            ? `${metaUltima.vigencia_inicio} até ${metaUltima.vigencia_fim}`
            : '',

        data_vencimento:
          metaUltima?.data_vencimento ||
          ultima?.data_vencimento ||
          '',

        vigencia_inicio:
          metaUltima?.vigencia_inicio ||
          ultima?.vigencia_inicio ||
          '',

        vigencia_fim:
          metaUltima?.vigencia_fim ||
          ultima?.vigencia_fim ||
          '',

        condominios,
        registros: condominios,

        resumo_anterior: {
          condominios: condominios.length,
          colaboradores:
            funcionarios.length ||
            Number(metaUltima?.registros_processados || ultima?.registros_processados || 0),
          movimentacoes:
            movimentacoes.length ||
            Number(metaUltima?.total_movimentacoes || ultima?.total_movimentacoes || 0),
          valorTotal,
        },

        raw: {
          ultima,
          metaUltima,
        },
      }
    } catch (error) {
      const message = String(error?.message || '')

      if (
        message.includes('404') ||
        message.includes('Nenhuma importação encontrada') ||
        error.response?.status === 404
      ) {
        return null
      }

      console.error('Erro ao repetir último faturamento:', error)
      throw error
    }
  },

  getFaturamentoStatus: async (id) => {
    const response = await api.get(`/api/upload/faturamento/${id}/status/`)
    return response.data
  },

  exportarFaturamento: async () => {
    const response = await api.get('/api/upload/export/faturamento/', {
      responseType: 'blob' // Para download de arquivos
    })
    return response.data
  },

  getBeneficios: async () => {
    try {
      const response = await api.get('/api/beneficios/produtos/')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar produtos/benefícios:', error)
      throw error
    }
  },

  downloadDocumentoFaturamento: async (id, tipo = '') => {
    const endpoint = tipo
      ? `/api/upload/faturamento/${id}/download/${tipo}`
      : `/api/upload/faturamento/${id}/download/`

    const response = await api.get(endpoint, {
      responseType: 'blob'
    })

    return response.data
  },
}