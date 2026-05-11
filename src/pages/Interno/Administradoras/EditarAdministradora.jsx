import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  buscarAdministradoraPorId,
  editarAdministradora,
} from '../../../services/administradoraService.js'
import './Administradoras.css'

export default function EditarAdministradora() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)

  useEffect(() => {
    const administradora = buscarAdministradoraPorId(id)

    if (!administradora) {
      navigate('/interno/administradoras')
      return
    }

    setForm(administradora)
  }, [id, navigate])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    editarAdministradora(id, form)

    navigate('/interno/administradoras')
  }

  if (!form) {
    return <div>Carregando administradora...</div>
  }

  return (
    <div className="administradoras-page">
      <div className="administradoras-header">
        <div>
          <h1>Editar Administradora</h1>
          <p>Atualize os dados cadastrais da administradora.</p>
        </div>
      </div>

      <form className="administradora-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Nome Fantasia
            <input
              name="nomeFantasia"
              value={form.nomeFantasia}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Razão Social
            <input
              name="razaoSocial"
              value={form.razaoSocial}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            CNPJ
            <input
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Telefone
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/interno/administradoras')}
          >
            Cancelar
          </button>

          <button type="submit" className="btn-primary">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  )
}