const STORAGE_KEY = 'administradoras'

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

export function criarAdministradora(dados) {
  const administradoras = getAdministradorasStorage()

  const novaAdministradora = {
    id: crypto.randomUUID(),
    ...dados,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  }

  setAdministradorasStorage([...administradoras, novaAdministradora])

  return novaAdministradora
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