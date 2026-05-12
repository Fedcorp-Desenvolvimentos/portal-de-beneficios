import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarAdministradoraPorId } from '../../../services/administradoraService.js'
import { userService } from '../../../services/userService.js'

import './Administradoras.css'
import UsuarioModal from '../../../components/UsuarioTable.jsx'
import UsuarioTable from '../../../components/UsuarioTable.jsx'

export default function DetalhesAdministradora() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [administradora, setAdministradora] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)

  useEffect(() => {
    carregarAdministradora()
    carregarUsuarios()
  }, [id])

  const carregarAdministradora = async () => {
    try {
      const data = await buscarAdministradoraPorId(id)
      setAdministradora(data)
    } catch (error) {
      console.error('❌ Erro ao carregar:', error)
      navigate('/interno/administradoras')
    } finally {
      setLoading(false)
    }
  }

  const carregarUsuarios = async () => {
    try {
      setLoadingUsuarios(true)
      const todosUsuarios = await userService.listarUsuarios()
      // Filtra apenas usuários desta administradora
      const usuariosFiltrados = todosUsuarios.filter(
        user => user.administradora_id === parseInt(id)
      )
      setUsuarios(usuariosFiltrados)
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const handleNovoUsuario = () => {
    setUsuarioSelecionado(null)
    setModalOpen(true)
  }

  const handleEditarUsuario = (usuario) => {
    setUsuarioSelecionado(usuario)
    setModalOpen(true)
  }

  const handleExcluirUsuario = async (usuario) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.username}"?`)) {
      try {
        await userService.excluirUsuario(usuario.id)
        await carregarUsuarios()
      } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error)
        alert('Erro ao excluir usuário')
      }
    }
  }

  const handleSalvarUsuario = async (dados) => {
    if (usuarioSelecionado) {
      // Edição
      await userService.atualizarUsuario(usuarioSelecionado.id, dados)
    } else {
      // Criação
      await userService.criarUsuario(dados)
    }
    await carregarUsuarios()
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
          <button className="btn-secondary" onClick={() => navigate('/interno/administradoras')}>
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
          />
        )}
      </div>

      {/* Modal de Usuário */}
      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setUsuarioSelecionado(null)
        }}
        onSave={handleSalvarUsuario}
        usuario={usuarioSelecionado}
        administradoraId={parseInt(id)}
      />
    </div>
  )
}