import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusAdministradoraBadge from '../../../components/StatusAdministradoraBadge.jsx'
import UsuarioAdministradoraTable from '../../../components/UsuarioAdministradoraTable.jsx'
import { buscarAdministradoraPorId } from '../../../services/administradoraService.js'
import { listarUsuariosAdministradora } from '../../../services/usuarioAdministradoraService.js'
import './Administradoras.css'

export default function DetalhesAdministradoras() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [administradora, setAdministradora] = useState(null)
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    const adm = buscarAdministradoraPorId(id)

    if (!adm) {
      navigate('/interno/administradoras')
      return
    }

    const usuariosDaAdm = listarUsuariosAdministradora(id)

    setAdministradora(adm)
    setUsuarios(usuariosDaAdm)
  }, [id, navigate])

  if (!administradora) {
    return <div>Carregando administradora...</div>
  }

  const totalUsuarios = usuarios.length
  const usuariosAtivos = usuarios.filter((usuario) => usuario.status === 'ativo').length
  const usuariosInativos = usuarios.filter((usuario) => usuario.status === 'inativo').length

  return (
    <div className="administradoras-page">
      <div className="administradoras-header">
        <div>
          <h1>Detalhes da Administradora</h1>
          <p>{administradora.nomeFantasia}</p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/interno/administradoras')}
          >
            Voltar
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(`/interno/administradoras/${id}/editar`)}
          >
            Editar
          </button>
        </div>
      </div>

      <div className="administradoras-card">
        <h2>Dados gerais</h2>

        <div className="details-grid">
          <div className="details-item">
            <span>Nome Fantasia</span>
            <strong>{administradora.nomeFantasia}</strong>
          </div>

          <div className="details-item">
            <span>Razão Social</span>
            <strong>{administradora.razaoSocial}</strong>
          </div>

          <div className="details-item">
            <span>CNPJ</span>
            <strong>{administradora.cnpj}</strong>
          </div>

          <div className="details-item">
            <span>Email</span>
            <strong>{administradora.email}</strong>
          </div>

          <div className="details-item">
            <span>Telefone</span>
            <strong>{administradora.telefone || '-'}</strong>
          </div>

          <div className="details-item">
            <span>Status</span>
            <strong>
              <StatusAdministradoraBadge status={administradora.status} />
            </strong>
          </div>
        </div>
      </div>

      <div className="details-cards">
        <div className="details-summary-card">
          <span>Total de usuários</span>
          <strong>{totalUsuarios}</strong>
        </div>

        <div className="details-summary-card">
          <span>Usuários ativos</span>
          <strong>{usuariosAtivos}</strong>
        </div>

        <div className="details-summary-card">
          <span>Usuários inativos</span>
          <strong>{usuariosInativos}</strong>
        </div>
      </div>

      <div className="administradoras-card">
        <div className="administradoras-header">
          <div>
            <h2>Usuários vinculados</h2>
            <p>Gerencie os usuários desta administradora.</p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(`/interno/administradoras/${id}/usuarios`)}
          >
            Gerenciar Usuários
          </button>
        </div>

        <UsuarioAdministradoraTable usuarios={usuarios} />
      </div>
    </div>
  )
}