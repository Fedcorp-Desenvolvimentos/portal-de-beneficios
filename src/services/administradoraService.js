import { apiFetch } from "./api"

const STORAGE_KEY = 'administradoras'

export const administradoraService = {
  listarAdministradoras,
  buscarAdministradoraPorId,
  criarAdministradora,
  editarAdministradora,
  alterarStatusAdministradora,
  excluirAdministradora,
}

function getAdministradorasStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
}

function setAdministradorasStorage(administradoras) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(administradoras))
}

export function listarAdministradoras() {
  return getAdministradorasStorage()
}

export function buscarAdministradoraPorId(id) {
  const administradoras = getAdministradorasStorage()
  return administradoras.find((adm) => adm.id === id) || null
}

export function listarTodasAdministradoras(dados) {
  try {
    const token = localStorage.getItem('accessToken')

    const result = apiFetch('/entidades/administradoras/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    console.log('Resultado da API:', result)
    return result
  } catch (error) {
    console.error('Erro ao listar administradoras:', error)
  }
}

export function criarAdministradora(dados) {
  try {
    const token = localStorage.getItem('accessToken')

    const result = apiFetch('/entidades/administradoras/', {
      method: 'POST',
      body: JSON.stringify(dados),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    console.log('Resultado da API:', result)
  } catch (error) {
    console.error('Erro ao criar administradora:', error)
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
    console.error('Erro ao criar administradora:', error)
  }
}

export function editarAdministradora(id, dados) {
  const administradoras = getAdministradorasStorage()

  const atualizadas = administradoras.map((adm) =>
    adm.id === id
      ? {
          ...adm,
          ...dados,
          updatedAt: new Date().toISOString(),
        }
      : adm
  )

  setAdministradorasStorage(atualizadas)

  return buscarAdministradoraPorId(id)
}

export function alterarStatusAdministradora(id) {
  const administradoras = getAdministradorasStorage()

  const atualizadas = administradoras.map((adm) =>
    adm.id === id
      ? {
          ...adm,
          status: adm.status === 'ativa' ? 'inativa' : 'ativa',
          updatedAt: new Date().toISOString(),
        }
      : adm
  )

  setAdministradorasStorage(atualizadas)

  return buscarAdministradoraPorId(id)
}

export function excluirAdministradora(id) {
  const administradoras = getAdministradorasStorage()
  const filtradas = administradoras.filter((adm) => adm.id !== id)

  setAdministradorasStorage(filtradas)
}