import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Building2,
  Plus,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  UserPlus,
  MapPin,
  Trash2,
  Search,
  Pencil,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Link,
  Unlink,
  Percent,
  DollarSign,
} from 'lucide-react'

import './GerenciamentoCondominios.css'
import { entebenService } from '../../services/entebenService'
import PageLayout from '../../Layouts/PageLayout/PageLayout'
import { useAuth } from '../../context/AuthContext'

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  if (Array.isArray(value?.data)) return value.data
  return []
}

const somenteDigitos = (value) => String(value || '').replace(/\D/g, '')

const normalizarTexto = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const formatarCNPJ = (cnpj) => {
  if (!cnpj) return '—'
  const digits = somenteDigitos(cnpj)

  if (digits.length === 14) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    )
  }

  return cnpj
}

const formatarCPF = (cpf) => {
  if (!cpf) return '—'
  const digits = somenteDigitos(cpf)

  if (digits.length === 11) {
    return digits.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    )
  }

  return cpf
}

const getAdministradoraIdFromUser = (user) => {
  if (!user) return null

  if (user?.administradora_ativa_id || user?.administradora_ativa) {
    return user.administradora_ativa_id || user.administradora_ativa
  }

  if (Array.isArray(user?.administradoras) && user.administradoras.length > 0) {
    return user.administradoras
      .map((adm) => adm?.id || adm?.administradora_id || adm)
      .filter(Boolean)
  }

  if (Array.isArray(user?.administradora) && user.administradora.length > 0) {
    return user.administradora
      .map((adm) => adm?.id || adm?.administradora_id || adm)
      .filter(Boolean)
  }

  return (
    user?.administradora?.id ||
    user?.administradora_id ||
    user?.id_administradora ||
    user?.administradoraId ||
    user?.administradora_id_id ||
    user?.administradora ||
    null
  )
}

const getAdministradoraIdFromCondominio = (condominio) => {
  if (Array.isArray(condominio?.administradoras)) {
    return condominio.administradoras
      .map((adm) => adm?.id || adm?.administradora_id || adm)
      .filter(Boolean)
  }

  return (
    condominio?.administradora?.id ||
    condominio?.administradora_id ||
    condominio?.id_administradora ||
    condominio?.administradoraId ||
    condominio?.administradora_id_id ||
    condominio?.administradora ||
    null
  )
}

const getAdministradoraNome = (condominio) => {
  if (
    Array.isArray(condominio?.administradoras) &&
    condominio.administradoras.length > 0
  ) {
    return condominio.administradoras
      .map((adm) => adm.nome || adm.razao_social)
      .filter(Boolean)
      .join(', ')
  }

  return (
    condominio?.administradora?.nome ||
    condominio?.administradora?.razao_social ||
    condominio?.nome_administradora ||
    condominio?.administradora_nome ||
    condominio?.razao_social_administradora ||
    '—'
  )
}

