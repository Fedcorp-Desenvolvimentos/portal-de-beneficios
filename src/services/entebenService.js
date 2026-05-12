import { apiFetch } from './api'

export const entebenService = {
  getCondominios: async () => {
    try {
      return await apiFetch('/entidades/condominios/', { method: 'GET' })
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error)
      throw error
    }
  },

  createCondominio: async (data) => {
    try {
      console.log("Criando condomínio com dados:", data)
      return await apiFetch('/entidades/condominios/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Erro ao criar condomínio:', error)
      throw error
    }
  },

  updateCondominio: async (cnpj, data) => {
    try {
      return await apiFetch(`/entidades/condominios/${cnpj}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Erro ao atualizar condomínio:', error)
      throw error
    }
  },

  deleteCondominio: async (cnpj) => {
    try {
      return await apiFetch(`/entidades/condominios/${cnpj}/`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Erro ao excluir condomínio:', error)
      throw error
    }
  },

  getFuncionarios: async () => {
    try {
      return await apiFetch('/entidades/funcionarios/', { method: 'GET' })
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error)
      throw error
    }
  },

  createFuncionario: async (data) => {
    try {
      return await apiFetch('/entidades/funcionarios/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Erro ao criar funcionário:', error)
      throw error
    }
  },

  updateFuncionario: async (cpf, data) => {
    try {
      console.log("Atualizando funcionário com CPF:", cpf, "e dados:", data)
      return await apiFetch(`/entidades/funcionarios/${cpf}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error)
      throw error
    }
  },
  
  getMovimentacoes: async () => {
    try {
      return await apiFetch('/beneficios/movimentacoes/', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error)
      throw error
    }
  },

  getFuncionarios: async () => {
    try {
      return await apiFetch('/entidades/funcionarios/', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error)
      throw error
    }
  },

  getcondominios: async () => {
    try {
      return await apiFetch('/entidades/condominios/', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Erro ao buscar condomínios:', error)
      throw error
    }
  },

  getImportacoes: async () => {
    try {
      return await apiFetch('/beneficios/importacoes/', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Erro ao buscar importações:', error)
      throw error
    }
  },

  getUltimaImportacao: async () => {
    try {
      return await apiFetch('/beneficios/importacoes/ultima/', {
        method: 'GET',
      })
    } catch (error) {
      const message = String(error?.message || '')

      if (
        message.includes('404') ||
        message.includes('Nenhuma importação encontrada')
      ) {
        return null
      }

      console.error('Erro ao buscar última importação:', error)
      throw error
    }
  },

  repetirUltimoFaturamento: async () => {
    try {
      const [ultima, importacoes] = await Promise.all([
        apiFetch('/beneficios/importacoes/ultima/', {
          method: 'GET',
        }),
        apiFetch('/beneficios/importacoes/', {
          method: 'GET',
        }),
      ])

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
        message.includes('Nenhuma importação encontrada')
      ) {
        return null
      }

      console.error('Erro ao repetir último faturamento:', error)
      throw error
    }
  },

  getFaturamentoStatus: async (id) => {
    return apiFetch(`/upload/faturamento/${id}/status/`, {
      method: 'GET',
    })
  },

  exportarFaturamento: async () => {
    return apiFetch('/upload/export/faturamento/', {
      method: 'GET',
    })
  },

  getBeneficios: async () => {
    try {
      return await apiFetch('/beneficios/produtos/', {
        method: 'GET',
      })
    } catch (error) {
      console.error('Erro ao buscar produtos/benefícios:', error)
      throw error
    }
  },

  downloadDocumentoFaturamento: async (id, tipo = '') => {
  try {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('access') ||
      localStorage.getItem('token')

    const baseUrl =
      'https://vr-beneficios-backend-fedcorp-ju482.ondigitalocean.app/api'

    const endpoint = tipo
      ? `${baseUrl}/upload/faturamento/${id}/download/${tipo}`
      : `${baseUrl}/upload/faturamento/${id}/download/`

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    })

    if (!response.ok) {
      throw new Error(
        `Erro ao baixar documento (${response.status})`
      )
    }

    return await response.blob()
  } catch (error) {
    console.error(
      'Erro ao baixar documento faturamento:',
      error
    )

    throw error
  }
},

}

