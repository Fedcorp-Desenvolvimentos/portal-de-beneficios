import api from "./api"

export async function listarTodasAdministradoras() {
  try {
    const response = await api.get('/api/entidades/administradoras/')
    return response.data
  } catch (error) {
    console.error('Erro ao listar administradoras:', error)
    throw error
  }
}

export async function buscarAdministradoraPorId(id) {
  try {
    const response = await api.get(`/api/entidades/administradoras/${id}/`)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar administradora:', error)
    throw error
  }
}

export async function criarAdministradora(dados) {
  try {
    const response = await api.post('/api/entidades/administradoras/', dados)
    return response.data
  } catch (error) {
    console.error('Erro ao criar administradora:', error)
    throw error
  }
}

export async function editarAdministradora(id, dados) {
  try {
    const response = await api.put(`/api/entidades/administradoras/${id}/`, dados)
    return response.data
  } catch (error) {
    console.error('Erro ao editar administradora:', error)
    throw error
  }
}

export async function excluirAdministradora(id) {
  try {
    const response = await api.delete(`/api/entidades/administradoras/${id}/`)
    return response.data
  } catch (error) {
    console.error('Erro ao excluir administradora:', error)
    throw error
  }
}

export async function consultarPessoaPorCNPJ(cnpj) {
  try {
    const response = await api.get(`/api/consultas/pessoas/por-cnpj/${cnpj}/`)
    return response.data
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error)
    throw error
  }
}


// ============================================
// REGRAS DE VALOR
// ============================================

/**
 * Busca a regra de valor de uma administradora
 * @param {number|string} administradoraId - ID da administradora
 * @returns {Promise<Object>} Regra de valor { id, administradora_id, ativo, valor_limite, bloquear_acima_limite }
 */
export async function buscarRegraValorAdministradora(administradoraId) {
  try {
    const response = await api.get(`/api/entidades/administradoras/${administradoraId}/regra-valor/`)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar regra de valor:', error)
    throw error
  }
}

/**
 * Cria uma nova regra de valor para a administradora
 * @param {number|string} administradoraId - ID da administradora
 * @param {Object} payload - Dados da regra { ativo, valor_limite, bloquear_acima_limite }
 * @returns {Promise<Object>} Regra de valor criada
 */
export async function criarRegraValorAdministradora(administradoraId, payload) {
  try {
    const response = await api.post(`/api/entidades/administradoras/${administradoraId}/regra-valor/`, payload)
    return response.data
  } catch (error) {
    console.error('Erro ao criar regra de valor:', error)
    throw error
  }
}

/**
 * Atualiza uma regra de valor existente
 * @param {number|string} administradoraId - ID da administradora
 * @param {number|string} regraId - ID da regra (geralmente mesmo ID da administradora)
 * @param {Object} payload - Dados da regra { ativo, valor_limite, bloquear_acima_limite }
 * @returns {Promise<Object>} Regra de valor atualizada
 */
export async function atualizarRegraValorAdministradora(administradoraId, regraId, payload) {
  try {
    const response = await api.put(`/api/entidades/administradoras/${administradoraId}/regra-valor/${regraId}/`, payload)
    return response.data
  } catch (error) {
    console.error('Erro ao atualizar regra de valor:', error)
    throw error
  }
}

/**
 * Função auxiliar que decide se cria ou atualiza baseado na existência da regra
 * @param {number|string} administradoraId - ID da administradora
 * @param {Object} payload - Dados da regra
 * @param {Object|null} regraExistente - Regra existente (opcional)
 * @returns {Promise<Object>} Regra salva
 */
export async function salvarRegraValorAdministradora(administradoraId, payload, regraExistente = null) {
  if (regraExistente?.id) {
    return atualizarRegraValorAdministradora(administradoraId, regraExistente.id, payload)
  }
  return criarRegraValorAdministradora(administradoraId, payload)
}