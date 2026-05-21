// pages/Interno/Administradoras/DetalhesAdministradora.jsx

import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { buscarAdministradoraPorId } from '../../../services/administradoraService.js'
import { userService } from '../../../services/userService.js'
import UsuarioModal from '../Usuarios/UsuarioModal.jsx'

import './Administradoras.css'
import UsuarioTable from '../Usuarios/UsuarioTable.jsx'

export default function DetalhesAdministradora() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [administradora, setAdministradora] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [administradoras, setAdministradoras] = useState([])

  useEffect(() => {
    carregarAdministradora()
    carregarUsuarios()
    carregarAdministradoras()
  }, [id])

  const carregarAdministradoras = async () => {
    try {
      const data = await userService.listarAdministradoras()
      setAdministradoras(data)
    } catch (error) {
      console.error('❌ Erro ao carregar administradoras:', error)
    }
  }

  const carregarAdministradora = async () => {
    try {
      const data = await buscarAdministradoraPorId(id)
      setAdministradora(data)
      // console.log('🏢 Administradora carregada:', data)
    } catch (error) {
      console.error('❌ Erro ao carregar administradora:', error)
      enqueueSnackbar('Erro ao carregar administradora', { variant: 'error' })
      navigate('/interno/administradoras')
    } finally {
      setLoading(false)
    }
  }

  const carregarUsuarios = async () => {
    try {
      setLoadingUsuarios(true)
      const usuariosFiltrados = await userService.listarUsuarios({ administradora: id })
      setUsuarios(Array.isArray(usuariosFiltrados) ? usuariosFiltrados : [])
      // console.log(`👥 Usuários carregados para administradora ${id}:`, usuariosFiltrados?.length || 0)
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' })
      setUsuarios([])
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const handleNovoUsuario = () => {
    setUsuarioSelecionado(null)
    setModalOpen(true)
  }

  const handleEditarUsuario = (usuario) => {
    // console.log('✏️ Editando usuário em Detalhes:', usuario)
    setUsuarioSelecionado(usuario)
    setModalOpen(true)
  }

  const handleExcluirUsuario = async (usuario) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.username}"?`)) {
      try {
        await userService.excluirUsuario(usuario.id)
        enqueueSnackbar('Usuário excluído com sucesso', { variant: 'success' })
        await carregarUsuarios()
      } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error)
        enqueueSnackbar('Erro ao excluir usuário', { variant: 'error' })
      }
    }
  }

  const handleSalvarUsuario = async (dados) => {
    try {
      if (usuarioSelecionado) {
        // console.log('📝 Atualizando usuário:', usuarioSelecionado.id, dados)
        await userService.atualizarUsuario(usuarioSelecionado.id, dados)
        enqueueSnackbar('Usuário atualizado com sucesso', { variant: 'success' })
      } else {
        // console.log('➕ Criando novo usuário:', dados)
        await userService.criarUsuario(dados)
        enqueueSnackbar('Usuário criado com sucesso', { variant: 'success' })
      }
      await carregarUsuarios()
      setModalOpen(false)
      setUsuarioSelecionado(null)
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error)
      const errorMsg = error.response?.data?.detail || error.message || 'Erro ao salvar usuário'
      enqueueSnackbar(errorMsg, { variant: 'error' })
    }
  }

  const formatarCartaoAdmin = (cartao_admin) => {
    return cartao_admin ? 'Na Administradora' : 'No Condomínio'
  }

  const getStatusClass = (ativo) => {
    return ativo ? 'status-badge ativa' : 'status-badge inativa'
  }

  if (loading) return <div className="administradoras-page">Carregando...</div>
  if (!administradora) return <div className="administradoras-page">Administradora não encontrada</div>

  return (
    <div className="administradoras-page">
      <div className="administradoras-header">
        <div>
          <h1>Detalhes da Administradora</h1>
          <p>{administradora.razao_social}</p>
        </div>
        <div className="form-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Voltar
          </button>
          <button className="btn-primary" onClick={() => navigate(`/interno/administradoras/editar/${id}`)}>
            Editar Administradora
          </button>
        </div>
      </div>

      <div className="administradoras-card">
        <h2>Dados Gerais</h2>
        <div className="details-grid">
          <div className="details-item">
            <span>CNPJ</span>
            <strong>{administradora.cnpj}</strong>
          </div>
          <div className="details-item">
            <span>Razão Social</span>
            <strong>{administradora.razao_social}</strong>
          </div>
          <div className="details-item">
            <span>Nome Fantasia</span>
            <strong>{administradora.nome_fantasia || '-'}</strong>
          </div>
          <div className="details-item">
            <span>Email</span>
            <strong>{administradora.email || '-'}</strong>
          </div>
          <div className="details-item">
            <span>Status</span>
            <strong className={getStatusClass(administradora.ativo)}>
              {administradora.ativo ? 'Ativa' : 'Inativa'}
            </strong>
          </div>
          <div className="details-item">
            <span>Recebimento do Cartão</span>
            <strong>{formatarCartaoAdmin(administradora.cartao_admin)}</strong>
          </div>
          <div className="details-item">
            <span>Data de Criação</span>
            <strong>{new Date(administradora.created_at).toLocaleDateString('pt-BR')}</strong>
          </div>
          <div className="details-item">
            <span>Última Atualização</span>
            <strong>{new Date(administradora.updated_at).toLocaleDateString('pt-BR')}</strong>
          </div>
        </div>
      </div>

      {/* Seção de Usuários */}
      <div className="administradoras-card">
        <div className="administradoras-header">
          <div>
            <h2>Usuários Vinculados</h2>
            <p>Gerencie os usuários que têm acesso a esta administradora.</p>
          </div>
          <button className="btn-primary" onClick={handleNovoUsuario}>
            + Novo Usuário
          </button>
        </div>

        {loadingUsuarios ? (
          <div className="loading-message">Carregando usuários...</div>
        ) : (
          <UsuarioTable 
            usuarios={usuarios}
            onEditar={handleEditarUsuario}
            onExcluir={handleExcluirUsuario}
            admNome={administradora.nome_fantasia || administradora.razao_social}
          />
        )}
      </div>

      {/* Modal de Usuário Universal */}
      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setUsuarioSelecionado(null)
        }}
        onSave={handleSalvarUsuario}
        usuario={usuarioSelecionado}
        administradoraId={parseInt(id)}
        administradoras={administradoras}
        title={usuarioSelecionado ? `Editar Usuário - ${usuarioSelecionado.username}` : 'Novo Usuário'}
      />
    </div>
  )
}