import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2, Plus, Search, X } from 'lucide-react'

import {
  listarTodasAdministradoras,
  excluirAdministradora,
} from '../../../services/administradoraService.js'

import './Administradoras.css'
import { useLoading } from '../../../hooks/useLoading.js'
import PageLayout from '../../../Layouts/PageLayout/PageLayout.jsx'

const normalizarTexto = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const somenteDigitos = (value) => String(value || '').replace(/\D/g, '')

export default function Administradoras() {
  const navigate = useNavigate()

  const [administradoras, setAdministradoras] = useState([])
  const [busca, setBusca] = useState('')
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState(null)

  const { loading, startLoading, stopLoading } = useLoading()

  useEffect(() => {
    carregarAdministradoras()
  }, [])

  const administradorasFiltradas = useMemo(() => {
    const termo = normalizarTexto(busca)
    const termoNumerico = somenteDigitos(busca)

    if (!termo) {
      return administradoras
    }

    return administradoras.filter((admin) => {
      const cnpj = somenteDigitos(admin.cnpj)
      const razaoSocial = normalizarTexto(admin.razao_social)
      const nomeFantasia = normalizarTexto(admin.nome_fantasia)
      const email = normalizarTexto(admin.email)

      return (
        razaoSocial.includes(termo) ||
        nomeFantasia.includes(termo) ||
        email.includes(termo) ||
        (termoNumerico && cnpj.includes(termoNumerico))
      )
    })
  }, [administradoras, busca])

  const carregarAdministradoras = async () => {
    try {
      startLoading('Carregando administradoras...')

      const data = await listarTodasAdministradoras()

      setAdministradoras(Array.isArray(data) ? data : [])
      setError('')
    } catch (error) {
      console.error('Erro ao carregar administradoras:', error)
      setError('Erro ao carregar lista de administradoras')
    } finally {
      stopLoading()
    }
  }

  const abrirModalExclusao = (admin) => {
    setAdminToDelete(admin)
    setShowDeleteModal(true)
  }

  const fecharModalExclusao = () => {
    setAdminToDelete(null)
    setShowDeleteModal(false)
  }

  const confirmarExclusao = async () => {
    if (!adminToDelete?.id) return

    try {
      await excluirAdministradora(adminToDelete.id)
      fecharModalExclusao()
      await carregarAdministradoras()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir administradora')
    }
  }

  const formatarCartaoAdmin = (cartaoAdmin) => {
    return cartaoAdmin ? 'Na Administradora' : 'No Condomínio'
  }

  const getStatusClass = (ativo) => {
    return ativo ? 'status-badge ativa' : 'status-badge inativa'
  }

  return (
    <PageLayout
      title="Administradoras"
      subtitle="Gerencie as administradoras cadastradas no sistema."
    >
      <div className="administradoras-page">
        <div className="administradoras-card">
          <div className="administradoras-header">
            <h2>Lista de Administradoras</h2>

            <button
              type="button"
              className="btn-nova-administradora"
              onClick={() => navigate('/interno/cadastrar-administradora')}
            >
              <Plus size={18} />
              Nova Administradora
            </button>
          </div>

          <div className="administradoras-search-wrapper">
            <div className="administradoras-search">
              <Search size={18} />

              <input
                type="text"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por CNPJ, razão social, nome fantasia ou e-mail"
              />

              {busca && (
                <button
                  type="button"
                  className="administradoras-search-clear"
                  onClick={() => setBusca('')}
                  title="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {busca && (
              <span className="administradoras-search-result">
                {administradorasFiltradas.length}{' '}
                {administradorasFiltradas.length === 1
                  ? 'administradora encontrada'
                  : 'administradoras encontradas'}
              </span>
            )}
          </div>

          {loading && <div className="loading-message">Carregando...</div>}

          {error && <div className="error-message">{error}</div>}

          {!loading && !error && (
            <div className="administradoras-table-wrapper">
              <table className="administradoras-table">
                <thead>
                  <tr>
                    <th>CNPJ</th>
                    <th>Razão Social</th>
                    <th>Nome Fantasia</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Recebimento</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {administradorasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-table">
                        {busca
                          ? 'Nenhuma administradora encontrada para esta busca'
                          : 'Nenhuma administradora cadastrada'}
                      </td>
                    </tr>
                  ) : (
                    administradorasFiltradas.map((admin) => (
                      <tr key={admin.id}>
                        <td className="col-mono">{admin.cnpj}</td>

                        <td>{admin.razao_social}</td>

                        <td>{admin.nome_fantasia || '-'}</td>

                        <td>{admin.email || '-'}</td>

                        <td>
                          <span className={getStatusClass(admin.ativo)}>
                            {admin.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>

                        <td>{formatarCartaoAdmin(admin.cartao_admin)}</td>

                        <td className="table-actions">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/interno/administradoras/${admin.id}`)
                            }
                            title="Ver detalhes"
                            className="action-button"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/interno/administradoras/editar/${admin.id}`
                              )
                            }
                            title="Editar"
                            className="action-button"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirModalExclusao(admin)}
                            title="Excluir"
                            className="action-button danger"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={fecharModalExclusao}>
          <div
            className="modal-content modal-confirmacao"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Confirmar exclusão</h3>

            <p className="p-exclusao">
              Deseja realmente excluir a administradora?
            </p>

            <strong>
              {adminToDelete?.nome_fantasia ||
                adminToDelete?.razao_social ||
                'Administradora selecionada'}
            </strong>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={fecharModalExclusao}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-danger"
                onClick={confirmarExclusao}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

