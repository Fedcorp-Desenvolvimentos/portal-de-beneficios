import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { criarAdministradora, consultarPessoaPorCNPJ } from '../../../services/administradoraService.js'
import './Administradoras.css'

const initialForm = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  email: '',
  ativo: true,
  cartao_admin: '',
}

export default function CadastroAdministradora() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [cnpjError, setCnpjError] = useState('')
  const [submitError, setSubmitError] = useState('')

  async function buscarDadosPorCNPJ(cnpj) {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    
    if (cnpjLimpo.length !== 14) {
      return
    }

    setLoading(true)
    setCnpjError('')

    try {
      const response = await consultarPessoaPorCNPJ(cnpjLimpo)
      
      if (response.sucesso && response.data) {
        const data = response.data
        // console.log("📦 Dados retornados da API:", data)
        
        setForm(prev => ({
          ...prev,
          razao_social: data.NOME || '',
          nome_fantasia: data.NOME || '',
          cnpj: data.CPF_CNPJ || cnpj,
        }))
      } else {
        setCnpjError('CNPJ não encontrado na base de dados')
      }
    } catch (error) {
      console.error('❌ Erro ao buscar CNPJ:', error)
      setCnpjError('Erro ao consultar CNPJ. Tente novamente.')
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

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    if (name === 'cnpj') {
      if (cnpjError) setCnpjError('')
      const timeoutId = setTimeout(() => {
        buscarDadosPorCNPJ(value)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }

  function handleBlurCNPJ(event) {
    const cnpjValue = event.target.value
    if (cnpjValue && cnpjValue.replace(/\D/g, '').length === 14) {
      buscarDadosPorCNPJ(cnpjValue)
    }
  }

  function formatCNPJ(value) {
    const cnpjLimpo = value.replace(/\D/g, '')
    if (cnpjLimpo.length <= 2) return cnpjLimpo
    if (cnpjLimpo.length <= 5) return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2)}`
    if (cnpjLimpo.length <= 8) return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5)}`
    if (cnpjLimpo.length <= 12) return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5, 8)}/${cnpjLimpo.slice(8)}`
    return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5, 8)}/${cnpjLimpo.slice(8, 12)}-${cnpjLimpo.slice(12, 14)}`
  }

  function handleCNPJChange(event) {
    const rawValue = event.target.value
    const formattedValue = formatCNPJ(rawValue)
    setForm((prev) => ({ ...prev, cnpj: formattedValue }))
    if (cnpjError) setCnpjError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    
    if (!form.cartao_admin) {
      setSubmitError('⚠️ Selecione o local de recebimento do cartão')
      return
    }

    if (!form.razao_social) {
      setSubmitError('⚠️ Razão Social é obrigatória')
      return
    }

    const cnpjLimpo = form.cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) {
      setSubmitError('⚠️ CNPJ inválido')
      return
    }

    try {
      const cartaoAdminBoolean = form.cartao_admin === 'administradora'
      
      const formData = {
        cnpj: cnpjLimpo,
        razao_social: form.razao_social,
        nome_fantasia: form.nome_fantasia || null,
        email: form.email || null,
        ativo: form.ativo,
        cartao_admin: cartaoAdminBoolean
      }
      
      //console.log('📤 Enviando dados:', JSON.stringify(formData, null, 2))
      
      await criarAdministradora(formData)
      navigate('/interno/administradoras')
    } catch (error) {
      console.error('❌ Erro:', error)
      setSubmitError('Erro ao salvar administradora. Tente novamente.')
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
        {submitError && (
          <div className="error-banner" style={{background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '20px'}}>
            {submitError}
          </div>
        )}

        <div className="form-grid">
          <label>
            CNPJ *
            <input
              name="cnpj"
              value={form.cnpj}
              onChange={handleCNPJChange}
              onBlur={handleBlurCNPJ}
              placeholder="00.000.000/0000-00"
              required
              disabled={loading}
            />
            {loading && <small>Buscando dados do CNPJ...</small>}
            {cnpjError && <small className="error-message">{cnpjError}</small>}
            <small className="helper-text">Digite o CNPJ para buscar automaticamente os dados</small>
          </label>

          <label>
            Razão Social *
            <input
              name="razao_social"
              value={form.razao_social}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>

          <label>
            Nome Fantasia
            <input
              name="nome_fantasia"
              value={form.nome_fantasia}
              onChange={handleChange}
              disabled={loading}
              placeholder="Opcional"
            />
          </label>

          <label>
            Email
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              <span>No Condomínio</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/interno/administradoras')}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processando...' : 'Salvar Administradora'}
          </button>
        </div>
      </form>
    </div>
  )
}