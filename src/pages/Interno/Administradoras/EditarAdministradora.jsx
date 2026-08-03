import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarAdministradoraPorId, editarAdministradora } from '../../../services/administradoraService.js'
import { taxaConfigService } from '../../../services/taxaConfigService.js'
import { PRODUTOS_TAXA } from '../../../constants/produtos'
import { useAuth } from '../../../context/AuthContext.jsx'
import TaxaConfigSection from '../../../components/TaxaConfigSection/TaxaConfigSection.jsx'
import './Administradoras.css'

export default function EditarAdministradora() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const podeVerDmais = user?.tipo === 'adm' || user?.tipo === 'fat' || user?.tipo === 'dev'
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState('')
  const [vinculos, setVinculos] = useState([])

  useEffect(() => {
    carregarAdministradora()
  }, [id])

  const carregarAdministradora = async () => {
    try {
      const data = await buscarAdministradoraPorId(id)

      const temTaxaPadrao = (data.taxa_padrao_valor || 0) > 0
      let taxaConfigSalva = []

      try {
        const taxasConfig = await taxaConfigService.listar({ administradora: id })
        taxaConfigSalva = Array.isArray(taxasConfig) ? taxasConfig : taxasConfig?.results || []
      } catch (e) {
        console.warn('Erro ao carregar taxas config:', e)
      }

      let vinculosData = []
      try {
        const vData = await taxaConfigService.listarVinculos({ administradora: id })
        vinculosData = Array.isArray(vData) ? vData : vData?.results || []
        setVinculos(vinculosData)
      } catch (e) {
        console.warn('Erro ao carregar vinculos:', e)
      }

      setForm({
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia || '',
        cnpj: data.cnpj,
        email: data.email || '',
        ativo: data.ativo,
        cartao_admin: data.cartao_admin ? 'administradora' : 'condominio',
        d_mais: data.d_mais != null ? String(data.d_mais) : '',
        taxa_ativa: temTaxaPadrao || taxaConfigSalva.length > 0,
        taxa_tipo: taxaConfigSalva.length > 0 ? 'produto' : 'padrao',
        taxa_padrao: data.taxa_padrao_valor != null ? String(data.taxa_padrao_valor) : '',
        taxa_config: PRODUTOS_TAXA.map((p) => {
          const salvo = taxaConfigSalva.find((t) => t.produto_codigo === p.codigo)
          return { codigo: p.codigo, valor: salvo?.taxa_valor != null ? String(salvo.taxa_valor) : '' }
        }),
      })
    } catch (error) {
      console.error('Erro ao carregar:', error)
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
      setSubmitError('Selecione o local de recebimento do cartão')
      return
    }

    try {
      const cartaoAdminBoolean = form.cartao_admin === 'administradora'

      const taxaPadraoNum =
        form.taxa_tipo === 'padrao' && form.taxa_padrao !== '' ? Number(form.taxa_padrao) : null

      const formData = {
        cnpj: form.cnpj,
        razao_social: form.razao_social,
        nome_fantasia: form.nome_fantasia || null,
        email: form.email || null,
        ativo: form.ativo,
        cartao_admin: cartaoAdminBoolean,
        d_mais: form.d_mais !== '' ? Number(form.d_mais) : null,
        taxa_padrao_tipo:
          form.taxa_ativa && form.taxa_tipo === 'padrao' && taxaPadraoNum !== null ? 'PERC' : 'PERC',
        taxa_padrao_valor:
          form.taxa_ativa && form.taxa_tipo === 'padrao' && taxaPadraoNum !== null ? taxaPadraoNum : 0,
      }

      await editarAdministradora(id, formData)

      if (form.taxa_ativa && form.taxa_tipo === 'produto') {
        const vinculos = await taxaConfigService.listarVinculos({ administradora: id })
        const vinculosList = Array.isArray(vinculos) ? vinculos : vinculos?.results || []

        const taxasExistentes = await taxaConfigService.listar({ administradora: id })
        const taxasList = Array.isArray(taxasExistentes) ? taxasExistentes : taxasExistentes?.results || []

        for (const vinculo of vinculosList) {
          for (const item of form.taxa_config) {
            const produtoCodigo = item.codigo
            const valor = item.valor !== '' ? Number(item.valor) : null

            if (valor !== null && valor > 0) {
              const existente = taxasList.find(
                (t) => t.vinculo === vinculo.id && t.produto_codigo === produtoCodigo
              )

              if (existente) {
                await taxaConfigService.atualizar(existente.id, {
                  vinculo: vinculo.id,
                  produto: produtoCodigo,
                  taxa_tipo: 'PERC',
                  taxa_valor: valor,
                  ativo: true,
                })
              } else {
                await taxaConfigService.criar({
                  vinculo: vinculo.id,
                  produto: produtoCodigo,
                  taxa_tipo: 'PERC',
                  taxa_valor: valor,
                  ativo: true,
                })
              }
            }
          }
        }
      }

      navigate('/interno/administradoras')
    } catch (error) {
      console.error('Erro ao atualizar:', error)
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
          <div className="error-banner" style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
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
            <input name="razao_social" value={form.razao_social} onChange={handleChange} required />
          </label>

          <label>
            Nome Fantasia
            <input name="nome_fantasia" value={form.nome_fantasia} onChange={handleChange} placeholder="Opcional" />
          </label>

          <label>
            Email
            <input name="email" value={form.email} onChange={handleChange} placeholder="Opcional" type="email" />
          </label>

          <label className="checkbox-label">
            <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} />
            Administradora Ativa
          </label>

          {podeVerDmais && (
            <label>
              D+ (Dias para Recebimento do Benefício)
              <select name="d_mais" value={form.d_mais} onChange={handleChange}>
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
              </select>
              <small className="helper-text">Define quantos dias após o vencimento o benefício é recebido</small>
            </label>
          )}
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

        <TaxaConfigSection
          administradoraId={id}
          vinculos={vinculos}
          taxaAtiva={form.taxa_ativa}
          taxaTipo={form.taxa_tipo}
          taxaPadrao={form.taxa_padrao}
          taxaConfig={form.taxa_config}
          onTaxaAtivaChange={(value) => setForm((prev) => ({ ...prev, taxa_ativa: value }))}
          onTaxaTipoChange={(value) => setForm((prev) => ({ ...prev, taxa_tipo: value }))}
          onTaxaPadraoChange={(value) => setForm((prev) => ({ ...prev, taxa_padrao: value }))}
          onTaxaConfigChange={(value) => setForm((prev) => ({ ...prev, taxa_config: value }))}
          disabled={false}
          isEditing={true}
        />

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
