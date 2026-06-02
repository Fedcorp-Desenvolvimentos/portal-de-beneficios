import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'

import {
  listarTodasAdministradoras,
  excluirAdministradora,
} from '../../../services/administradoraService.js'

import './Administradoras.css'
import { useLoading } from '../../../hooks/useLoading.js'
import PageLayout from '../../../Layouts/PageLayout/PageLayout.jsx'

export default function Administradoras() {
  const navigate = useNavigate()
  const [administradoras, setAdministradoras] = useState([])
  const { loading, startLoading, stopLoading } = useLoading()
  const [error, setError] = useState('')

  useEffect(() => {
    carregarAdministradoras()
  }, [])

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

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta administradora?')) return

    try {
      await excluirAdministradora(id)
      await carregarAdministradoras()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir administradora')
    }
  }

  const formatarCartaoAdmin = (cartao_admin) => {
    return cartao_admin ? 'Na Administradora' : 'No Condomínio'
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

          {loading && <div className="loading-message">Carregando...</div>}

          {error && <div className="error-message">{error}</div>}

          {!loading && !error && (
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
                {administradoras.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-table">
                      Nenhuma administradora cadastrada
                    </td>
                  </tr>
                ) : (
                  administradoras.map((admin) => (
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
                          onClick={() => navigate(`/interno/administradoras/${admin.id}`)}
                          title="Ver detalhes"
                          className="action-button"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/interno/administradoras/editar/${admin.id}`)}
                          title="Editar"
                          className="action-button"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExcluir(admin.id)}
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
          )}
        </div>
      </div>
    </PageLayout>
  )
}