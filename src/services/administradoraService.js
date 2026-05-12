import { apiFetch } from "./api"

export async function listarTodasAdministradoras() {
  try {
    const token = localStorage.getItem('accessToken')
    const result = await apiFetch('/entidades/administradoras/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return result
  } catch (error) {
    console.error('Erro ao listar administradoras:', error)
    throw error
  }
}

export async function buscarAdministradoraPorId(id) {
  try {
    const token = localStorage.getItem('accessToken')
    const result = await apiFetch(`/entidades/administradoras/${id}/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return result
  } catch (error) {
    console.error('Erro ao buscar administradora:', error)
    throw error
  }
}

export async function criarAdministradora(dados) {
  try {
    const token = localStorage.getItem('accessToken')
    const result = await apiFetch('/entidades/administradoras/', {
      method: 'POST',
      body: JSON.stringify(dados),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return result
  } catch (error) {
    console.error('Erro ao criar administradora:', error)
    throw error
  }
}

export async function editarAdministradora(id, dados) {
  try {
    const token = localStorage.getItem('accessToken')
    const result = await apiFetch(`/entidades/administradoras/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(dados),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return result
  } catch (error) {
    console.error('Erro ao editar administradora:', error)
    throw error
  }
}

export async function excluirAdministradora(id) {
  try {
    const token = localStorage.getItem('accessToken')
    const result = await apiFetch(`/entidades/administradoras/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return result
  } catch (error) {
    console.error('Erro ao excluir administradora:', error)
    throw error
  }
}

export async function consultarPessoaPorCNPJ(cnpj) {
  try {
    const token = localStorage.getItem('accessToken')
    const result = await apiFetch(`/consultas/pessoas/por-cnpj/${cnpj}/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return result
  } catch (error) {
    console.error('Erro ao consultar CNPJ:', error)
    throw error
  }
}