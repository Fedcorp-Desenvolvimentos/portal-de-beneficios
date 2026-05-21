// ConfiguracaoCondominios.jsx - Versão atualizada com relacionamento correto

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Building2,
  Plus,
  Download,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
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
  Briefcase,
  User,
  Phone,
  Mail,
  CreditCard,
  Link,
  Unlink,
} from 'lucide-react'

import { entebenService } from '../../services/entebenService'
import '../../styles/GerenciamentoCondominios.css'
import { useLoading } from '../../hooks/useLoading'


async function ensureXLSX() {
  if (window.XLSX) return window.XLSX
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
  return window.XLSX
}

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
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return cnpj
}

const formatarCPF = (cpf) => {
  if (!cpf) return '—'
  const digits = somenteDigitos(cpf)
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return cpf
}

// Modal para visualizar funcionários do condomínio
function ModalFuncionarios({ open, condominio, funcionarios, loading, onClose, onUnlink, onOpenVincular }) {
  const [busca, setBusca] = useState('')

  const funcionariosFiltrados = useMemo(() => {
    if (!busca.trim()) return funcionarios || []
    const term = normalizarTexto(busca)
    return (funcionarios || []).filter((f) => {
      const nome = normalizarTexto(f.nome || '')
      const cpf = somenteDigitos(f.cpf || '')
      const funcao = normalizarTexto(f.funcao || '')
      const matricula = normalizarTexto(f.matricula || '')
      return nome.includes(term) || cpf.includes(term) || funcao.includes(term) || matricula.includes(term)
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal cfg-funcionarios-modal" onClick={(e) => e.stopPropagation()}>
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
              <button className="cfg-clear-search" onClick={() => setBusca('')}>
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
              <p>{busca ? 'Nenhum funcionário encontrado para esta busca' : 'Nenhum funcionário vinculado'}</p>
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
                      <div className="cfg-funcionario-nome">{func.nome || '—'}</div>
                      <div className="cfg-funcionario-detalhes">
                        {func.funcao && <span className="cfg-badge-funcao">{getFuncaoLabel(func.funcao)}</span>}
                        {func.matricula && <span className="cfg-badge-matricula">Matr: {func.matricula}</span>}
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
                      <span className="cfg-field-value">{formatarCPF(func.cpf)}</span>
                    </div>
                    {func.data_nascimento && (
                      <div className="cfg-field-row">
                        <span className="cfg-field-label">Nascimento:</span>
                        <span className="cfg-field-value">
                          {new Date(func.data_nascimento).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    {func.departamento && (
                      <div className="cfg-field-row">
                        <span className="cfg-field-label">Departamento:</span>
                        <span className="cfg-field-value">{func.departamento}</span>
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

// Modal para vincular funcionários existentes
function ModalVincularFuncionarios({ open, condominio, funcionariosDisponiveis, loading, onVincular, onClose }) {
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
    setSelecionados(prev =>
      prev.find(f => f.cpf === funcionario.cpf)
        ? prev.filter(f => f.cpf !== funcionario.cpf)
        : [...prev, funcionario]
    )
  }

  const handleVincular = () => {
    onVincular(selecionados)
    setSelecionados([])
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal cfg-funcionarios-modal" onClick={(e) => e.stopPropagation()}>
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
              Disponíveis: {funcionariosDisponiveis?.length || 0} funcionário(s) sem vínculo
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
              <button className="cfg-clear-search" onClick={() => setBusca('')}>
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
              <p>{busca ? 'Nenhum funcionário encontrado' : 'Todos os funcionários já estão vinculados a algum condomínio'}</p>
            </div>
          ) : (
            <div className="cfg-funcionarios-list">
              {funcionariosFiltrados.map(func => (
                <label key={func.cpf} className="cfg-vinculo-item">
                  <input
                    type="checkbox"
                    checked={selecionados.some(f => f.cpf === func.cpf)}
                    onChange={() => toggleSelecionado(func)}
                  />
                  <div className="cfg-vinculo-info">
                    <strong>{func.nome}</strong>
                    <small>
                      CPF: {formatarCPF(func.cpf)} | 
                      Função: {func.funcao || '—'} | 
                      Matrícula: {func.matricula || '—'}
                    </small>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onClose}>Cancelar</button>
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
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal cfg-colaborador-modal" onClick={(e) => e.stopPropagation()}>
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
              <input name="nome" value={form.nome} onChange={onChange} placeholder="Digite o nome completo" />
            </div>
            <div className="field">
              <label>CPF *</label>
              <input name="cpf" value={form.cpf} onChange={onChange} placeholder="000.000.000-00" maxLength={14} />
            </div>
            <div className="field">
              <label>Matrícula</label>
              <input name="matricula" value={form.matricula} onChange={onChange} placeholder="Número da matrícula" />
            </div>
            <div className="field">
              <label>Cargo / Função</label>
              <input name="funcao" value={form.funcao} onChange={onChange} placeholder="Ex: Porteiro" />
            </div>
            <div className="field">
              <label>Data de Nascimento</label>
              <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={onChange} />
            </div>
            <div className="field">
              <label>Telefone</label>
              <input name="telefone" value={form.telefone} onChange={onChange} placeholder="(00) 00000-0000" />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input type="email" name="email" value={form.email} onChange={onChange} placeholder="email@exemplo.com" />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-light" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave}>
            <Save className="ico" />
            Salvar colaborador
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalConfirm({ open, nome, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
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
          Tem certeza que deseja excluir <strong>{nome}</strong>? Esta ação não pode ser desfeita.
        </div>
        <div className="modal-actions">
          <button className="btn btn-light" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Excluir</button>
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
        <input type="text" placeholder="Buscar condomínio por nome ou CNPJ" value={value} onChange={(e) => onChange(e.target.value)} />
        {value && (<button type="button" className="cfg-filter-clear" onClick={onClear}><X className="ico" /></button>)}
      </div>
    </div>
  )
}

export default function ConfiguracaoCondominios() {
  const { loading, startLoading, stopLoading, updateProgress } = useLoading();
  const [modoAtivo, setModoAtivo] = useState('lista')
  const [condominios, setCondominios] = useState([])
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
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [errosUpload, setErrosUpload] = useState([])
  const [confirm, setConfirm] = useState({ open: false, id: null, nome: '' })
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })
  const [busca, setBusca] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 10

  const [funcionariosModal, setFuncionariosModal] = useState({ open: false, condominio: null, funcionarios: [] })
  const [vincularModal, setVincularModal] = useState({ open: false, condominio: null })
  const [colaboradorModal, setColaboradorModal] = useState({ open: false, condominio: null })

  const [colaboradorForm, setColaboradorForm] = useState({
    nome: '', cpf: '', matricula: '', funcao: '', data_nascimento: '', telefone: '', email: ''
  })

  const toastTimer = useRef(null)

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca])

  const carregarDados = async () => {
    try {
      setLoadingCondominios(true)

      startLoading("Carregando condomínios...")

      const [condominiosRes, funcionariosRes] = await Promise.all([
        entebenService.getCondominios(),
        entebenService.getFuncionarios(),
      ])

      const condominiosList = toArray(condominiosRes)
      const funcionariosList = toArray(funcionariosRes)

      setTodosFuncionarios(funcionariosList)

      const funcionariosPorCondominio = {}

      funcionariosList.forEach(func => {
        if (func.condominio) {
          const cnpjCond =
            typeof func.condominio === 'object'
              ? func.condominio.cnpj
              : func.condominio

          if (!funcionariosPorCondominio[cnpjCond]) {
            funcionariosPorCondominio[cnpjCond] = []
          }

          funcionariosPorCondominio[cnpjCond].push(func)
        }
      })

      const condominiosComFuncionarios = condominiosList.map(cond => ({
        ...cond,
        funcionarios: funcionariosPorCondominio[cond.cnpj] || [],
      }))

      setCondominios(condominiosComFuncionarios)

      setErroCondominios('')
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setErroCondominios('Não foi possível carregar os dados.')
    } finally {
      setLoadingCondominios(false)
      stopLoading()
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ open: true, message, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast({ open: false, message: '', type: 'success' }), 2500)
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
      showToast(`${funcionariosParaVincular.length} funcionário(s) vinculado(s) com sucesso!`)
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
      setFuncionariosModal(prev => ({ ...prev, open: false }))
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
        condominio: colaboradorModal.condominio?.cnpj,
        departamento: colaboradorModal.condominio?.nome,
      }

      await entebenService.createFuncionario(novoFuncionario)
      await carregarDados()
      showToast('Colaborador adicionado com sucesso!')
      setColaboradorModal({ open: false, condominio: null })
      setColaboradorForm({ nome: '', cpf: '', matricula: '', funcao: '', data_nascimento: '', telefone: '', email: '' })
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
      if (editandoCnpj) {
        await entebenService.updateCondominio(editandoCnpj, formData)
        showToast('Condomínio atualizado com sucesso!')
      } else {
        await entebenService.createCondominio(formData)
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
      cnpj: '', nome: '', tipo_local: 'CONDOMINIO',
      endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
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
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleColaboradorChange = (e) => {
    const { name, value } = e.target
    setColaboradorForm(prev => ({ ...prev, [name]: value }))
  }

  const funcionariosDisponiveis = useMemo(() => {
    const vinculadosCnpjs = new Set()
    condominios.forEach(cond => {
      (cond.funcionarios || []).forEach(func => vinculadosCnpjs.add(func.cpf))
    })
    return todosFuncionarios.filter(func => !vinculadosCnpjs.has(func.cpf))
  }, [todosFuncionarios, condominios])

  const condominiosFiltrados = useMemo(() => {
    if (!busca.trim()) return condominios
    const term = normalizarTexto(busca)
    const digits = somenteDigitos(busca)
    return condominios.filter(c => {
      const nome = normalizarTexto(c.nome)
      const cnpj = somenteDigitos(c.cnpj)
      return nome.includes(term) || (digits && cnpj.includes(digits))
    })
  }, [busca, condominios])

  const totalPaginas = Math.max(1, Math.ceil(condominiosFiltrados.length / itensPorPagina))
  const condominiosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    return condominiosFiltrados.slice(inicio, inicio + itensPorPagina)
  }, [condominiosFiltrados, paginaAtual])

  const Tabela = () => (
    <div className="card">
      {loadingCondominios ? (
        <div className="empty">
          <div className='empty-wrapper'>
            <div className="spinner" />
            <p>Carregando condomínios...</p>
          </div>
        </div>
      ) : erroCondominios ? (
        <div className="empty"><AlertCircle className="ico xl muted" /><p>{erroCondominios}</p></div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Condomínio</th><th>CNPJ</th><th>Funcionários</th><th className="text-right">Ações</th></tr>
              </thead>
              <tbody>
                {condominiosPaginados.map((cond) => (
                  <tr key={cond.cnpj}>
                    <td><div className="cell-flex"><Building2 className="ico brand" /><div><div className="cell-title">{cond.nome}</div></div></div></td>
                    <td className="muted">{formatarCNPJ(cond.cnpj)}</td>
                    <td>
                      <button className="cfg-func-count-btn" onClick={() => setFuncionariosModal({ open: true, condominio: cond, funcionarios: cond.funcionarios || [] })}>
                        <Users className="ico" /><span className="cfg-func-count">{(cond.funcionarios || []).length}</span><Eye className="ico sm" />
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="cfg-row-actions">
                        <button className="icon-btn cfg-table-action green" onClick={() => setVincularModal({ open: true, condominio: cond })} title="Vincular funcionários"><Link className="ico" /></button>
                        <button className="icon-btn cfg-table-action blue" onClick={() => handleEditar(cond)} title="Editar"><Pencil className="ico" /></button>
                        <button className="icon-btn cfg-table-action red" onClick={() => setColaboradorModal({ open: true, condominio: cond })} title="Novo colaborador"><UserPlus className="ico" /></button>
                        <button className="icon-btn cfg-table-action red" onClick={() => setConfirm({ open: true, id: cond.cnpj, nome: cond.nome })} title="Excluir"><Trash2 className="ico" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {condominios.length === 0 && <div className="empty"><Building2 className="ico xl muted" /><p>Nenhum condomínio cadastrado</p></div>}
          {condominios.length > 0 && condominiosFiltrados.length === 0 && <div className="empty"><Building2 className="ico xl muted" /><p>Nenhum condomínio encontrado</p></div>}
          {condominiosFiltrados.length > itensPorPagina && (
            <div className="cfg-pagination">
              <div className="cfg-pagination-info">Exibindo {(paginaAtual-1)*itensPorPagina+1}–{Math.min(paginaAtual*itensPorPagina, condominiosFiltrados.length)} de {condominiosFiltrados.length}</div>
              <div className="cfg-pagination-actions">
                <button className="cfg-page-btn" onClick={() => setPaginaAtual(p => Math.max(1, p-1))} disabled={paginaAtual === 1}><ChevronLeft className="ico" /></button>
                <span className="cfg-page-current">Página {paginaAtual} de {totalPaginas}</span>
                <button className="cfg-page-btn" onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p+1))} disabled={paginaAtual === totalPaginas}><ChevronRight className="ico" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )

  const Formulario = () => (
    <div className="card pad">
      <div className="card-head"><h2 className="card-title">{editandoCnpj ? 'Editar Condomínio' : 'Novo Condomínio'}</h2>
        <button className="icon-btn" onClick={() => { resetForm(); setModoAtivo('lista') }}><X className="ico" /></button>
      </div>
      <div className="grid">
        <div className="grid-full section-title"><Building2 className="ico" /><span>Dados Básicos</span></div>
        <div className="field"><label>CNPJ *</label><input name="cnpj" value={formData.cnpj} onChange={handleInputChange} placeholder="00.000.000/0000-00" disabled={!!editandoCnpj} /></div>
        <div className="field"><label>Nome do Condomínio *</label><input name="nome" value={formData.nome} onChange={handleInputChange} /></div>
        <div className="grid-full section-title mt"><MapPin className="ico" /><span>Endereço</span></div>
        <div className="field"><label>Endereço</label><input name="endereco" value={formData.endereco} onChange={handleInputChange} /></div>
        <div className="field"><label>Número</label><input name="numero" value={formData.numero} onChange={handleInputChange} /></div>
        <div className="field"><label>Complemento</label><input name="complemento" value={formData.complemento} onChange={handleInputChange} /></div>
        <div className="field"><label>Bairro</label><input name="bairro" value={formData.bairro} onChange={handleInputChange} /></div>
        <div className="field"><label>Cidade</label><input name="cidade" value={formData.cidade} onChange={handleInputChange} /></div>
        <div className="field"><label>Estado (UF)</label><input name="estado" value={formData.estado} onChange={handleInputChange} maxLength={2} /></div>
        <div className="field"><label>CEP</label><input name="cep" value={formData.cep} onChange={handleInputChange} /></div>
      </div>
      <div className="actions">
        <button className="btn btn-primary lg" onClick={handleSubmit} disabled={loadingAction}><Save className="ico" /><span>{editandoCnpj ? 'Atualizar' : 'Cadastrar'}</span></button>
        <button className="btn btn-light lg" onClick={() => { resetForm(); setModoAtivo('lista') }}>Cancelar</button>
      </div>
    </div>
  )

  return (
    <div className="cfg-page">
      {modoAtivo === 'lista' && (
        <>
          <div className="cfg-header"><h1>Gerenciamento de Condomínios</h1><p>Gerencie os condomínios cadastrados na plataforma</p></div>
          <FiltroCondominios value={busca} onChange={setBusca} onClear={() => setBusca('')} />
          <div className="cfg-actions">
            <button onClick={() => setModoAtivo('form')} className="btn btn-primary"><Plus className="ico" /><span>Novo Condomínio</span></button>
            <button onClick={carregarDados} className="btn btn-light"><RefreshCw className="ico" /><span>Atualizar</span></button>
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
        onClose={() => setFuncionariosModal({ open: false, condominio: null, funcionarios: [] })}
        onUnlink={(func) => desvincularFuncionario(funcionariosModal.condominio, func)}
        onOpenVincular={() => setVincularModal({ open: true, condominio: funcionariosModal.condominio })}
      />

      <ModalVincularFuncionarios
        open={vincularModal.open}
        condominio={vincularModal.condominio}
        funcionariosDisponiveis={funcionariosDisponiveis}
        loading={loadingAction}
        onVincular={(funcs) => vincularFuncionarios(vincularModal.condominio, funcs)}
        onClose={() => setVincularModal({ open: false, condominio: null })}
      />

      <ModalColaborador
        open={colaboradorModal.open}
        condominio={colaboradorModal.condominio}
        form={colaboradorForm}
        onChange={handleColaboradorChange}
        onSave={adicionarColaborador}
        onCancel={() => setColaboradorModal({ open: false, condominio: null })}
      />

      <ModalConfirm open={confirm.open} nome={confirm.nome} onConfirm={handleExcluir} onCancel={() => setConfirm({ open: false, id: null, nome: '' })} />

      <div className={`cfg-toast-wrap ${toast.open ? 'show' : ''}`}>
        <div className={`cfg-toast ${toast.type === 'danger' ? 'cfg-toast-danger' : 'cfg-toast-success'}`}>
          {toast.type === 'danger' ? <Trash2 className="cfg-toast-ico" /> : <CheckCircle className="cfg-toast-ico" />}
          <span>{toast.message}</span>
        </div>
      </div>
    </div>
  )
}