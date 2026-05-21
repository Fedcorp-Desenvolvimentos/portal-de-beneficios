import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarTodasAdministradoras, excluirAdministradora } from '../../../services/administradoraService.js'
import './Administradoras.css'
import { useLoading } from '../../../hooks/useLoading.js'

export default function Administradoras() {
  const navigate = useNavigate()
  const [administradoras, setAdministradoras] = useState([])
  const { loading, startLoading, stopLoading, updateProgress } = useLoading();
  const [error, setError] = useState('')

  useEffect(() => {
    carregarAdministradoras()
  }, [])

  const carregarAdministradoras = async () => {
    try {
      startLoading("Carregando administradoras...")
      const data = await listarTodasAdministradoras()
      // console.log('📋 Administradoras carregadas:', data)
      setAdministradoras(data)
      setError('')
    } catch (error) {
      console.error('❌ Erro ao carregar administradoras:', error)
      setError('Erro ao carregar lista de administradoras')
    } finally {
      stopLoading()
    }
  }

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta administradora?')) {
      try {
        await excluirAdministradora(id)
        await carregarAdministradoras()
      } catch (error) {
        console.error('❌ Erro ao excluir:', error)
        alert('Erro ao excluir administradora')
      }
    }
  }

  const formatarCartaoAdmin = (cartao_admin) => {
    return cartao_admin ? 'Na Administradora' : 'No Condomínio'
  }

  const getStatusClass = (ativo) => {
    return ativo ? 'status-badge ativa' : 'status-badge inativa'
  }

  return (
    <div className="administradoras-page">
      <div className="administradoras-header">
        <div>
          <h1>Administradoras</h1>
          <p>Gerencie as administradoras cadastradas no sistema.</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/interno/administradoras/cadastro')}
        >
          + Nova Administradora
        </button>
      </div>

      <div className="administradoras-card">
        <h2>Lista de Administradoras</h2>
        
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
                        onClick={() => navigate(`/interno/administradoras/${admin.id}`)}
                        title="Ver detalhes"
                      >
                        👁️
                      </button>
                      <button 
                        onClick={() => navigate(`/interno/administradoras/editar/${admin.id}`)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleExcluir(admin.id)}
                        title="Excluir"
                      >
                        🗑️
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
  )
}