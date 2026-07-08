import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarAdministradoraPorId, editarAdministradora } from '../../../services/administradoraService.js'
import { PRODUTOS_TAXA, PERCENTUAIS_TAXA, getLabelPercentual } from '../../../constants/produtos'
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
      const taxaConfigSalva = Array.isArray(data.taxa_config) ? data.taxa_config : []

      setForm({
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia || '',
        cnpj: data.cnpj,
        email: data.email || '',
        ativo: data.ativo,
        cartao_admin: data.cartao_admin ? 'administradora' : 'condominio',
        d_mais: data.d_mais != null ? String(data.d_mais) : '',
        taxa_ativa: data.taxa_ativa ?? false,
        taxa_tipo: data.taxa_tipo === 'produto' ? 'produto' : 'padrao',
        taxa_padrao: data.taxa_padrao != null ? String(data.taxa_padrao) : '',
        taxa_config: PRODUTOS_TAXA.map((p) => {
          const salvo = taxaConfigSalva.find((t) => t.codigo === p.codigo)
          return { codigo: p.codigo, valor: salvo?.valor != null ? String(salvo.valor) : '' }
        }),
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

  function handleTaxaValorChange(codigo, valor) {
    setForm((prev) => ({
      ...prev,
      taxa_config: prev.taxa_config.map((item) =>
        item.codigo === codigo ? { ...item, valor } : item
      ),
    }))
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
      
      const taxaPadraoNum = form.taxa_tipo === 'padrao' && form.taxa_padrao !== '' ? Number(form.taxa_padrao) : null

      const taxaProdutos = form.taxa_ativa && form.taxa_tipo === 'produto'
        ? form.taxa_config.map((item) => ({
            codigo: item.codigo,
            valor: item.valor !== '' ? Number(item.valor) : null,
          }))
        : []

      const formData = {
        cnpj: form.cnpj,
        razao_social: form.razao_social,
        nome_fantasia: form.nome_fantasia || null,
        email: form.email || null,
        ativo: form.ativo,
        cartao_admin: cartaoAdminBoolean,
        d_mais: form.d_mais !== '' ? Number(form.d_mais) : null,
        taxa_ativa: form.taxa_ativa,
        taxa_tipo: form.taxa_ativa ? form.taxa_tipo : null,
        taxa_padrao: taxaPadraoNum,
        taxa_config: taxaProdutos,
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
            D+ (Dias para Recebimento do Benefício)
            <select
              name="d_mais"
              value={form.d_mais}
              onChange={handleChange}
            >
              <option value="">Selecionar</option>
              <option value="0">0 dias (mesma data do vencimento)</option>
              <option value="1">1 dia</option>
              <option value="2">2 dias</option>
              <option value="3">3 dias</option>
              <option value="4">4 dias</option>
              <option value="5">5 dias</option>
              <option value="7">7 dias</option>
              <option value="10">10 dias</option>
              <option value="15">15 dias</option>
              <option value="20">20 dias</option>
              <option value="30">30 dias</option>
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

        <div className="form-group taxa-group">
          <label className="section-label">Taxa de Administração</label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="taxa_ativa"
              checked={form.taxa_ativa}
              onChange={handleChange}
            />
            Cobrar taxa de administração
          </label>

          {form.taxa_ativa && (
            <>
              <div className="taxa-tipo-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="taxa_tipo"
                    value="padrao"
                    checked={form.taxa_tipo === 'padrao'}
                    onChange={handleChange}
                  />
                  <span>Taxa padrão (mesmo % para todos os produtos)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="taxa_tipo"
                    value="produto"
                    checked={form.taxa_tipo === 'produto'}
                    onChange={handleChange}
                  />
                  <span>Taxa por produto</span>
                </label>
              </div>

              {form.taxa_tipo === 'padrao' && (
                <div className="taxa-padrao-row">
                  <label className="taxa-padrao-label">Percentual (%)</label>
                  <select
                    name="taxa_padrao"
                    value={form.taxa_padrao}
                    onChange={handleChange}
                    className="taxa-select"
                  >
                    {PERCENTUAIS_TAXA.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.taxa_tipo === 'produto' && (
                <div className="taxa-produtos-list">
                  {form.taxa_config.map((item) => (
                    <div key={item.codigo} className="taxa-produto-row">
                      <span className="taxa-produto-nome">{PRODUTOS_TAXA.find((p) => p.codigo === item.codigo)?.nome || item.codigo}</span>
                      <select
                        value={item.valor}
                        onChange={(e) => handleTaxaValorChange(item.codigo, e.target.value)}
                        className="taxa-select taxa-select-small"
                      >
                        <option value="">Não possui taxa</option>
                        {PERCENTUAIS_TAXA.filter((opt) => opt.value !== '').map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
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