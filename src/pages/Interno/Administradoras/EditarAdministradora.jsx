import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarAdministradoraPorId, editarAdministradora } from '../../../services/administradoraService.js'
import './Administradoras.css'

export default function EditarAdministradora() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    carregarAdministradora()
  }, [id])

  const carregarAdministradora = async () => {
    try {
      const data = await buscarAdministradoraPorId(id)
      setForm({
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia || '',
        cnpj: data.cnpj,
        email: data.email || '',
        ativo: data.ativo,
        cartao_admin: data.cartao_admin ? 'administradora' : 'condominio',
        dias_recebimento_beneficio: data.dias_recebimento_beneficio ?? '',
      })
    } catch (error) {
      console.error('❌ Erro ao carregar:', error)
      navigate('/interno/administradoras')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    
    let newValue
    if (type === 'checkbox') {
      newValue = checked
    } else if (type === 'radio') {
      newValue = value
    } else {
      newValue = value
    }

    setForm((prev) => ({ ...prev, [name]: newValue }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!form.cartao_admin) {
      setSubmitError('⚠️ Selecione o local de recebimento do cartão')
      return
    }

    try {
      const cartaoAdminBoolean = form.cartao_admin === 'administradora'
      
      const formData = {
        cnpj: form.cnpj,
        razao_social: form.razao_social,
        nome_fantasia: form.nome_fantasia || null,
        email: form.email || null,
        ativo: form.ativo,
        cartao_admin: cartaoAdminBoolean,
        dias_recebimento_beneficio: form.dias_recebimento_beneficio ? Number(form.dias_recebimento_beneficio) : null,
      }

      
      // console.log('📤 Enviando dados para atualização:', JSON.stringify(formData, null, 2))
      await editarAdministradora(id, formData)
      navigate('/interno/administradoras')
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error)
      setSubmitError('Erro ao atualizar administradora')
    }
  }

  if (loading) return <div className="administradoras-page">Carregando...</div>
  if (!form) return <div className="administradoras-page">Administradora não encontrada</div>

  return (
    <div className="administradoras-page">
      <div className="administradoras-header">
        <div>
          <h1>Editar Administradora</h1>
          <p>Atualize os dados da administradora.</p>
        </div>
      </div>

      <form className="administradora-form" onSubmit={handleSubmit}>
        {submitError && (
          <div className="error-banner" style={{background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '20px'}}>
            {submitError}
          </div>
        )}

        <div className="form-grid">
          <label>
            CNPJ
            <input value={form.cnpj} disabled />
            <small className="helper-text">CNPJ não pode ser alterado</small>
          </label>

          <label>
            Razão Social *
            <input
              name="razao_social"
              value={form.razao_social}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Nome Fantasia
            <input
              name="nome_fantasia"
              value={form.nome_fantasia}
              onChange={handleChange}
              placeholder="Opcional"
            />
          </label>

          <label>
            Email
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Opcional"
              type="email"
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="ativo"
              checked={form.ativo}
              onChange={handleChange}
            />
            Administradora Ativa
          </label>

          <label>
            Dias para Recebimento do Benefício
            <select
              name="dias_recebimento_beneficio"
              value={form.dias_recebimento_beneficio}
              onChange={handleChange}
            >
              <option value="">Selecionar</option>
              <option value="0">0 dias (mesma data do vencimento)</option>
              <option value="1">1 dia</option>
              <option value="2">2 dias</option>
              <option value="3">3 dias</option>
              <option value="5">5 dias</option>
              <option value="7">7 dias</option>
              <option value="10">10 dias</option>
              <option value="15">15 dias</option>
              <option value="20">20 dias</option>
              <option value="30">30 dias</option>
            </select>
            <small className="helper-text">Define quantos dias após o vencimento o benefício é recebido</small>
          </label>
        </div>

        <div className="form-group card-receipt-group">
          <label className="section-label">Local de Recebimento do Cartão *</label>
          
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="cartao_admin"
                value="administradora"
                checked={form.cartao_admin === 'administradora'}
                onChange={handleChange}
              />
              <span>Na Administradora</span>
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="cartao_admin"
                value="condominio"
                checked={form.cartao_admin === 'condominio'}
                onChange={handleChange}
              />
              <span>No Condomínio</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
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