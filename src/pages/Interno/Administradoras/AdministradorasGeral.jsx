// pages/Interno/Administradoras/AdministradorasGeral.jsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext.jsx'
import { buscarAdministradoraPorId } from '../../../services/administradoraService.js'
import { userService } from '../../../services/userService.js'
import { toast } from 'react-toastify'

import './Administradoras.css'
import UsuarioTable from '../Usuarios/UsuarioTable.jsx'
import UsuarioModal from '../Usuarios/UsuarioModal.jsx'

import PageLayout from '../../../Layouts/PageLayout/PageLayout'
import { useLoading } from '../../../hooks/useLoading.js'

export default function AdministradorasGeral() {
  const navigate = useNavigate()
  const { user } = useAuth() // Pega o usuário logado
  const [administradora, setAdministradora] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const { loading, startLoading, stopLoading, updateProgress } = useLoading();
  const [modalOpen, setModalOpen] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [administradoras, setAdministradoras] = useState([])

  // Pega o ID da administradora do usuário logado
  const administradoraId = user?.administradora_id

  useEffect(() => {
    if (!administradoraId) {
      toast.error('Usuário não possui administradora vinculada')
      navigate('/interno/administradoras')
      return
    }
    
    carregarAdministradora()
    carregarUsuarios()
    carregarAdministradoras()
  }, [administradoraId])

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
      startLoading("Carregando administradora...")
      const data = await buscarAdministradoraPorId(administradoraId)
      setAdministradora(data)
      // console.log('🏢 Administradora carregada:', data)
    } catch (error) {
      console.error('❌ Erro ao carregar administradora:', error)
      toast.error('Erro ao carregar administradora')
      navigate('/interno/administradoras')
    } finally {
      stopLoading()
    }
  }

  const carregarUsuarios = async () => {
    try {
      startLoading("Carregando usuários...")

      const usuariosFiltrados = await userService.listarUsuarios({
        administradora: administradoraId
      })

      setUsuarios(Array.isArray(usuariosFiltrados) ? usuariosFiltrados : [])

    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
      setUsuarios([])
    } finally {
      stopLoading()
    }
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
        toast.success('Usuário excluído com sucesso')
        await carregarUsuarios()
      } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error)
        toast.error('Erro ao excluir usuário')
      }
    }
  }

  const handleSalvarUsuario = async (dados) => {
    try {
      if (usuarioSelecionado) {
        // console.log('📝 Atualizando usuário:', usuarioSelecionado.id, dados)
        await userService.atualizarUsuario(usuarioSelecionado.id, dados)
        toast.success('Usuário atualizado com sucesso')
      } else {
        // console.log('➕ Criando novo usuário:', dados)
        await userService.criarUsuario(dados)
        toast.success('Usuário criado com sucesso')
      }
      await carregarUsuarios()
      setModalOpen(false)
      setUsuarioSelecionado(null)
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error)
      toast.error(error.response?.data?.detail || 'Erro ao salvar usuário')
      throw error
    }
  }

  const getLocalRecebimentoLabel = (cartao_admin) => {
    return cartao_admin ? 'Na Administradora' : 'No Condomínio'
  }

  const getStatusClass = (ativo) => {
    return ativo ? 'status-badge ativa' : 'status-badge inativa'
  }

  const handleNovoUsuario = () => {
    setUsuarioSelecionado(null)
    setModalOpen(true)
  }

  return (
    <PageLayout title="Minha Administradora" description="Visualize os detalhes da sua administradora e gerencie os usuários vinculados a ela.">
      <div className="administradoras-page">
        <div className="administradoras-header">
          <div>
            {/* <h1>Minha Administradora</h1> */}
            <p>{administradora?.razao_social || '-'}</p>
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => navigate('/interno/administradoras')}>
              Voltar
            </button>
            {user?.tipo === 'dev' && (
              <button className="btn-primary" onClick={() => navigate(`/interno/administradoras/editar/${administradora?.id}`)}>
                Editar Administradora
              </button>
            )}
          </div>
        </div>

        <div className="administradoras-card">
          <h2>Dados Gerais</h2>
          <div className="details-grid">
            <div className="details-item">
              <span>CNPJ</span>
              <strong>{administradora?.cnpj || '-'}</strong>
            </div>
            <div className="details-item">
              <span>Razão Social</span>
              <strong>{administradora?.razao_social || '-'}</strong>
            </div>
            <div className="details-item">
              <span>Nome Fantasia</span>
              <strong>{administradora?.nome_fantasia || '-'}</strong>
            </div>
            <div className="details-item">
              <span>Email</span>
              <strong>{administradora?.email || '-'}</strong>
            </div>
            <div className="details-item">
              <span>Status</span>
              <strong className={getStatusClass(administradora?.ativo)}>
                {administradora?.ativo ? 'Ativa' : 'Inativa'}
              </strong>
            </div>
            <div className="details-item">
              <span>Local de Recebimento do Cartão</span>
              <strong>
                <span className={`cartao-badge ${administradora?.cartao_admin ? 'admin' : 'condominio'}`}>
                  {getLocalRecebimentoLabel(administradora?.cartao_admin)}
                </span>
              </strong>
            </div>
            <div className="details-item">
              <span>Data de Criação</span>
              <strong>{administradora?.created_at ? new Date(administradora.created_at).toLocaleDateString('pt-BR') : '-'}</strong>
            </div>
            <div className="details-item">
              <span>Última Atualização</span>
              <strong>{administradora?.updated_at ? new Date(administradora.updated_at).toLocaleDateString('pt-BR') : '-'}</strong>
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
              admNome={administradora?.nome_fantasia || administradora?.razao_social || '-'}
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
          administradoraId={administradoraId}
          administradoras={administradoras}
        />
      </div>
    </PageLayout>
  )
}