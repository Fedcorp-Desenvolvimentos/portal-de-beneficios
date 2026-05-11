const STORAGE_KEY = 'usuariosAdministradora'

function getUsuariosStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
}

function setUsuariosStorage(usuarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios))
}

export function listarUsuariosAdministradora(administradoraId) {
  const usuarios = getUsuariosStorage()

  return usuarios.filter(
    (usuario) => usuario.administradoraId === administradoraId
  )
}

export function buscarUsuarioAdministradoraPorId(id) {
  const usuarios = getUsuariosStorage()
  return usuarios.find((usuario) => usuario.id === id) || null
}

export function criarUsuarioAdministradora(administradoraId, dados) {
  const usuarios = getUsuariosStorage()

  const novoUsuario = {
    id: crypto.randomUUID(),
    administradoraId,
    ...dados,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  }

  setUsuariosStorage([...usuarios, novoUsuario])

  return novoUsuario
}

export function editarUsuarioAdministradora(id, dados) {
  const usuarios = getUsuariosStorage()

  const atualizados = usuarios.map((usuario) =>
    usuario.id === id
      ? {
          ...usuario,
          ...dados,
          updatedAt: new Date().toISOString(),
        }
      : usuario
  )

  setUsuariosStorage(atualizados)

  return buscarUsuarioAdministradoraPorId(id)
}

export function alterarStatusUsuarioAdministradora(id) {
  const usuarios = getUsuariosStorage()

  const atualizados = usuarios.map((usuario) =>
    usuario.id === id
      ? {
          ...usuario,
          status: usuario.status === 'ativo' ? 'inativo' : 'ativo',
          updatedAt: new Date().toISOString(),
        }
      : usuario
  )

  setUsuariosStorage(atualizados)

  return buscarUsuarioAdministradoraPorId(id)
}

export function excluirUsuarioAdministradora(id) {
  const usuarios = getUsuariosStorage()
  const filtrados = usuarios.filter((usuario) => usuario.id !== id)

  setUsuariosStorage(filtrados)
}

export function excluirUsuariosPorAdministradora(administradoraId) {
  const usuarios = getUsuariosStorage()

  const filtrados = usuarios.filter(
    (usuario) => usuario.administradoraId !== administradoraId
  )

  setUsuariosStorage(filtrados)
}