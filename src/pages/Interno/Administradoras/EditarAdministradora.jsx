import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarAdministradoraPorId, editarAdministradora } from '../../../services/administradoraService.js'
import { taxaConfigService } from '../../../services/taxaConfigService.js'
import { PRODUTOS_TAXA, PERCENTUAIS_TAXA, getLabelPercentual } from '../../../constants/produtos'
import { useAuth } from '../../../context/AuthContext.jsx'
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
  const [taxasCondominio, setTaxasCondominio] = useState([])
  const [modalTaxaCondominioOpen, setModalTaxaCondominioOpen] = useState(false)
  const [taxaCondominioSelecionada, setTaxaCondominioSelecionada] = useState(null)
  const [taxaCondForm, setTaxaCondForm] = useState({
    vinculo: '',
    produto: '',
    taxa_tipo: 'PERC',
    taxa_valor: '',
    ativo: true,
  })
  const [salvandoTaxaCond, setSalvandoTaxaCond] = useState(false)

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

      setTaxasCondominio(taxaConfigSalva)

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

  const abrirModalTaxaCondominio = (taxa = null) => {
    if (taxa) {
      setTaxaCondominioSelecionada(taxa)
      setTaxaCondForm({
        vinculo: taxa.vinculo || '',
        produto: taxa.produto || '',
        taxa_tipo: taxa.taxa_tipo || 'PERC',
        taxa_valor: taxa.taxa_valor || '',
        ativo: taxa.ativo !== false,
      })
    } else {
      setTaxaCondominioSelecionada(null)
      setTaxaCondForm({
        vinculo: '',
        produto: '',
        taxa_tipo: 'PERC',
        taxa_valor: '',
        ativo: true,
      })
    }
    setModalTaxaCondominioOpen(true)
  }

  const fecharModalTaxaCondominio = () => {
    setModalTaxaCondominioOpen(false)
    setTaxaCondominioSelecionada(null)
  }

  const handleSalvarTaxaCondominio = async () => {
    try {
      setSalvandoTaxaCond(true)

      if (!taxaCondForm.vinculo) {
        alert('Selecione um condomínio')
        return
      }

      const payload = {
        vinculo: Number(taxaCondForm.vinculo),
        produto: taxaCondForm.produto ? Number(taxaCondForm.produto) : null,
        taxa_tipo: taxaCondForm.taxa_tipo,
        taxa_valor: parseFloat(taxaCondForm.taxa_valor) || 0,
        ativo: taxaCondForm.ativo,
      }

      if (taxaCondominioSelecionada?.id) {
        await taxaConfigService.atualizar(taxaCondominioSelecionada.id, payload)
        alert('Taxa atualizada com sucesso!')
      } else {
        await taxaConfigService.criar(payload)
        alert('Taxa criada com sucesso!')
      }

      fecharModalTaxaCondominio()
      await carregarAdministradora()
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Erro ao salvar taxa'
      alert(msg)
    } finally {
      setSalvandoTaxaCond(false)
    }
  }

  const handleExcluirTaxaCondominio = async (taxa) => {
    if (!window.confirm('Deseja excluir esta configuração de taxa?')) return
    try {
      await taxaConfigService.remover(taxa.id)
      alert('Taxa removida com sucesso')
      await carregarAdministradora()
    } catch (error) {
      alert('Erro ao remover taxa')
    }
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

      const formData = {
        cnpj: form.cnpj,
        razao_social: form.razao_social,
        nome_fantasia: form.nome_fantasia || null,
        email: form.email || null,
        ativo: form.ativo,
        cartao_admin: cartaoAdminBoolean,
        d_mais: form.d_mais !== '' ? Number(form.d_mais) : null,
        taxa_padrao_tipo: form.taxa_ativa && form.taxa_tipo === 'padrao' && taxaPadraoNum !== null ? 'PERC' : 'PERC',
        taxa_padrao_valor: form.taxa_ativa && form.taxa_tipo === 'padrao' && taxaPadraoNum !== null ? taxaPadraoNum : 0,
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
                t => t.vinculo === vinculo.id && t.produto_codigo === produtoCodigo
              )

              if (existente) {
                await taxaConfigService.atualizar(existente.id, {
                  vinculo: vinculo.id,
                  produto: null,
                  taxa_tipo: 'PERC',
                  taxa_valor: valor,
                  ativo: true,
                })
              } else {
                await taxaConfigService.criar({
                  vinculo: vinculo.id,
                  produto: null,
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

          {podeVerDmais && (
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
                  <span>Taxa padrão (mesmo % para todos)</span>
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
                <label className="radio-label">
                  <input
                    type="radio"
                    name="taxa_tipo"
                    value="condominio"
                    checked={form.taxa_tipo === 'condominio'}
                    onChange={handleChange}
                  />
                  <span>Taxa por condomínio</span>
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

              {form.taxa_tipo === 'condominio' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Taxas configuradas por condomínio</span>
                    <button
                      type="button"
                      onClick={() => abrirModalTaxaCondominio()}
                      style={{ fontSize: 12, padding: '6px 12px', border: '1px solid #2563eb', borderRadius: 8, background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                    >
                      + Nova Taxa
                    </button>
                  </div>

                  {taxasCondominio.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Nenhuma taxa por condomínio configurada.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr>
                            <th style={{ background: '#f8fafc', padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Condomínio</th>
                            <th style={{ background: '#f8fafc', padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Tipo</th>
                            <th style={{ background: '#f8fafc', padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Valor</th>
                            <th style={{ background: '#f8fafc', padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                            <th style={{ background: '#f8fafc', padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxasCondominio.map((t) => (
                            <tr key={t.id}>
                              <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>{t.condominio_nome || t.condominio_cnpj || t.vinculo_display || `Vínculo ${t.vinculo}`}</td>
                              <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: t.taxa_tipo === 'PERC' ? '#eff6ff' : '#fef3c7', color: t.taxa_tipo === 'PERC' ? '#2563eb' : '#d97706' }}>
                                  {t.taxa_tipo === 'PERC' ? '%' : 'R$'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                                {t.taxa_tipo === 'PERC' ? `${t.taxa_valor}%` : `R$ ${Number(t.taxa_valor).toFixed(2)}`}
                              </td>
                              <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: t.ativo ? '#dcfce7' : '#f1f5f9', color: t.ativo ? '#16a34a' : '#64748b' }}>
                                  {t.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button type="button" onClick={() => abrirModalTaxaCondominio(t)} style={{ border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#64748b', cursor: 'pointer', padding: '4px 8px', fontSize: 11 }}>Editar</button>
                                  <button type="button" onClick={() => taxaConfigService.atualizarParcial(t.id, { ativo: !t.ativo }).then(() => carregarAdministradora())} style={{ border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#64748b', cursor: 'pointer', padding: '4px 8px', fontSize: 11 }}>
                                    {t.ativo ? 'Desativar' : 'Ativar'}
                                  </button>
                                  <button type="button" onClick={() => handleExcluirTaxaCondominio(t)} style={{ border: '1px solid #fecaca', borderRadius: 6, background: '#fff', color: '#ef4444', cursor: 'pointer', padding: '4px 8px', fontSize: 11 }}>Excluir</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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

      {modalTaxaCondominioOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 500,
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0 }}>{taxaCondominioSelecionada ? 'Editar Taxa' : 'Nova Taxa por Condomínio'}</h2>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>Configure a taxa para um condomínio específico.</p>
              </div>
              <button type="button" onClick={fecharModalTaxaCondominio} disabled={salvandoTaxaCond} style={{ border: 0, background: 'transparent', fontSize: 24, cursor: salvandoTaxaCond ? 'not-allowed' : 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>Condomínio *</label>
              <select value={taxaCondForm.vinculo} onChange={(e) => setTaxaCondForm(prev => ({ ...prev, vinculo: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                <option value="">Selecione o condomínio...</option>
                {vinculos.map((v) => (
                  <option key={v.id} value={v.id}>{v.condominio_nome || v.condominio_cnpj || `Vínculo ${v.id}`}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>Tipo da Taxa *</label>
              <select value={taxaCondForm.taxa_tipo} onChange={(e) => setTaxaCondForm(prev => ({ ...prev, taxa_tipo: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                <option value="PERC">Percentual (%)</option>
                <option value="FIXO">Valor Fixo (R$)</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>Valor da Taxa *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={taxaCondForm.taxa_valor}
                  onChange={(e) => setTaxaCondForm(prev => ({ ...prev, taxa_valor: e.target.value }))}
                  placeholder={taxaCondForm.taxa_tipo === 'PERC' ? 'Ex: 3.5' : 'Ex: 5.00'}
                  step="0.01"
                  min="0"
                  max={taxaCondForm.taxa_tipo === 'PERC' ? '100' : undefined}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13, pointerEvents: 'none' }}>
                  {taxaCondForm.taxa_tipo === 'PERC' ? '%' : 'R$'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#0f172a', cursor: 'pointer' }}>
                <input type="checkbox" checked={taxaCondForm.ativo} onChange={(e) => setTaxaCondForm(prev => ({ ...prev, ativo: e.target.checked }))} style={{ width: 16, accentColor: '#2563eb' }} />
                Configuração ativa
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #eaeaea', paddingTop: 16 }}>
              <button type="button" onClick={fecharModalTaxaCondominio} disabled={salvandoTaxaCond} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
              <button type="button" onClick={handleSalvarTaxaCondominio} disabled={salvandoTaxaCond} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#2563eb', color: '#fff' }}>
                {salvandoTaxaCond ? 'Salvando...' : taxaCondominioSelecionada ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}