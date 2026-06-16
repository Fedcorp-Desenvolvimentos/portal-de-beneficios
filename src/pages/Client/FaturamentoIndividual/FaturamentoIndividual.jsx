import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  UserPlus,
  Users,
  WalletCards,
  X,
} from 'lucide-react'

import PageLayout from '../../../Layouts/PageLayout/PageLayout'
import { entebenService } from '../../../services/entebenService'
import { faturamentoService } from '../../../services/faturamentoService'
import './FaturamentoIndividual.css'

const funcionarioVazio = () => ({
  tempId: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
  nome: '',
  cpf: '',
  matricula: '',
  cargo: '',
  beneficioId: '',
  beneficioNome: '',
  valor: '',
})

const initialForm = {
  tipoCondominio: 'existente',
  condominioBusca: '',
  condominioCnpj: '',
  condominioId: '',
  novoCondominioNome: '',
  novoCondominioCnpj: '',
  novoCondominioEndereco: '',
  novoCondominioCidade: '',
  novoCondominioUf: '',
  competencia: '',
  vigenciaInicio: '',
  vigenciaFim: '',
  vencimento: '',
  observacao: '',
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.condominios)) return value.condominios
  if (Array.isArray(value?.produtos)) return value.produtos
  if (Array.isArray(value?.beneficios)) return value.beneficios
  return []
}

const somenteDigitos = (value) => String(value || '').replace(/\D/g, '')

