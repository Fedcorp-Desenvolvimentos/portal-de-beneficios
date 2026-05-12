import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarAdministradoraPorId } from '../../../services/administradoraService.js'
import './Administradoras.css'

export default function DetalhesAdministradora() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [administradora, setAdministradora] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarAdministradora()
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
            Editar
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
    </div>
  )
}