import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UsuarioAdministradoraModal from '../../../components/UsuarioAdministradoraModal.jsx'
import UsuarioAdministradoraTable from '../../../components/UsuarioAdministradoraTable.jsx'
import { buscarAdministradoraPorId } from '../../../services/administradoraService.js'
import {
  listarUsuariosAdministradora,
  criarUsuarioAdministradora,
  editarUsuarioAdministradora,
  alterarStatusUsuarioAdministradora,
} from '../../../services/usuarioAdministradoraService.js'
import './Administradoras.css'

export default function UsuariosAdministradora() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [administradora, setAdministradora] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)

  function carregarDados() {
    const adm = buscarAdministradoraPorId(id)

    if (!adm) {
      navigate(-1)
      return
    }

    setAdministradora(adm)
    setUsuarios(listarUsuariosAdministradora(id))
  }

  useEffect(() => {
    carregarDados()
  }, [id])

  function abrirModalCriacao() {
    setUsuarioSelecionado(null)
    setModalAberto(true)
  }

  function abrirModalEdicao(usuario) {
    setUsuarioSelecionado(usuario)
    setModalAberto(true)
  }

  function fecharModal() {
    setUsuarioSelecionado(null)
    setModalAberto(false)
  }

  function salvarUsuario(dados) {
    if (usuarioSelecionado) {
      editarUsuarioAdministradora(usuarioSelecionado.id, dados)
    } else {
      criarUsuarioAdministradora(id, dados)
    }

    carregarDados()
    fecharModal()
  }

  function alterarStatus(usuario) {
    alterarStatusUsuarioAdministradora(usuario.id)
    carregarDados()
  }

  if (!administradora) {
    return <div>Carregando usuários...</div>
  }

  return (
    <div className="administradoras-page">
      <div className="administradoras-header">
        <div>
          <h1>Usuários da Administradora</h1>
          <p>{administradora.nomeFantasia}</p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={abrirModalCriacao}
          >
            + Novo Usuário
          </button>
        </div>
      </div>

      <UsuarioAdministradoraTable
        usuarios={usuarios}
        onEditar={abrirModalEdicao}
        onAlterarStatus={alterarStatus}
      />

      <UsuarioAdministradoraModal
        isOpen={modalAberto}
        usuario={usuarioSelecionado}
        onClose={fecharModal}
        onSave={salvarUsuario}
      />
    </div>
  )
}