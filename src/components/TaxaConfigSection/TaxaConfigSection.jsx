import React, { useState, useEffect, useRef } from 'react'
import { taxaConfigService } from '../../services/taxaConfigService.js'
import { PRODUTOS_TAXA, PERCENTUAIS_TAXA } from '../../constants/produtos'
import './TaxaConfigSection.css'

const initialTaxaCondForm = {
  vinculo: '',
  produto: '',
  tipo: '',
  taxa_tipo: 'PERC',
  taxa_valor: '',
  ativo: true,
}

const TIPO_PRODUTO_CHOICES = [
  { value: '', label: 'Selecione o tipo...' },
  { value: 'ALIMENTACAO', label: 'Alimentação' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'REFEICAO', label: 'Refeição' },
  { value: 'MULTI_HOME_OFFICE', label: 'Multi - Home Office' },
  { value: 'BOAS_FESTAS', label: 'Boas Festas' },
  { value: 'MULTI_ALIMENTACAO', label: 'Multi - Alimentação' },
  { value: 'MULTI_VR_VA', label: 'Multi - VR+VA' },
  { value: 'MULTI_REFEICAO', label: 'Multi - Refeição' },
  { value: 'MULTI_MOBILIDADE', label: 'Multi - Mobilidade' },
]

export default function TaxaConfigSection({
  administradoraId,
  vinculos = [],
  taxaAtiva,
  taxaTipo,
  taxaPadrao,
  taxaConfig,
  onTaxaAtivaChange,
  onTaxaTipoChange,
  onTaxaPadraoChange,
  onTaxaConfigChange,
  disabled = false,
  isEditing = false,
}) {
  const [taxasCondominio, setTaxasCondominio] = useState([])
  const [loadingTaxas, setLoadingTaxas] = useState(false)
  const [modalCondOpen, setModalCondOpen] = useState(false)
  const [taxaCondSelecionada, setTaxaCondSelecionada] = useState(null)
  const [taxaCondForm, setTaxaCondForm] = useState(initialTaxaCondForm)
  const [salvandoTaxaCond, setSalvandoTaxaCond] = useState(false)
  const [produtoSearch, setProdutoSearch] = useState('')
  const [produtoDropdownOpen, setProdutoDropdownOpen] = useState(false)
  const produtoWrapperRef = useRef(null)

  useEffect(() => {
    if (isEditing && administradoraId) {
      carregarTaxasCondominio()
    }
  }, [administradoraId, isEditing])

  useEffect(() => {
    if (!produtoDropdownOpen) {
      const selected = PRODUTOS_TAXA.find((p) => p.codigo === taxaCondForm.produto)
      setProdutoSearch(selected ? selected.nome : '')
    }
  }, [produtoDropdownOpen, taxaCondForm.produto])

  useEffect(() => {
    function handleClickOutside(e) {
      if (produtoWrapperRef.current && !produtoWrapperRef.current.contains(e.target)) {
        setProdutoDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const produtosFiltrados = produtoSearch
    ? PRODUTOS_TAXA.filter(
        (p) =>
          p.nome.toLowerCase().includes(produtoSearch.toLowerCase()) ||
          p.codigo.includes(produtoSearch)
      )
    : PRODUTOS_TAXA

  const carregarTaxasCondominio = async () => {
    try {
      setLoadingTaxas(true)
      const taxas = await taxaConfigService.listar({ administradora: administradoraId })
      const taxasList = Array.isArray(taxas) ? taxas : taxas?.results || []
      setTaxasCondominio(taxasList)
    } catch (e) {
      console.warn('Erro ao carregar taxas por condomínio:', e)
      setTaxasCondominio([])
    } finally {
      setLoadingTaxas(false)
    }
  }

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked
    onTaxaAtivaChange(checked)
    if (!checked) {
      onTaxaTipoChange('padrao')
      onTaxaPadraoChange('')
      onTaxaConfigChange(PRODUTOS_TAXA.map((p) => ({ codigo: p.codigo, valor: '' })))
    }
  }

  const handleTaxaProdutoChange = (codigo, valor) => {
    onTaxaConfigChange(
      taxaConfig.map((item) =>
        item.codigo === codigo ? { ...item, valor } : item
      )
    )
  }

  const abrirModalCond = (taxa = null) => {
    if (taxa) {
      setTaxaCondSelecionada(taxa)
      setTaxaCondForm({
        vinculo: taxa.vinculo || '',
        produto: taxa.produto_codigo || '',
        tipo: taxa.tipo || '',
        taxa_tipo: taxa.taxa_tipo || 'PERC',
        taxa_valor: taxa.taxa_valor || '',
        ativo: taxa.ativo !== false,
      })
    } else {
      setTaxaCondSelecionada(null)
      setTaxaCondForm(initialTaxaCondForm)
    }
    setModalCondOpen(true)
  }

  const fecharModalCond = () => {
    setModalCondOpen(false)
    setTaxaCondSelecionada(null)
    setTaxaCondForm(initialTaxaCondForm)
  }

  const handleSalvarTaxaCond = async () => {
    if (!taxaCondForm.vinculo) {
      alert('Selecione um condomínio')
      return
    }

    if (!taxaCondForm.taxa_valor && taxaCondForm.taxa_valor !== '0') {
      alert('Informe o valor da taxa')
      return
    }

    if (taxaCondForm.produto && taxaCondForm.tipo) {
      alert('Selecione apenas o produto ou o tipo, não ambos.')
      return
    }

    try {
      setSalvandoTaxaCond(true)

      const payload = {
        vinculo: Number(taxaCondForm.vinculo),
        produto: taxaCondForm.produto ? taxaCondForm.produto : null,
        tipo: taxaCondForm.tipo ? taxaCondForm.tipo : null,
        taxa_tipo: taxaCondForm.taxa_tipo,
        taxa_valor: parseFloat(taxaCondForm.taxa_valor) || 0,
        ativo: taxaCondForm.ativo,
      }

      if (taxaCondSelecionada?.id) {
        await taxaConfigService.atualizar(taxaCondSelecionada.id, payload)
      } else {
        await taxaConfigService.criar(payload)
      }

      fecharModalCond()
      await carregarTaxasCondominio()
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Erro ao salvar taxa'
      alert(msg)
    } finally {
      setSalvandoTaxaCond(false)
    }
  }

  const handleExcluirTaxaCond = async (taxa) => {
    if (!window.confirm('Deseja excluir esta configuração de taxa?')) return
    try {
      await taxaConfigService.remover(taxa.id)
      await carregarTaxasCondominio()
    } catch (error) {
      alert('Erro ao remover taxa')
    }
  }

  const handleToggleAtivoTaxaCond = async (taxa) => {
    try {
      await taxaConfigService.atualizarParcial(taxa.id, { ativo: !taxa.ativo })
      await carregarTaxasCondominio()
    } catch (error) {
      alert('Erro ao atualizar status da taxa')
    }
  }

  const getVinculoDisplay = (vinculo) => {
    return vinculo?.condominio_nome || vinculo?.condominio_cnpj || `Vínculo ${vinculo?.id}`
  }

  return (
    <div className="taxa-section">
      <label className="section-label">Taxa de Administração</label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={taxaAtiva}
          onChange={handleCheckboxChange}
          disabled={disabled}
        />
        Cobrar taxa de administração
      </label>

      {taxaAtiva && (
        <div className="taxa-options">
          <div className="taxa-tipo-group">
            <label className="radio-label">
              <input
                type="radio"
                name="taxa_tipo"
                value="padrao"
                checked={taxaTipo === 'padrao'}
                onChange={(e) => onTaxaTipoChange(e.target.value)}
                disabled={disabled}
              />
              <span>Taxa padrão (mesmo % para todos)</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="taxa_tipo"
                value="produto"
                checked={taxaTipo === 'produto'}
                onChange={(e) => onTaxaTipoChange(e.target.value)}
                disabled={disabled}
              />
              <span>Taxa por produto</span>
            </label>
            {isEditing && (
              <label className="radio-label">
                <input
                  type="radio"
                  name="taxa_tipo"
                  value="condominio"
                  checked={taxaTipo === 'condominio'}
                  onChange={(e) => onTaxaTipoChange(e.target.value)}
                  disabled={disabled}
                />
                <span>Taxa por condomínio</span>
              </label>
            )}
          </div>

          {taxaTipo === 'padrao' && (
            <div className="taxa-padrao-row">
              <label className="taxa-padrao-label">Percentual (%)</label>
              <div className="taxa-input-with-suffix">
                <input
                  type="number"
                  value={taxaPadrao}
                  onChange={(e) => onTaxaPadraoChange(e.target.value)}
                  disabled={disabled}
                  className="taxa-input"
                  placeholder="Ex: 3.5"
                  step="0.1"
                  min="0"
                  max="100"
                  list="percentuais-sugestao"
                />
                <span className="taxa-input-suffix">%</span>
                <datalist id="percentuais-sugestao">
                  {PERCENTUAIS_TAXA.filter((opt) => opt.value !== '').map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>
          )}

          {taxaTipo === 'produto' && (
            <div className="taxa-produtos-list">
              {taxaConfig.map((item) => (
                <div key={item.codigo} className="taxa-produto-row">
                  <span className="taxa-produto-nome">
                    {PRODUTOS_TAXA.find((p) => p.codigo === item.codigo)?.nome || item.codigo}
                  </span>
                  <div className="taxa-input-with-suffix">
                    <input
                      type="number"
                      value={item.valor}
                      onChange={(e) => handleTaxaProdutoChange(item.codigo, e.target.value)}
                      disabled={disabled}
                      className="taxa-input taxa-input-small"
                      placeholder="0"
                      step="0.1"
                      min="0"
                      max="100"
                      list={`percentuais-produto-${item.codigo}`}
                    />
                    <span className="taxa-input-suffix">%</span>
                    <datalist id={`percentuais-produto-${item.codigo}`}>
                      {PERCENTUAIS_TAXA.filter((opt) => opt.value !== '').map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>
              ))}
            </div>
          )}

          {taxaTipo === 'condominio' && isEditing && (
            <div className="taxa-condominio-section">
              <div className="taxa-condominio-header">
                <span className="taxa-condominio-title">Taxas configuradas por condomínio</span>
                <button
                  type="button"
                  onClick={() => abrirModalCond()}
                  disabled={disabled}
                  className="btn-add-taxa"
                >
                  + Nova Taxa
                </button>
              </div>

              {loadingTaxas ? (
                <p className="taxa-empty">Carregando taxas...</p>
              ) : taxasCondominio.length === 0 ? (
                <p className="taxa-empty">Nenhuma taxa por condomínio configurada.</p>
              ) : (
                <div className="taxa-condominio-table-wrapper">
                  <table className="taxa-condominio-table">
                    <thead>
                      <tr>
                        <th>Condomínio</th>
                        <th>Produto</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxasCondominio.map((t) => (
                        <tr key={t.id}>
                          <td>{getVinculoDisplay(t)}</td>
                          <td>{t.produto_nome || (t.tipo ? TIPO_PRODUTO_CHOICES.find((tp) => tp.value === t.tipo)?.label || t.tipo : 'Todos')}</td>
                          <td>
                            <span className={`taxa-badge ${t.taxa_tipo === 'PERC' ? 'badge-perc' : 'badge-fixo'}`}>
                              {t.taxa_tipo === 'PERC' ? '%' : 'R$'}
                            </span>
                          </td>
                          <td className="taxa-valor-cell">
                            {t.taxa_tipo === 'PERC' ? `${t.taxa_valor}%` : `R$ ${Number(t.taxa_valor).toFixed(2)}`}
                          </td>
                          <td>
                            <span className={`taxa-status ${t.ativo ? 'ativo' : 'inativo'}`}>
                              {t.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td>
                            <div className="taxa-actions">
                              <button type="button" onClick={() => abrirModalCond(t)} className="taxa-btn-action">
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleAtivoTaxaCond(t)}
                                className="taxa-btn-action"
                              >
                                {t.ativo ? 'Desativar' : 'Ativar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleExcluirTaxaCond(t)}
                                className="taxa-btn-action danger"
                              >
                                Excluir
                              </button>
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
        </div>
      )}

      {modalCondOpen && (
        <div className="taxa-modal-overlay">
          <div className="taxa-modal">
            <div className="taxa-modal-header">
              <div>
                <h3>{taxaCondSelecionada ? 'Editar Taxa' : 'Nova Taxa por Condomínio'}</h3>
                <p>Configure a taxa para um condomínio específico.</p>
              </div>
              <button
                type="button"
                onClick={fecharModalCond}
                disabled={salvandoTaxaCond}
                className="taxa-modal-close"
              >
                ×
              </button>
            </div>

            <div className="taxa-modal-body">
              <div className="taxa-modal-field">
                <label>Condomínio *</label>
                <select
                  value={taxaCondForm.vinculo}
                  onChange={(e) => setTaxaCondForm((prev) => ({ ...prev, vinculo: e.target.value }))}
                  disabled={salvandoTaxaCond || !!taxaCondSelecionada}
                >
                  <option value="">Selecione o condomínio...</option>
                  {vinculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {getVinculoDisplay(v)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="taxa-modal-field" ref={produtoWrapperRef} style={{ position: 'relative' }}>
                <label>Produto (Opcional)</label>
                <input
                  type="text"
                  value={produtoDropdownOpen ? produtoSearch : (PRODUTOS_TAXA.find((p) => p.codigo === taxaCondForm.produto)?.nome || '')}
                  onChange={(e) => {
                    setProdutoSearch(e.target.value)
                    setProdutoDropdownOpen(true)
                  }}
                  onFocus={() => setProdutoDropdownOpen(true)}
                  placeholder="Buscar produto..."
                  disabled={salvandoTaxaCond || !!taxaCondForm.tipo}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setProdutoDropdownOpen(false)
                  }}
                />
                {produtoDropdownOpen && (
                  <div className="taxa-search-dropdown">
                    <button
                      type="button"
                      className="taxa-search-option"
                      onClick={() => {
                        setTaxaCondForm((prev) => ({ ...prev, produto: '', tipo: '' }))
                        setProdutoSearch('')
                        setProdutoDropdownOpen(false)
                      }}
                    >
                      Todos os produtos
                    </button>
                    {produtosFiltrados.length === 0 ? (
                      <div className="taxa-search-empty">Nenhum resultado</div>
                    ) : (
                      produtosFiltrados.map((p) => (
                        <button
                          key={p.codigo}
                          type="button"
                          className={`taxa-search-option${taxaCondForm.produto === p.codigo ? ' selected' : ''}`}
                          onClick={() => {
                            setTaxaCondForm((prev) => ({ ...prev, produto: p.codigo, tipo: '' }))
                            setProdutoSearch(p.nome)
                            setProdutoDropdownOpen(false)
                          }}
                        >
                          {p.nome} ({p.codigo})
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="taxa-modal-field">
                <label>Tipo do Produto (Opcional)</label>
                <select
                  value={taxaCondForm.tipo}
                  onChange={(e) => {
                    const tipo = e.target.value
                    setTaxaCondForm((prev) => ({
                      ...prev,
                      tipo,
                      produto: tipo ? '' : prev.produto,
                    }))
                    if (tipo) {
                      setProdutoSearch('')
                    }
                  }}
                  disabled={salvandoTaxaCond || !!taxaCondForm.produto}
                >
                  {TIPO_PRODUTO_CHOICES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <small className="helper-text">
                  {taxaCondForm.produto ? 'Desmarque o produto para selecionar um tipo' : 'Tipo de produto para aplicar a taxa a todos do grupo'}
                </small>
              </div>

              <div className="taxa-modal-field">
                <label>Tipo da Taxa *</label>
                <select
                  value={taxaCondForm.taxa_tipo}
                  onChange={(e) => setTaxaCondForm((prev) => ({ ...prev, taxa_tipo: e.target.value }))}
                  disabled={salvandoTaxaCond}
                >
                  <option value="PERC">Percentual (%)</option>
                  <option value="FIXO">Valor Fixo (R$)</option>
                </select>
              </div>

              <div className="taxa-modal-field">
                <label>Valor da Taxa *</label>
                <div className="taxa-input-with-suffix">
                  <input
                    type="number"
                    value={taxaCondForm.taxa_valor}
                    onChange={(e) => setTaxaCondForm((prev) => ({ ...prev, taxa_valor: e.target.value }))}
                    placeholder={taxaCondForm.taxa_tipo === 'PERC' ? 'Ex: 3.5' : 'Ex: 5.00'}
                    step="0.01"
                    min="0"
                    max={taxaCondForm.taxa_tipo === 'PERC' ? '100' : undefined}
                    disabled={salvandoTaxaCond}
                  />
                  <span className="taxa-input-suffix">
                    {taxaCondForm.taxa_tipo === 'PERC' ? '%' : 'R$'}
                  </span>
                </div>
              </div>

              <div className="taxa-modal-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={taxaCondForm.ativo}
                    onChange={(e) => setTaxaCondForm((prev) => ({ ...prev, ativo: e.target.checked }))}
                    disabled={salvandoTaxaCond}
                  />
                  Configuração ativa
                </label>
              </div>
            </div>

            <div className="taxa-modal-footer">
              <button
                type="button"
                onClick={fecharModalCond}
                disabled={salvandoTaxaCond}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarTaxaCond}
                disabled={salvandoTaxaCond}
                className="btn-primary"
              >
                {salvandoTaxaCond ? 'Salvando...' : taxaCondSelecionada ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