const normalizarTexto = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const formatCPF = (value) => {
  const digits = somenteDigitos(value).slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const formatCNPJ = (value) => {
  const digits = somenteDigitos(value).slice(0, 14)
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

const parseCurrency = (value) => {
  const raw = String(value || '').replace(/\./g, '').replace(',', '.')
  const number = Number(raw)
  return Number.isFinite(number) ? number : 0
}

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const getCondominioNome = (condominio) =>
  condominio?.nome || condominio?.razao_social || condominio?.nome_fantasia || condominio?.descricao || ''

const getCondominioCnpj = (condominio) =>
  condominio?.cnpj || condominio?.documento || condominio?.cpf_cnpj || condominio?.id || ''

const getCondominioId = (condominio) =>
  condominio?.id || condominio?.uuid || condominio?.codigo || getCondominioCnpj(condominio)

const getBeneficioNome = (beneficio) =>
  beneficio?.nome || beneficio?.descricao || beneficio?.produto || beneficio?.nome_produto || beneficio?.label || ''

const getBeneficioId = (beneficio) =>
  beneficio?.id || beneficio?.codigo || beneficio?.uuid || getBeneficioNome(beneficio)

export default function FaturamentoIndividual() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [funcionarios, setFuncionarios] = useState([funcionarioVazio()])
  const [condominios, setCondominios] = useState([])
  const [beneficios, setBeneficios] = useState([])
  const [loadingBase, setLoadingBase] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    let mounted = true

    async function carregarDados() {
      try {
        setLoadingBase(true)
        const [condominiosResp, beneficiosResp] = await Promise.all([
          entebenService.getCondominios(),
          entebenService.getBeneficios?.() || Promise.resolve([]),
        ])

        if (!mounted) return

        setCondominios(toArray(condominiosResp))
        setBeneficios(toArray(beneficiosResp))
      } catch (error) {
        console.error('Erro ao carregar dados do faturamento individual:', error)
        toast.error('Não foi possível carregar condomínios e benefícios.')
      } finally {
        if (mounted) setLoadingBase(false)
      }
    }

    carregarDados()

    return () => {
      mounted = false
    }
  }, [])

  const condominiosFiltrados = useMemo(() => {
    const term = normalizarTexto(form.condominioBusca)
    if (!term) return condominios.slice(0, 20)

    return condominios
      .filter((condominio) => {
        const nome = normalizarTexto(getCondominioNome(condominio))
        const cnpj = somenteDigitos(getCondominioCnpj(condominio))
        return nome.includes(term) || cnpj.includes(somenteDigitos(term))
      })
      .slice(0, 20)
  }, [condominios, form.condominioBusca])

  const selectedCondominio = useMemo(
    () =>
      condominios.find(
        (item) =>
          String(getCondominioId(item)) === String(form.condominioId) ||
          somenteDigitos(getCondominioCnpj(item)) === somenteDigitos(form.condominioCnpj)
      ),
    [condominios, form.condominioId, form.condominioCnpj]
  )

  const funcionariosNormalizados = useMemo(
    () =>
      funcionarios.map((funcionario) => {
        const beneficio = beneficios.find(
          (item) => String(getBeneficioId(item)) === String(funcionario.beneficioId)
        )

        return {
          ...funcionario,
          cpfLimpo: somenteDigitos(funcionario.cpf),
          beneficioNome: funcionario.beneficioNome || getBeneficioNome(beneficio),
          valorNumerico: parseCurrency(funcionario.valor),
        }
      }),
    [funcionarios, beneficios]
  )

  const totalFaturamento = useMemo(
    () => funcionariosNormalizados.reduce((total, funcionario) => total + funcionario.valorNumerico, 0),
    [funcionariosNormalizados]
  )

  const condominioPreview = useMemo(() => {
    if (form.tipoCondominio === 'novo') {
      return {
        nome: form.novoCondominioNome,
        cnpj: form.novoCondominioCnpj,
      }
    }

    return {
      nome: form.condominioBusca,
      cnpj: form.condominioCnpj,
    }
  }, [form])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateFuncionario = (tempId, field, value) => {
    setFuncionarios((prev) =>
      prev.map((funcionario) => {
        if (funcionario.tempId !== tempId) return funcionario

        if (field === 'beneficioId') {
          const beneficio = beneficios.find((item) => String(getBeneficioId(item)) === String(value))
          return {
            ...funcionario,
            beneficioId: value,
            beneficioNome: getBeneficioNome(beneficio),
          }
        }

        return { ...funcionario, [field]: value }
      })
    )
  }

  const selecionarCondominio = (condominio) => {
    setForm((prev) => ({
      ...prev,
      condominioBusca: getCondominioNome(condominio),
      condominioCnpj: getCondominioCnpj(condominio),
      condominioId: getCondominioId(condominio),
    }))
  }

  const limparCondominio = () => {
    setForm((prev) => ({
      ...prev,
      condominioBusca: '',
      condominioCnpj: '',
      condominioId: '',
    }))
  }

  const alterarTipoCondominio = (tipoCondominio) => {
    setForm((prev) => ({
      ...prev,
      tipoCondominio,
      condominioBusca: '',
      condominioCnpj: '',
      condominioId: '',
      novoCondominioNome: '',
      novoCondominioCnpj: '',
      novoCondominioEndereco: '',
      novoCondominioCidade: '',
      novoCondominioUf: '',
    }))
  }

  const adicionarFuncionario = () => {
    setFuncionarios((prev) => [...prev, funcionarioVazio()])
  }

  const removerFuncionario = (tempId) => {
    setFuncionarios((prev) => {
      if (prev.length === 1) {
        toast.warn('Mantenha ao menos um funcionário para faturar.')
        return prev
      }
      return prev.filter((funcionario) => funcionario.tempId !== tempId)
    })
  }

  const validarForm = () => {
    if (form.tipoCondominio === 'existente') {
      if (!form.condominioBusca.trim()) return 'Informe o condomínio.'
      if (!form.condominioId && !form.condominioCnpj) return 'Selecione um condomínio já cadastrado.'
    }

    if (form.tipoCondominio === 'novo') {
      if (!form.novoCondominioNome.trim()) return 'Informe o nome do novo condomínio.'
      if (somenteDigitos(form.novoCondominioCnpj).length !== 14) return 'Informe um CNPJ válido para o novo condomínio.'
    }

    if (!funcionarios.length) return 'Adicione ao menos um funcionário.'

    for (let index = 0; index < funcionariosNormalizados.length; index += 1) {
      const funcionario = funcionariosNormalizados[index]
      const label = `Funcionário ${index + 1}`

      if (!funcionario.nome.trim()) return `${label}: informe o nome.`
      if (funcionario.cpfLimpo.length !== 11) return `${label}: informe um CPF válido.`
      if (!funcionario.beneficioId && !funcionario.beneficioNome.trim()) return `${label}: informe o benefício.`
      if (funcionario.valorNumerico <= 0) return `${label}: informe um valor maior que zero.`
    }

    if (!form.competencia) return 'Informe a competência.'
    if (!form.vigenciaInicio) return 'Informe o início da vigência.'
    if (!form.vigenciaFim) return 'Informe o fim da vigência.'
    if (!form.vencimento) return 'Informe o vencimento.'
    return ''
  }

  const abrirPreview = (event) => {
    event.preventDefault()
    const erro = validarForm()
    if (erro) {
      toast.warn(erro)
      return
    }
    setShowPreview(true)
  }

  const montarCondominioPayload = (condominioCriado = null) => {
    if (form.tipoCondominio === 'novo') {
      return {
        id: condominioCriado?.id || condominioCriado?.uuid || undefined,
        cnpj: somenteDigitos(form.novoCondominioCnpj),
        nome: form.novoCondominioNome.trim(),
        endereco: form.novoCondominioEndereco.trim() || undefined,
        cidade: form.novoCondominioCidade.trim() || undefined,
        uf: form.novoCondominioUf.trim().toUpperCase() || undefined,
      }
    }

    return {
      id: form.condominioId || undefined,
      cnpj: somenteDigitos(form.condominioCnpj) || undefined,
      nome: form.condominioBusca.trim(),
    }
  }

  const montarFuncionariosPayload = (condominioPayload) =>
    funcionariosNormalizados.map((funcionario) => ({
      nome: funcionario.nome.trim(),
      cpf: funcionario.cpfLimpo,
      matricula: funcionario.matricula.trim() || undefined,
      cargo: funcionario.cargo.trim() || undefined,
      condominio: condominioPayload.cnpj || condominioPayload.id || undefined,
      condominio_id: condominioPayload.id || undefined,
      condominio_cnpj: condominioPayload.cnpj || undefined,
      beneficio: {
        id: funcionario.beneficioId || undefined,
        nome: funcionario.beneficioNome,
        valor: funcionario.valorNumerico,
      },
    }))

  const montarPayload = (condominioCriado = null) => {
    const condominioPayload = montarCondominioPayload(condominioCriado)

    return {
      tipo_faturamento: 'individual',
      origem: 'formulario_faturamento_individual',
      condominio: condominioPayload,
      condominio_id: condominioPayload.id,
      condominio_cnpj: condominioPayload.cnpj,
      condominio_nome: condominioPayload.nome,
      funcionarios: montarFuncionariosPayload(condominioPayload),
      competencia: form.competencia,
      vigencia_inicio: form.vigenciaInicio,
      vigencia_fim: form.vigenciaFim,
      vencimento: form.vencimento,
      observacao: form.observacao.trim() || undefined,
      total_colaboradores: funcionariosNormalizados.length,
      valor_total: totalFaturamento,
    }
  }

  const cadastrarCondominioSeNecessario = async () => {
    if (form.tipoCondominio !== 'novo') return null

    const payload = {
      nome: form.novoCondominioNome.trim(),
      razao_social: form.novoCondominioNome.trim(),
      cnpj: somenteDigitos(form.novoCondominioCnpj),
      endereco: form.novoCondominioEndereco.trim() || undefined,
      cidade: form.novoCondominioCidade.trim() || undefined,
      uf: form.novoCondominioUf.trim().toUpperCase() || undefined,
    }

    return entebenService.createCondominio(payload)
  }

  const cadastrarFuncionarios = async (condominioPayload) => {
    const cadastros = montarFuncionariosPayload(condominioPayload).map((funcionario) =>
      entebenService.createFuncionario({
        nome: funcionario.nome,
        cpf: funcionario.cpf,
        matricula: funcionario.matricula,
        cargo: funcionario.cargo,
        condominio: condominioPayload.cnpj || condominioPayload.id,
        condominio_id: condominioPayload.id,
        condominio_cnpj: condominioPayload.cnpj,
        beneficio: funcionario.beneficio,
        beneficio_id: funcionario.beneficio.id,
        valor: funcionario.beneficio.valor,
      })
    )

    return Promise.all(cadastros)
  }

  const confirmarFaturamento = async () => {
    const erro = validarForm()
    if (erro) {
      toast.warn(erro)
      setShowPreview(false)
      return
    }

    try {
      setSubmitting(true)
      const condominioCriado = await cadastrarCondominioSeNecessario()
      const condominioPayload = montarCondominioPayload(condominioCriado)

      await cadastrarFuncionarios(condominioPayload)
      await faturamentoService.criarFaturamentoIndividual(montarPayload(condominioCriado))

      toast.success('Faturamento individual solicitado com sucesso.')
      setShowPreview(false)
      setForm(initialForm)
      setFuncionarios([funcionarioVazio()])
      navigate('/faturamento')
    } catch (error) {
      console.error('Erro ao solicitar faturamento individual:', error)
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Não foi possível solicitar o faturamento individual.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout
      title="Faturamento Individual"
      subtitle="Cadastre ou selecione um condomínio, informe seus funcionários e solicite um faturamento pontual."
      icon={<ReceiptText />}
      loading={loadingBase}
    >
      <div className="fi-page">
     
        <form className="fi-card fi-form" onSubmit={abrirPreview}>
          <div className="fi-section-title">
            <Building2 className="fi-icon" />
            <div>
              <h3>Condomínio</h3>
              <p>Use um condomínio já cadastrado ou crie um novo antes de faturar.</p>
            </div>
          </div>

          <div className="fi-mode-toggle">
            <button
              type="button"
              className={form.tipoCondominio === 'existente' ? 'active' : ''}
              onClick={() => alterarTipoCondominio('existente')}
            >
              Condomínio existente
            </button>
            <button
              type="button"
              className={form.tipoCondominio === 'novo' ? 'active' : ''}
              onClick={() => alterarTipoCondominio('novo')}
            >
              Novo condomínio
            </button>
          </div>

          {form.tipoCondominio === 'existente' ? (
            <div className="fi-grid">
              <div className="fi-field fi-field-wide fi-combobox">
                <label>Condomínio cadastrado *</label>
                <div className="fi-search-input">
                  <Search className="fi-input-icon" />
                  <input
                    type="text"
                    value={form.condominioBusca}
                    onChange={(event) => {
                      updateField('condominioBusca', event.target.value)
                      updateField('condominioId', '')
                      updateField('condominioCnpj', '')
                    }}
                    placeholder="Digite o nome ou CNPJ do condomínio"
                    autoComplete="off"
                  />
                  {(form.condominioBusca || form.condominioId) && (
                    <button type="button" className="fi-clear" onClick={limparCondominio}>
                      <X size={16} />
                    </button>
                  )}
                </div>

                {form.condominioBusca && !form.condominioId && (
                  <div className="fi-options">
                    {condominiosFiltrados.length > 0 ? (
                      condominiosFiltrados.map((condominio) => (
                        <button
                          type="button"
                          key={`${getCondominioId(condominio)}-${getCondominioCnpj(condominio)}`}
                          onClick={() => selecionarCondominio(condominio)}
                        >
                          <Building2 size={16} />
                          <span>{getCondominioNome(condominio)}</span>
                          <small>{formatCNPJ(getCondominioCnpj(condominio))}</small>
                        </button>
                      ))
                    ) : (
                      <div className="fi-option-empty">Nenhum condomínio cadastrado encontrado.</div>
                    )}
                  </div>
                )}

                {selectedCondominio && (
                  <div className="fi-selected-condo">
                    <CheckCircle2 size={16} />
                    <span>{getCondominioNome(selectedCondominio)}</span>
                    <small>{formatCNPJ(getCondominioCnpj(selectedCondominio))}</small>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="fi-grid">
              <div className="fi-field">
                <label>Nome do condomínio *</label>
                <input
                  type="text"
                  value={form.novoCondominioNome}
                  onChange={(event) => updateField('novoCondominioNome', event.target.value)}
                  placeholder="Ex.: Condomínio Jardim Central"
                />
              </div>
              <div className="fi-field">
                <label>CNPJ do condomínio *</label>
                <input
                  type="text"
                  value={form.novoCondominioCnpj}
                  onChange={(event) => updateField('novoCondominioCnpj', formatCNPJ(event.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
              <div className="fi-field fi-field-wide">
                <label>Endereço</label>
                <input
                  type="text"
                  value={form.novoCondominioEndereco}
                  onChange={(event) => updateField('novoCondominioEndereco', event.target.value)}
                  placeholder="Rua, número, complemento"
                />
              </div>
              <div className="fi-field">
                <label>Cidade</label>
                <input
                  type="text"
                  value={form.novoCondominioCidade}
                  onChange={(event) => updateField('novoCondominioCidade', event.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div className="fi-field">
                <label>UF</label>
                <input
                  type="text"
                  value={form.novoCondominioUf}
                  onChange={(event) => updateField('novoCondominioUf', event.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          )}

          <div className="fi-divider" />

          <div className="fi-section-title">
            <Users className="fi-icon" />
            <div>
              <h3>Funcionários para faturar</h3>
              <p>Inclua os funcionários que pertencem ao condomínio selecionado. Pode ser só um, sem drama.</p>
            </div>
          </div>

          <div className="fi-funcionarios-list">
            {funcionarios.map((funcionario, index) => (
              <div className="fi-funcionario-card" key={funcionario.tempId}>
                <div className="fi-funcionario-header">
                  <strong>Funcionário {index + 1}</strong>
                  <button type="button" className="fi-remove-btn" onClick={() => removerFuncionario(funcionario.tempId)}>
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>

                <div className="fi-grid">
                  <div className="fi-field">
                    <label>Nome *</label>
                    <input
                      type="text"
                      value={funcionario.nome}
                      onChange={(event) => updateFuncionario(funcionario.tempId, 'nome', event.target.value)}
                      placeholder="Ex.: Maria Silva"
                    />
                  </div>
                  <div className="fi-field">
                    <label>CPF *</label>
                    <input
                      type="text"
                      value={funcionario.cpf}
                      onChange={(event) => updateFuncionario(funcionario.tempId, 'cpf', formatCPF(event.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </div>
                  <div className="fi-field">
                    <label>Matrícula</label>
                    <input
                      type="text"
                      value={funcionario.matricula}
                      onChange={(event) => updateFuncionario(funcionario.tempId, 'matricula', event.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="fi-field">
                    <label>Cargo/Função</label>
                    <input
                      type="text"
                      value={funcionario.cargo}
                      onChange={(event) => updateFuncionario(funcionario.tempId, 'cargo', event.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="fi-field">
                    <label>Benefício *</label>
                    <select
                      value={funcionario.beneficioId}
                      onChange={(event) => updateFuncionario(funcionario.tempId, 'beneficioId', event.target.value)}
                    >
                      <option value="">Selecione</option>
                      {beneficios.map((beneficio) => (
                        <option key={getBeneficioId(beneficio)} value={getBeneficioId(beneficio)}>
                          {getBeneficioNome(beneficio)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="fi-field">
                    <label>Valor *</label>
                    <input
                      type="text"
                      value={funcionario.valor}
                      onChange={(event) => updateFuncionario(funcionario.tempId, 'valor', event.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="fi-add-btn" onClick={adicionarFuncionario}>
            <Plus size={18} />
            Adicionar funcionário
          </button>

          <div className="fi-divider" />

          <div className="fi-section-title">
            <CalendarDays className="fi-icon" />
            <div>
              <h3>Dados do faturamento</h3>
              <p>Essas datas serão aplicadas para todos os funcionários informados.</p>
            </div>
          </div>

          <div className="fi-grid">
            <div className="fi-field">
              <label>Competência *</label>
              <input
                type="month"
                value={form.competencia}
                onChange={(event) => updateField('competencia', event.target.value)}
              />
            </div>
            <div className="fi-field">
              <label>Vencimento *</label>
              <input
                type="date"
                value={form.vencimento}
                onChange={(event) => updateField('vencimento', event.target.value)}
              />
            </div>
            <div className="fi-field">
              <label>Vigência início *</label>
              <input
                type="date"
                value={form.vigenciaInicio}
                onChange={(event) => updateField('vigenciaInicio', event.target.value)}
              />
            </div>
            <div className="fi-field">
              <label>Vigência fim *</label>
              <input
                type="date"
                value={form.vigenciaFim}
                onChange={(event) => updateField('vigenciaFim', event.target.value)}
              />
            </div>
            <div className="fi-field fi-field-wide">
              <label>Observação</label>
              <textarea
                rows="4"
                value={form.observacao}
                onChange={(event) => updateField('observacao', event.target.value)}
                placeholder="Informação opcional para o faturamento"
              />
            </div>
          </div>

          <div className="fi-actions">
            <button type="button" className="fi-btn fi-btn-secondary" onClick={() => navigate('/faturamento')}>
              Cancelar
            </button>
            <button type="submit" className="fi-btn fi-btn-primary">
              <Plus size={18} />
              Gerar preview
            </button>
          </div>
        </form>
      </div>

      {showPreview && (
        <div className="fi-modal-backdrop" onClick={() => !submitting && setShowPreview(false)}>
          <div className="fi-modal" onClick={(event) => event.stopPropagation()}>
            <div className="fi-modal-header">
              <div>
                <h3>Preview do Faturamento Individual</h3>
                <p>Confira condomínio, funcionários e valores antes de confirmar.</p>
              </div>
              <button type="button" className="fi-icon-btn" onClick={() => setShowPreview(false)} disabled={submitting}>
                <X size={20} />
              </button>
            </div>

            <div className="fi-preview-grid">
              <div className="fi-preview-card">
                <Building2 size={20} />
                <span>Condomínio</span>
                <strong>{condominioPreview.nome}</strong>
                <small>{formatCNPJ(condominioPreview.cnpj)}</small>
              </div>
              <div className="fi-preview-card">
                <Users size={20} />
                <span>Funcionários</span>
                <strong>{funcionariosNormalizados.length}</strong>
                <small>{form.tipoCondominio === 'novo' ? 'Novo condomínio' : 'Condomínio existente'}</small>
              </div>
              <div className="fi-preview-card">
                <WalletCards size={20} />
                <span>Total</span>
                <strong>{formatCurrency(totalFaturamento)}</strong>
                <small>Somente itens informados</small>
              </div>
              <div className="fi-preview-card">
                <CalendarDays size={20} />
                <span>Competência</span>
                <strong>{form.competencia}</strong>
                <small>Vencimento: {form.vencimento}</small>
              </div>
            </div>

            <div className="fi-preview-table-wrap">
              <table className="fi-preview-table">
                <thead>
                  <tr>
                    <th>Condomínio</th>
                    <th>Funcionário</th>
                    <th>CPF</th>
                    <th>Benefício</th>
                    <th>Vigência</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionariosNormalizados.map((funcionario) => (
                    <tr key={funcionario.tempId}>
                      <td>{condominioPreview.nome}</td>
                      <td>{funcionario.nome}</td>
                      <td>{funcionario.cpf}</td>
                      <td>{funcionario.beneficioNome}</td>
                      <td>{form.vigenciaInicio} até {form.vigenciaFim}</td>
                      <td>{formatCurrency(funcionario.valorNumerico)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="fi-total-box">
              <div>
                <CreditCard size={20} />
                <span>Total de funcionários</span>
                <strong>{funcionariosNormalizados.length}</strong>
              </div>
              <div>
                <WalletCards size={20} />
                <span>Total do faturamento</span>
                <strong>{formatCurrency(totalFaturamento)}</strong>
              </div>
            </div>

            <div className="fi-modal-actions">
              <button type="button" className="fi-btn fi-btn-secondary" onClick={() => setShowPreview(false)} disabled={submitting}>
                Voltar e editar
              </button>
              <button type="button" className="fi-btn fi-btn-primary" onClick={confirmarFaturamento} disabled={submitting}>
                {submitting ? <Loader2 className="fi-spin" size={18} /> : <CheckCircle2 size={18} />}
                Confirmar faturamento
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
