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