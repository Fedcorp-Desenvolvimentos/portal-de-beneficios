import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { criarAdministradora } from '../../../services/administradoraService.js'
import './Administradoras.css'


import { administradoraService } from '../../../services/administradoraService.js'

const initialForm = {
  nomeFantasia: '',
  razaoSocial: '',
  cnpj: '',
  email: '',
  telefone: '',
  status: 'ativa',
}

export default function CadastroAdministradora() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)

  function handleChange(event) {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    try {
      event.preventDefault()

      console.log(form)
      // administradoraService.criarAdministradora(form)

      navigate('/interno/administradoras')
    } catch (error) {
      console.error('Erro ao criar administradora:', error)
    }
  }

  return (
    <div className="administradoras-page">
      <div className="administradoras-header">
        <div>
          <h1>Nova Administradora</h1>
          <p>Preencha os dados para cadastrar uma nova administradora.</p>
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
            <select name="status" value={form.status} onChange={handleChange}>
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
            Salvar Administradora
          </button>
        </div>
      </form>
    </div>
  )
}