function ModalFuncionarios({
  open,
  condominio,
  funcionarios,
  loading,
  onClose,
  onUnlink,
  onOpenVincular,
}) {
  const [busca, setBusca] = useState('')

  const funcionariosFiltrados = useMemo(() => {
    if (!busca.trim()) return funcionarios || []

    const term = normalizarTexto(busca)

    return (funcionarios || []).filter((f) => {
      const nome = normalizarTexto(f.nome || '')
      const cpf = somenteDigitos(f.cpf || '')
      const funcao = normalizarTexto(f.funcao || '')
      const matricula = normalizarTexto(f.matricula || '')

      return (
        nome.includes(term) ||
        cpf.includes(term) ||
        funcao.includes(term) ||
        matricula.includes(term)
      )
    })
  }, [funcionarios, busca])

  const getFuncaoLabel = (funcao) => {
    const labels = {
      ZELADOR: 'Zelador',
      PORTEIR: 'Porteiro',
      FAXINEI: 'Faxineiro',
      SINICO: 'Síndico',
      ADMIN: 'Administrador',
    }

    return labels[funcao] || funcao || '—'
  }

  if (!open) return null

  return (
    <div className="cfg-modal-backdrop" onClick={onClose}>
      <div
        className="cfg-modal cfg-funcionarios-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-title">
            <Users className="ico brand" />
            <h3>Funcionários de {condominio?.nome}</h3>
          </div>

          <button className="icon-btn" onClick={onClose} title="Fechar">
            <X className="ico" />
          </button>
        </div>

        <div className="modal-body">
          <div className="cfg-funcionarios-stats">
            <span className="cfg-stat">
              <Users className="ico sm" />
              Total: {(funcionarios || []).length} funcionário(s)
            </span>

            <button className="btn btn-sm btn-primary" onClick={onOpenVincular}>
              <Link className="ico" />
              Vincular existentes
            </button>
          </div>

          <div className="cfg-funcionarios-search">
            <Search className="ico" />

            <input
              type="text"
              placeholder="Buscar por nome, CPF, função ou matrícula"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            {busca && (
              <button
                className="cfg-clear-search"
                onClick={() => setBusca('')}
              >
                <X className="ico" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty-funcionarios">
              <div className="spinner" />
              <p>Carregando funcionários...</p>
            </div>
          ) : funcionariosFiltrados.length === 0 ? (
            <div className="empty-funcionarios">
              <Users className="ico xl muted" />
              <p>
                {busca
                  ? 'Nenhum funcionário encontrado para esta busca'
                  : 'Nenhum funcionário vinculado'}
              </p>
            </div>
          ) : (
            <div className="cfg-funcionarios-list">
              {funcionariosFiltrados.map((func) => (
                <div key={func.cpf} className="cfg-funcionario-card">
                  <div className="cfg-funcionario-header">
                    <div className="cfg-funcionario-avatar">
                      <User className="ico" />
                    </div>

                    <div className="cfg-funcionario-info">
                      <div className="cfg-funcionario-nome">
                        {func.nome || '—'}
                      </div>

                      <div className="cfg-funcionario-detalhes">
                        {func.funcao && (
                          <span className="cfg-badge-funcao">
                            {getFuncaoLabel(func.funcao)}
                          </span>
                        )}

                        {func.matricula && (
                          <span className="cfg-badge-matricula">
                            Matr: {func.matricula}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="icon-btn danger"
                      onClick={() => onUnlink(func)}
                      title="Desvincular"
                    >
                      <Unlink className="ico" />
                    </button>
                  </div>

                  <div className="cfg-funcionario-body">
                    <div className="cfg-field-row">
                      <span className="cfg-field-label">CPF:</span>
                      <span className="cfg-field-value">
                        {formatarCPF(func.cpf)}
                      </span>
                    </div>

                    {func.data_nascimento && (
                      <div className="cfg-field-row">
                        <span className="cfg-field-label">Nascimento:</span>
                        <span className="cfg-field-value">
                          {new Date(func.data_nascimento).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    )}

                    {func.departamento && (
                      <div className="cfg-field-row">
                        <span className="cfg-field-label">Departamento:</span>
                        <span className="cfg-field-value">
                          {func.departamento}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalVincularFuncionarios({
  open,
  condominio,
  funcionariosDisponiveis,
  loading,
  onVincular,
  onClose,
}) {
  const [selecionados, setSelecionados] = useState([])
  const [busca, setBusca] = useState('')

  const funcionariosFiltrados = useMemo(() => {
    if (!busca.trim()) return funcionariosDisponiveis || []

    const term = normalizarTexto(busca)

    return (funcionariosDisponiveis || []).filter((f) => {
      const nome = normalizarTexto(f.nome || '')
      const cpf = somenteDigitos(f.cpf || '')

      return nome.includes(term) || cpf.includes(term)
    })
  }, [funcionariosDisponiveis, busca])

  const toggleSelecionado = (funcionario) => {
    setSelecionados((prev) =>
      prev.find((f) => f.cpf === funcionario.cpf)
        ? prev.filter((f) => f.cpf !== funcionario.cpf)
        : [...prev, funcionario]
    )
  }

  const handleVincular = () => {
    onVincular(selecionados)
    setSelecionados([])
  }

  if (!open) return null

  return (
    <div className="cfg-modal-backdrop" onClick={onClose}>
      <div
        className="cfg-modal cfg-funcionarios-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-title">
            <Link className="ico brand" />
            <h3>Vincular Funcionários a {condominio?.nome}</h3>
          </div>

          <button className="icon-btn" onClick={onClose}>
            <X className="ico" />
          </button>
        </div>

        <div className="modal-body">
          <div className="cfg-funcionarios-stats">
            <span className="cfg-stat">
              <Users className="ico sm" />
              Disponíveis: {funcionariosDisponiveis?.length || 0} funcionário(s)
              sem vínculo
            </span>
          </div>

          <div className="cfg-funcionarios-search">
            <Search className="ico" />

            <input
              type="text"
              placeholder="Buscar funcionário por nome ou CPF"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            {busca && (
              <button
                className="cfg-clear-search"
                onClick={() => setBusca('')}
              >
                <X className="ico" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty-funcionarios">
              <div className="spinner" />
              <p>Carregando funcionários...</p>
            </div>
          ) : funcionariosFiltrados.length === 0 ? (
            <div className="empty-funcionarios">
              <Users className="ico xl muted" />
              <p>
                {busca
                  ? 'Nenhum funcionário encontrado'
                  : 'Todos os funcionários já estão vinculados a algum condomínio'}
              </p>
            </div>
          ) : (
            <div className="cfg-funcionarios-list">
              {funcionariosFiltrados.map((func) => (
                <label key={func.cpf} className="cfg-vinculo-item">
                  <input
                    type="checkbox"
                    checked={selecionados.some((f) => f.cpf === func.cpf)}
                    onChange={() => toggleSelecionado(func)}
                  />

                  <div className="cfg-vinculo-info">
                    <strong>{func.nome}</strong>

                    <small>
                      CPF: {formatarCPF(func.cpf)} | Função:{' '}
                      {func.funcao || '—'} | Matrícula:{' '}
                      {func.matricula || '—'}
                    </small>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="btn btn-primary"
            onClick={handleVincular}
            disabled={selecionados.length === 0}
          >
            <Link className="ico" />
            Vincular {selecionados.length} funcionário(s)
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalColaborador({ open, condominio, form, onChange, onSave, onCancel }) {
  if (!open) return null

  return (
    <div className="cfg-modal-backdrop" onClick={onCancel}>
      <div
        className="cfg-modal cfg-colaborador-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-title">
            <UserPlus className="ico brand" />
            <h3>Adicionar colaborador</h3>
          </div>

          <button className="icon-btn" onClick={onCancel}>
            <X className="ico" />
          </button>
        </div>

        <div className="modal-body">
          <div className="cfg-info-box">
            Condomínio: <strong>{condominio?.nome}</strong>
          </div>

          <div className="grid cfg-colaborador-grid">
            <div className="field grid-full">
              <label>Nome do colaborador *</label>
              <input
                name="nome"
                value={form.nome}
                onChange={onChange}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="field">
              <label>CPF *</label>
              <input
                name="cpf"
                value={form.cpf}
                onChange={onChange}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>

            <div className="field">
              <label>Matrícula</label>
              <input
                name="matricula"
                value={form.matricula}
                onChange={onChange}
                placeholder="Número da matrícula"
              />
            </div>

            <div className="field">
              <label>Cargo / Função</label>
              <input
                name="funcao"
                value={form.funcao}
                onChange={onChange}
                placeholder="Ex: Porteiro"
              />
            </div>

            <div className="field">
              <label>Data de Nascimento</label>
              <input
                type="date"
                name="data_nascimento"
                value={form.data_nascimento}
                onChange={onChange}
              />
            </div>

            <div className="field">
              <label>Telefone</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={onChange}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="field">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onCancel}>
            Cancelar
          </button>

          <button className="btn btn-primary" onClick={onSave}>
            <Save className="ico" />
            Salvar colaborador
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalTaxas({
  open,
  condominio,
  taxas,
  produtos,
  loading,
  form,
  onChange,
  onSave,
  onDelete,
  onClose,
}) {
  if (!open) return null

  const produtosOptions = produtos || []

  return (
    <div className="cfg-modal-backdrop" onClick={onClose}>
      <div
        className="cfg-modal cfg-taxas-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-title">
            <Percent className="ico brand" />
            <h3>Taxas de {condominio?.nome}</h3>
          </div>

          <button className="icon-btn" onClick={onClose}>
            <X className="ico" />
          </button>
        </div>

        <div className="modal-body">
          <div className="cfg-info-box">
            Configure taxas específicas para este condomínio. Se deixar o
            produto vazio, a taxa aplicará a todos os produtos.
          </div>

          <div className="cfg-taxas-form">
            <div className="field">
              <label>Produto</label>
              <select
                name="produto"
                value={form.produto || ''}
                onChange={onChange}
              >
                <option value="">Todos os produtos</option>
                {produtosOptions.map((p) => (
                  <option key={p.id || p.codigo_produto} value={p.id}>
                    {p.nome || p.codigo_produto}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Tipo</label>
              <select
                name="taxa_tipo"
                value={form.taxa_tipo || 'PERC'}
                onChange={onChange}
              >
                <option value="PERC">Percentual (%)</option>
                <option value="FIXO">Valor Fixo (R$)</option>
              </select>
            </div>

            <div className="field">
              <label>Valor</label>
              <input
                type="number"
                step="0.01"
                name="taxa_valor"
                value={form.taxa_valor || ''}
                onChange={onChange}
                placeholder={form.taxa_tipo === 'PERC' ? 'Ex: 2.5' : 'Ex: 10.00'}
              />
            </div>

            <div className="field cfg-taxa-ativo">
              <label>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={form.ativo !== false}
                  onChange={onChange}
                />
                Ativo
              </label>
            </div>

            <button className="btn btn-primary" onClick={onSave} disabled={loading}>
              <Save className="ico" />
              {form.id ? 'Atualizar taxa' : 'Adicionar taxa'}
            </button>
          </div>

          {loading ? (
            <div className="empty-funcionarios">
              <div className="spinner" />
              <p>Carregando taxas...</p>
            </div>
          ) : taxas.length === 0 ? (
            <div className="empty-funcionarios">
              <Percent className="ico xl muted" />
              <p>Nenhuma taxa configurada para este condomínio.</p>
            </div>
          ) : (
            <div className="cfg-taxas-list">
              {taxas.map((taxa) => (
                <div key={taxa.id} className="cfg-taxa-card">
                  <div className="cfg-taxa-info">
                    <div className="cfg-taxa-produto">
                      {taxa.produto_nome || taxa.produto_codigo || 'Todos os produtos'}
                    </div>
                    <div className="cfg-taxa-valor">
                      {taxa.taxa_tipo === 'PERC' ? (
                        <>
                          <Percent className="ico sm" /> {taxa.taxa_valor}%
                        </>
                      ) : (
                        <>
                          <DollarSign className="ico sm" /> R$ {taxa.taxa_valor}
                        </>
                      )}
                      {!taxa.ativo && (
                        <span className="cfg-badge-inativo">Inativo</span>
                      )}
                    </div>
                  </div>
                  <div className="cfg-taxa-actions">
                    <button
                      className="icon-btn cfg-table-action blue"
                      onClick={() => onChange({ target: { name: 'editar', value: taxa } })}
                      title="Editar"
                    >
                      <Pencil className="ico" />
                    </button>
                    <button
                      className="icon-btn cfg-table-action red"
                      onClick={() => onDelete(taxa)}
                      title="Excluir"
                    >
                      <Trash2 className="ico" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}


function ModalConfirm({ open, nome, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="cfg-modal-backdrop" onClick={onCancel}>
      <div className="cfg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <Trash2 className="ico danger" />
            <h3>Excluir condomínio</h3>
          </div>

          <button className="icon-btn" onClick={onCancel}>
            <X className="ico" />
          </button>
        </div>

        <div className="modal-body">
          Tem certeza que deseja excluir <strong>{nome}</strong>? Esta ação não
          pode ser desfeita.
        </div>

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onCancel}>
            Cancelar
          </button>

          <button className="btn btn-danger" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

function FiltroCondominios({ value, onChange, onClear }) {
  return (
    <div className="cfg-filter-bar">
      <div className="cfg-filter-search">
        <Search className="ico" />

        <input
          type="text"
          placeholder="Buscar condomínio por nome ou CNPJ"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {value && (
          <button
            type="button"
            className="cfg-filter-clear"
            onClick={onClear}
          >
            <X className="ico" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function ConfiguracaoCondominios() {
  const { user } = useAuth()

  const userTipo = String(user?.tipo || user?.tipo_usuario || user?.role || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  const isUsuarioGlobal = ['dev', 'fat'].includes(userTipo)
  const podeVerAdministradora = isUsuarioGlobal

  const [modoAtivo, setModoAtivo] = useState('lista')
  const [condominios, setCondominios] = useState([])
  const [totalCondominios, setTotalCondominios] = useState(0)
  const [todosFuncionarios, setTodosFuncionarios] = useState([])
  const [loadingCondominios, setLoadingCondominios] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)
  const [erroCondominios, setErroCondominios] = useState('')

  const [formData, setFormData] = useState({
    cnpj: '',
    nome: '',
    tipo_local: 'CONDOMINIO',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  })

  const [editandoCnpj, setEditandoCnpj] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, id: null, nome: '' })
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success',
  })
  const [busca, setBusca] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 10

  const [funcionariosModal, setFuncionariosModal] = useState({
    open: false,
    condominio: null,
    funcionarios: [],
  })

  const [vincularModal, setVincularModal] = useState({
    open: false,
    condominio: null,
  })

  const [colaboradorModal, setColaboradorModal] = useState({
    open: false,
    condominio: null,
  })

  const [colaboradorForm, setColaboradorForm] = useState({
    nome: '',
    cpf: '',
    matricula: '',
    funcao: '',
    data_nascimento: '',
    telefone: '',
    email: '',
  })

  const [taxasModal, setTaxasModal] = useState({
    open: false,
    condominio: null,
    taxas: [],
    loading: false,
  })

  const [produtos, setProdutos] = useState([])

  const [taxaForm, setTaxaForm] = useState({
    id: null,
    produto: '',
    taxa_tipo: 'PERC',
    taxa_valor: '',
    ativo: true,
  })

  const toastTimer = useRef(null)

  useEffect(() => {
    carregarCondominios(busca, paginaAtual)
    carregarFuncionarios()
  }, [])

  useEffect(() => {
    carregarCondominios(busca, paginaAtual)
  }, [busca, paginaAtual, user])

  const carregarCondominios = async (cnpj, page) => {
    try {
      setLoadingCondominios(true)

      const response = await entebenService.getCondominios(cnpj, page, itensPorPagina)

      // Resposta paginada do DRF: { count, next, previous, results }
      const results = Array.isArray(response?.results)
        ? response.results
        : toArray(response)
      const total = response?.count || results.length

      setCondominios(results)
      setTotalCondominios(total)
      setErroCondominios('')
    } catch (err) {
      console.error('Erro ao carregar condomínios:', err)
      setErroCondominios('Não foi possível carregar os dados.')
    } finally {
      setLoadingCondominios(false)
    }
  }

  const carregarFuncionarios = async () => {
    try {
      const response = await entebenService.getFuncionarios()
      const list = toArray(response)

      setTodosFuncionarios(list)
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err)
    }
  }

  const carregarDados = async () => {
    await Promise.all([
      carregarCondominios(busca, paginaAtual),
      carregarFuncionarios(),
    ])
  }

  const handleBuscaChange = (value) => {
    setBusca(value)
    setPaginaAtual(1)
  }

  const showToast = (message, type = 'success') => {
    setToast({ open: true, message, type })

    if (toastTimer.current) clearTimeout(toastTimer.current)

    toastTimer.current = setTimeout(
      () => setToast({ open: false, message: '', type: 'success' }),
      2500
    )
  }

  const vincularFuncionarios = async (condominio, funcionariosParaVincular) => {
    setLoadingAction(true)

    try {
      for (const func of funcionariosParaVincular) {
        const payload = {
          cpf: func.cpf,
          nome: func.nome,
          matricula: func.matricula,
          funcao: func.funcao,
          data_nascimento: func.data_nascimento,
          telefone: func.telefone,
          email: func.email,
          departamento: func.departamento,
          condominio: condominio.cnpj,
        }

        await entebenService.updateFuncionario(func.cpf, payload)
      }

      await carregarDados()
      showToast(
        `${funcionariosParaVincular.length} funcionário(s) vinculado(s) com sucesso!`
      )
      setVincularModal({ open: false, condominio: null })
    } catch (err) {
      console.error('Erro ao vincular:', err)
      showToast('Erro ao vincular funcionários', 'danger')
    } finally {
      setLoadingAction(false)
    }
  }

  const desvincularFuncionario = async (condominio, funcionario) => {
    setLoadingAction(true)

    try {
      const payload = {
        cpf: funcionario.cpf,
        nome: funcionario.nome,
        matricula: funcionario.matricula,
        funcao: funcionario.funcao,
        data_nascimento: funcionario.data_nascimento,
        telefone: funcionario.telefone,
        email: funcionario.email,
        departamento: funcionario.departamento,
        condominio: null,
      }

      await entebenService.updateFuncionario(funcionario.cpf, payload)
      await carregarDados()

      showToast(`Funcionário ${funcionario.nome} desvinculado com sucesso!`)
      setFuncionariosModal((prev) => ({ ...prev, open: false }))
    } catch (err) {
      console.error('Erro ao desvincular:', err)
      showToast('Erro ao desvincular funcionário', 'danger')
    } finally {
      setLoadingAction(false)
    }
  }

  const adicionarColaborador = async () => {
    if (!colaboradorForm.nome.trim()) {
      showToast('Informe o nome do colaborador', 'danger')
      return
    }

    if (!colaboradorForm.cpf.trim()) {
      showToast('Informe o CPF do colaborador', 'danger')
      return
    }

    setLoadingAction(true)

    try {
      const novoFuncionario = {
        cpf: somenteDigitos(colaboradorForm.cpf),
        nome: colaboradorForm.nome,
        matricula: colaboradorForm.matricula,
        funcao: colaboradorForm.funcao,
        data_nascimento: colaboradorForm.data_nascimento || null,
        telefone: colaboradorForm.telefone,
        email: colaboradorForm.email,
        condominio: colaboradorModal.condominio?.cnpj,
        departamento: colaboradorModal.condominio?.nome,
      }

      await entebenService.createFuncionario(novoFuncionario)
      await carregarDados()

      showToast('Colaborador adicionado com sucesso!')
      setColaboradorModal({ open: false, condominio: null })
      setColaboradorForm({
        nome: '',
        cpf: '',
        matricula: '',
        funcao: '',
        data_nascimento: '',
        telefone: '',
        email: '',
      })
    } catch (err) {
      console.error('Erro ao adicionar:', err)
      showToast('Erro ao adicionar colaborador', 'danger')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.cnpj) {
      showToast('CNPJ é obrigatório', 'danger')
      return
    }

    if (!formData.nome) {
      showToast('Nome é obrigatório', 'danger')
      return
    }

    setLoadingAction(true)

    try {
      const administradoraId = getAdministradoraIdFromUser(user)

      const payload = {
        ...formData,
        ...(administradoraId && !Array.isArray(administradoraId)
          ? { administradora: administradoraId }
          : {}),
      }

      if (editandoCnpj) {
        await entebenService.updateCondominio(editandoCnpj, payload)
        showToast('Condomínio atualizado com sucesso!')
      } else {
        await entebenService.createCondominio(payload)
        showToast('Condomínio cadastrado com sucesso!')
      }

      await carregarDados()
      resetForm()
      setModoAtivo('lista')
    } catch (err) {
      console.error('Erro ao salvar:', err)
      showToast('Erro ao salvar condomínio', 'danger')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleExcluir = async () => {
    setLoadingAction(true)

    try {
      await entebenService.deleteCondominio(confirm.id)
      await carregarDados()

      showToast('Condomínio excluído com sucesso', 'danger')
      setConfirm({ open: false, id: null, nome: '' })
    } catch (err) {
      console.error('Erro ao excluir:', err)
      showToast('Erro ao excluir condomínio', 'danger')
    } finally {
      setLoadingAction(false)
    }
  }

  const resetForm = () => {
    setFormData({
      cnpj: '',
      nome: '',
      tipo_local: 'CONDOMINIO',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    })

    setEditandoCnpj(null)
  }

  const handleEditar = (condominio) => {
    setFormData({
      cnpj: condominio.cnpj,
      nome: condominio.nome,
      tipo_local: condominio.tipo_local || 'CONDOMINIO',
      endereco: condominio.endereco || '',
      numero: condominio.numero || '',
      complemento: condominio.complemento || '',
      bairro: condominio.bairro || '',
      cidade: condominio.cidade || '',
      estado: condominio.estado || '',
      cep: condominio.cep || '',
    })

    setEditandoCnpj(condominio.cnpj)
    setModoAtivo('form')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleColaboradorChange = (e) => {
    const { name, value } = e.target

    setColaboradorForm((prev) => ({ ...prev, [name]: value }))
  }

  const carregarProdutos = async () => {
    try {
      const response = await entebenService.getBeneficios()
      setProdutos(toArray(response))
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
    }
  }

  const abrirModalTaxas = async (condominio) => {
    setTaxasModal({
      open: true,
      condominio,
      taxas: [],
      loading: true,
    })
    setTaxaForm({
      id: null,
      produto: '',
      taxa_tipo: 'PERC',
      taxa_valor: '',
      ativo: true,
    })

    await carregarProdutos()
    await carregarTaxas(condominio.cnpj)
  }

  const carregarTaxas = async (cnpj) => {
    try {
      setTaxasModal((prev) => ({ ...prev, loading: true }))
      const response = await entebenService.getTaxasConfig({ condominio: cnpj })
      const taxas = Array.isArray(response?.results)
        ? response.results
        : toArray(response)
      setTaxasModal((prev) => ({ ...prev, taxas, loading: false }))
    } catch (err) {
      console.error('Erro ao carregar taxas:', err)
      showToast('Erro ao carregar taxas', 'danger')
      setTaxasModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleTaxaChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'editar') {
      const taxa = value
      setTaxaForm({
        id: taxa.id,
        produto: taxa.produto || '',
        taxa_tipo: taxa.taxa_tipo || 'PERC',
        taxa_valor: taxa.taxa_valor || '',
        ativo: taxa.ativo !== false,
      })
      return
    }

    setTaxaForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const salvarTaxa = async () => {
    if (!taxaForm.taxa_valor || Number(taxaForm.taxa_valor) < 0) {
      showToast('Informe um valor de taxa válido', 'danger')
      return
    }

    setLoadingAction(true)

    try {
      const payload = {
        taxa_tipo: taxaForm.taxa_tipo,
        taxa_valor: Number(taxaForm.taxa_valor),
        ativo: taxaForm.ativo,
      }

      if (taxaForm.id) {
        await entebenService.updateTaxaConfig(taxaForm.id, payload)
        showToast('Taxa atualizada com sucesso!')
      } else {
        // Descobre o vínculo do condomínio com a administradora ativa
        const vinculos = await entebenService.getVinculosCondominio({
          condominio: taxasModal.condominio?.cnpj,
        })
        const vinculosList = Array.isArray(vinculos?.results)
          ? vinculos.results
          : toArray(vinculos)

        const administradoraId = getAdministradoraIdFromUser(user)
        const vinculo = vinculosList.find(
          (v) => String(v.administradora) === String(administradoraId)
        ) || vinculosList[0]

        if (!vinculo) {
          showToast('Condomínio não possui vínculo com administradora', 'danger')
          setLoadingAction(false)
          return
        }

        payload.vinculo = vinculo.id
        if (taxaForm.produto) {
          payload.produto = taxaForm.produto
        }

        await entebenService.createTaxaConfig(payload)
        showToast('Taxa cadastrada com sucesso!')
      }

      await carregarTaxas(taxasModal.condominio?.cnpj)
      setTaxaForm({
        id: null,
        produto: '',
        taxa_tipo: 'PERC',
        taxa_valor: '',
        ativo: true,
      })
    } catch (err) {
      console.error('Erro ao salvar taxa:', err)
      showToast('Erro ao salvar taxa', 'danger')
    } finally {
      setLoadingAction(false)
    }
  }

  const excluirTaxa = async (taxa) => {
    if (!window.confirm('Tem certeza que deseja excluir esta taxa?')) return

    setLoadingAction(true)

    try {
      await entebenService.deleteTaxaConfig(taxa.id)
      await carregarTaxas(taxasModal.condominio?.cnpj)
      showToast('Taxa excluída com sucesso')
    } catch (err) {
      console.error('Erro ao excluir taxa:', err)
      showToast('Erro ao excluir taxa', 'danger')
    } finally {
      setLoadingAction(false)
    }
  }

  const funcionariosDisponiveis = useMemo(() => {
    return todosFuncionarios.filter((func) => {
      if (!func.condominio) return true
      if (typeof func.condominio === 'object' && !func.condominio.cnpj) {
        return true
      }

      return false
    })
  }, [todosFuncionarios])

  const totalPaginas = Math.max(1, Math.ceil(totalCondominios / itensPorPagina))

  const getFuncionariosPorCNPJ = (cnpj) => {
    return todosFuncionarios.filter((f) => {
      const cnpjCond =
        typeof f.condominio === 'object' ? f.condominio?.cnpj : f.condominio

      return cnpjCond === cnpj
    })
  }

  const Tabela = () => (
    <div className="card">
      {loadingCondominios ? (
        <div className="cfg-shimmer-table">
          <div className="cfg-shimmer-header">
            <div className="cfg-shimmer-row">
              <div className="cfg-shimmer-cell w-40">
                <div className="cfg-shimmer-line" />
              </div>
              <div className="cfg-shimmer-cell w-25">
                <div className="cfg-shimmer-line" />
              </div>
              <div className="cfg-shimmer-cell w-20">
                <div className="cfg-shimmer-line" />
              </div>
              <div className="cfg-shimmer-cell w-15">
                <div className="cfg-shimmer-line" />
              </div>
            </div>
          </div>

          <div className="cfg-shimmer-body">
            {Array.from({ length: itensPorPagina }).map((_, i) => (
              <div key={i} className="cfg-shimmer-row">
                <div className="cfg-shimmer-cell w-40">
                  <div className="cfg-shimmer-line" />
                </div>
                <div className="cfg-shimmer-cell w-25">
                  <div className="cfg-shimmer-line" />
                </div>
                <div className="cfg-shimmer-cell w-20">
                  <div className="cfg-shimmer-line" />
                </div>
                <div className="cfg-shimmer-cell w-15">
                  <div className="cfg-shimmer-line" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : erroCondominios ? (
        <div className="empty">
          <AlertCircle className="ico xl muted" />
          <p>{erroCondominios}</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Condomínio</th>

                  {podeVerAdministradora && <th>Administradora</th>}

                  <th>CNPJ</th>
                  <th>Funcionários</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {condominios.map((cond) => {
                  const funcionariosCond = getFuncionariosPorCNPJ(cond.cnpj)

                  return (
                    <tr key={cond.cnpj}>
                      <td>
                        <div className="cell-flex">
                          <Building2 className="ico brand" />

                          <div>
                            <div className="cell-title">{cond.nome}</div>
                          </div>
                        </div>
                      </td>

                      {podeVerAdministradora && (
                        <td className="muted">{getAdministradoraNome(cond)}</td>
                      )}

                      <td className="muted">{formatarCNPJ(cond.cnpj)}</td>

                      <td>
                        <button
                          className="cfg-func-count-btn"
                          onClick={() =>
                            setFuncionariosModal({
                              open: true,
                              condominio: cond,
                              funcionarios: funcionariosCond,
                            })
                          }
                        >
                          <Users className="ico" />
                          <span className="cfg-func-count">
                            {funcionariosCond.length}
                          </span>
                          <Eye className="ico sm" />
                        </button>
                      </td>

                      <td className="text-right">
                        <div className="cfg-row-actions">
                          <button
                            className="icon-btn cfg-table-action green"
                            onClick={() =>
                              setVincularModal({ open: true, condominio: cond })
                            }
                            title="Vincular funcionários"
                          >
                            <Link className="ico" />
                          </button>

                          <button
                            className="icon-btn cfg-table-action blue"
                            onClick={() => handleEditar(cond)}
                            title="Editar"
                          >
                            <Pencil className="ico" />
                          </button>

                          {isUsuarioGlobal && (
                            <button
                              className="icon-btn cfg-table-action blue"
                              onClick={() => abrirModalTaxas(cond)}
                              title="Taxas"
                            >
                              <Percent className="ico" />
                            </button>
                          )}

                          <button
                            className="icon-btn cfg-table-action red"
                            onClick={() =>
                              setColaboradorModal({
                                open: true,
                                condominio: cond,
                              })
                            }
                            title="Novo colaborador"
                          >
                            <UserPlus className="ico" />
                          </button>

                          <button
                            className="icon-btn cfg-table-action red"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                id: cond.cnpj,
                                nome: cond.nome,
                              })
                            }
                            title="Excluir"
                          >
                            <Trash2 className="ico" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {condominios.length === 0 && !loadingCondominios && (
            <div className="empty">
              <Building2 className="ico xl muted" />
              <p>
                {isUsuarioGlobal
                  ? 'Nenhum condomínio cadastrado'
                  : 'Nenhum condomínio cadastrado para esta administradora'}
              </p>
            </div>
          )}

          {totalCondominios > itensPorPagina && (
            <div className="cfg-pagination">
              <div className="cfg-pagination-info">
                Exibindo {(paginaAtual - 1) * itensPorPagina + 1}–
                {Math.min(paginaAtual * itensPorPagina, totalCondominios)} de{' '}
                {totalCondominios}
              </div>

              <div className="cfg-pagination-actions">
                <button
                  className="cfg-page-btn"
                  onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                >
                  <ChevronLeft className="ico" />
                </button>

                <span className="cfg-page-current">
                  Página {paginaAtual} de {totalPaginas}
                </span>

                <button
                  className="cfg-page-btn"
                  onClick={() =>
                    setPaginaAtual((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                >
                  <ChevronRight className="ico" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )

  const Formulario = () => (
    <div className="card pad">
      <div className="card-head">
        <h2 className="card-title">
          {editandoCnpj ? 'Editar Condomínio' : 'Novo Condomínio'}
        </h2>

        <button
          className="icon-btn"
          onClick={() => {
            resetForm()
            setModoAtivo('lista')
          }}
        >
          <X className="ico" />
        </button>
      </div>

      <div className="grid">
        <div className="grid-full section-title">
          <Building2 className="ico" />
          <span>Dados Básicos</span>
        </div>

        <div className="field">
          <label>CNPJ *</label>
          <input
            name="cnpj"
            value={formData.cnpj}
            onChange={handleInputChange}
            placeholder="00.000.000/0000-00"
            disabled={!!editandoCnpj}
          />
        </div>

        <div className="field">
          <label>Nome do Condomínio *</label>
          <input
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid-full section-title mt">
          <MapPin className="ico" />
          <span>Endereço</span>
        </div>

        <div className="field">
          <label>Endereço</label>
          <input
            name="endereco"
            value={formData.endereco}
            onChange={handleInputChange}
          />
        </div>

        <div className="field">
          <label>Número</label>
          <input
            name="numero"
            value={formData.numero}
            onChange={handleInputChange}
          />
        </div>

        <div className="field">
          <label>Complemento</label>
          <input
            name="complemento"
            value={formData.complemento}
            onChange={handleInputChange}
          />
        </div>

        <div className="field">
          <label>Bairro</label>
          <input
            name="bairro"
            value={formData.bairro}
            onChange={handleInputChange}
          />
        </div>

        <div className="field">
          <label>Cidade</label>
          <input
            name="cidade"
            value={formData.cidade}
            onChange={handleInputChange}
          />
        </div>

        <div className="field">
          <label>Estado (UF)</label>
          <input
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            maxLength={2}
          />
        </div>

        <div className="field">
          <label>CEP</label>
          <input
            name="cep"
            value={formData.cep}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="actions">
        <button
          className="btn btn-primary lg"
          onClick={handleSubmit}
          disabled={loadingAction}
        >
          <Save className="ico" />
          <span>{editandoCnpj ? 'Atualizar' : 'Cadastrar'}</span>
        </button>

        <button
          className="btn btn-light lg"
          onClick={() => {
            resetForm()
            setModoAtivo('lista')
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )

  return (
    <PageLayout
      title="Gerenciamento de Condomínios"
      subtitle="Gerencie os condomínios cadastrados na plataforma"
    >
      <div className="cfg-page">
        {modoAtivo === 'lista' && (
          <>
            <FiltroCondominios
              value={busca}
              onChange={handleBuscaChange}
              onClear={() => {
                setBusca('')
                setPaginaAtual(1)
              }}
            />

            <div className="cfg-actions">
              <button
                onClick={() => setModoAtivo('form')}
                className="btn btn-primary"
              >
                <Plus className="ico" />
                <span>Novo Condomínio</span>
              </button>

              <button onClick={carregarDados} className="btn btn-light">
                <RefreshCw className="ico" />
                <span>Atualizar</span>
              </button>
            </div>

            <Tabela />
          </>
        )}

        {modoAtivo === 'form' && <Formulario />}

        <ModalFuncionarios
          open={funcionariosModal.open}
          condominio={funcionariosModal.condominio}
          funcionarios={funcionariosModal.funcionarios}
          loading={loadingAction}
          onClose={() =>
            setFuncionariosModal({
              open: false,
              condominio: null,
              funcionarios: [],
            })
          }
          onUnlink={(func) =>
            desvincularFuncionario(funcionariosModal.condominio, func)
          }
          onOpenVincular={() => {
            const condominioSelecionado = funcionariosModal.condominio

            setFuncionariosModal({
              open: false,
              condominio: null,
              funcionarios: [],
            })

            setVincularModal({
              open: true,
              condominio: condominioSelecionado,
            })
          }}
        />

        <ModalVincularFuncionarios
          open={vincularModal.open}
          condominio={vincularModal.condominio}
          funcionariosDisponiveis={funcionariosDisponiveis}
          loading={loadingAction}
          onVincular={(funcs) =>
            vincularFuncionarios(vincularModal.condominio, funcs)
          }
          onClose={() => setVincularModal({ open: false, condominio: null })}
        />

        <ModalColaborador
          open={colaboradorModal.open}
          condominio={colaboradorModal.condominio}
          form={colaboradorForm}
          onChange={handleColaboradorChange}
          onSave={adicionarColaborador}
          onCancel={() =>
            setColaboradorModal({ open: false, condominio: null })
          }
        />

        <ModalConfirm
          open={confirm.open}
          nome={confirm.nome}
          onConfirm={handleExcluir}
          onCancel={() => setConfirm({ open: false, id: null, nome: '' })}
        />

        <ModalTaxas
          open={taxasModal.open}
          condominio={taxasModal.condominio}
          taxas={taxasModal.taxas}
          produtos={produtos}
          loading={taxasModal.loading}
          form={taxaForm}
          onChange={handleTaxaChange}
          onSave={salvarTaxa}
          onDelete={excluirTaxa}
          onClose={() =>
            setTaxasModal({ open: false, condominio: null, taxas: [], loading: false })
          }
        />

        <div className={`cfg-toast-wrap ${toast.open ? 'show' : ''}`}>
          <div
            className={`cfg-toast ${toast.type === 'danger'
                ? 'cfg-toast-danger'
                : 'cfg-toast-success'
              }`}
          >
            {toast.type === 'danger' ? (
              <Trash2 className="cfg-toast-ico" />
            ) : (
              <CheckCircle className="cfg-toast-ico" />
            )}

            <span>{toast.message}</span>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}