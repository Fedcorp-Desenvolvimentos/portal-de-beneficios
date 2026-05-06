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
} from 'lucide-react'

import { entebenService } from '../../services/entebenService'
import '../../styles/GerenciamentoCondominios.css'

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

const getBeneficioLabel = (beneficio) =>
  beneficio?.nome ||
  beneficio?.descricao ||
  beneficio?.tipo ||
  beneficio?.beneficio ||
  beneficio?.produto ||
  String(beneficio || '')

const getBeneficioValue = (beneficio) =>
  beneficio?.id ||
  beneficio?.codigo ||
  beneficio?.nome ||
  beneficio?.descricao ||
  String(beneficio || '')

const getBeneficiosCondominio = (condominio, beneficios = []) => {
  const beneficiosDoCadastro =
    condominio?.beneficios ||
    condominio?.beneficios_cadastrados ||
    condominio?.beneficiosContratados ||
    condominio?.beneficios_contratados ||
    condominio?.planos ||
    condominio?.produtos ||
    []

  if (Array.isArray(beneficiosDoCadastro) && beneficiosDoCadastro.length > 0) {
    return beneficiosDoCadastro
  }

  const condId = String(condominio?.id || '')
  const condCnpj = somenteDigitos(condominio?.cnpj)

  return beneficios.filter((beneficio) => {
    const beneficioCondId =
      beneficio?.condominio_id ||
      beneficio?.condominio?.id ||
      beneficio?.condominio

    const beneficioCondCnpj =
      somenteDigitos(beneficio?.condominio_cnpj) ||
      somenteDigitos(beneficio?.cnpj_condominio) ||
      somenteDigitos(beneficio?.condominio?.cnpj) ||
      somenteDigitos(beneficio?.condominio?.documento)

    return (
      String(beneficioCondId || '') === condId ||
      Boolean(condCnpj && beneficioCondCnpj === condCnpj)
    )
  })
}

const normalizarCondominio = (cond) => ({
  id: cond?.id,

  nome:
    cond?.nome ||
    cond?.condominio ||
    cond?.razao_social ||
    cond?.fantasia ||
    cond?.nome_condominio ||
    `Condomínio #${cond?.id}`,

  cnpj:
    cond?.cnpj ||
    cond?.cnpj_condominio ||
    cond?.documento ||
    cond?.cgc ||
    '',

  endereco:
    cond?.endereco ||
    cond?.logradouro ||
    cond?.endereco_completo ||
    [cond?.rua, cond?.numero, cond?.bairro].filter(Boolean).join(', '),

  bairro: cond?.bairro || '',
  cidade: cond?.cidade || '',
  estado: cond?.estado || cond?.uf || '',
  cep: cond?.cep || '',
  telefone: cond?.telefone || cond?.contato || '',
  email: cond?.email || '',

  responsavel:
    cond?.responsavel ||
    cond?.sindico ||
    cond?.gerente ||
    cond?.administradora_nome ||
    '',

  beneficios:
    cond?.beneficios ||
    cond?.beneficios_cadastrados ||
    cond?.beneficiosContratados ||
    cond?.beneficios_contratados ||
    cond?.planos ||
    cond?.produtos ||
    [],

  qtdFuncionarios:
    cond?.qtdFuncionarios ??
    cond?.quantidade_funcionarios ??
    cond?.total_funcionarios ??
    cond?.qtd_funcionarios ??
    cond?.funcionarios_count ??
    cond?.total_colaboradores ??
    cond?.quantidade_colaboradores ??
    cond?.colaboradores_count ??
    cond?.total_beneficiarios ??
    cond?.quantidade_beneficiarios ??
    cond?.beneficiarios_count ??
    cond?.funcionarios?.length ??
    cond?.colaboradores?.length ??
    cond?.beneficiarios?.length ??
    0,

  tipoRecebimento:
    cond?.tipoRecebimento ||
    cond?.tipo_recebimento ||
    cond?.recebimento_cartao ||
    'condominio',

  enderecoRecebimento:
    cond?.enderecoRecebimento ||
    cond?.endereco_recebimento ||
    cond?.endereco_administradora ||
    '',

  ativo: cond?.ativo ?? cond?.is_active ?? cond?.status !== 'Inativo',
})

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
            title="Limpar busca"
            aria-label="Limpar busca"
          >
            <X className="ico" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function ConfiguracaoCondominios() {
  const [modoAtivo, setModoAtivo] = useState('lista')
  const [condominios, setCondominios] = useState([])
  const [beneficios, setBeneficios] = useState([])
  const [loadingCondominios, setLoadingCondominios] = useState(true)
  const [erroCondominios, setErroCondominios] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    responsavel: '',
    qtdFuncionarios: '',
    tipoRecebimento: 'condominio',
    enderecoRecebimento: '',
    ativo: true,
  })

  const [editandoId, setEditandoId] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [errosUpload, setErrosUpload] = useState([])
  const [confirm, setConfirm] = useState({ open: false, id: null, nome: '' })
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })
  const [busca, setBusca] = useState('')

  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 10

  const [colaboradorModal, setColaboradorModal] = useState({
    open: false,
    condominio: null,
  })

  const [colaboradorForm, setColaboradorForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: '',
    beneficio: '',
  })

  const toastTimer = useRef(null)

  useEffect(() => {
    carregarCondominios()
  }, [])

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca])

  async function carregarCondominios() {
    try {
      setLoadingCondominios(true)
      setErroCondominios('')

      const [condominiosData, funcionariosData, beneficiosData] = await Promise.all([
        entebenService.getcondominios(),
        entebenService.getFuncionarios(),
        entebenService.getBeneficios(),
      ])

      const condominiosRaw = toArray(condominiosData)
      const funcionariosRaw = toArray(funcionariosData)
      const beneficiosRaw = toArray(beneficiosData)

      setBeneficios(beneficiosRaw)

      const funcionariosPorCondominio = funcionariosRaw.reduce((acc, funcionario) => {
        const condId =
          funcionario?.condominio_id ||
          funcionario?.condominio?.id ||
          (typeof funcionario?.condominio === 'number' ||
          typeof funcionario?.condominio === 'string'
            ? funcionario.condominio
            : null)

        const cnpj =
          somenteDigitos(funcionario?.condominio_cnpj) ||
          somenteDigitos(funcionario?.cnpj_condominio) ||
          somenteDigitos(funcionario?.condominio?.cnpj) ||
          somenteDigitos(funcionario?.condominio?.documento) ||
          somenteDigitos(funcionario?.cnpj)

        const nome =
          funcionario?.condominio_nome ||
          funcionario?.nome_condominio ||
          funcionario?.condominio?.nome ||
          funcionario?.condominio?.razao_social ||
          ''

        const chaveId = condId ? String(condId) : ''
        const chaveCnpj = cnpj
        const chaveNome = normalizarTexto(nome)

        if (chaveId) acc[chaveId] = (acc[chaveId] || 0) + 1
        if (chaveCnpj) acc[chaveCnpj] = (acc[chaveCnpj] || 0) + 1
        if (chaveNome) acc[chaveNome] = (acc[chaveNome] || 0) + 1

        return acc
      }, {})

      const lista = condominiosRaw.map((condominio) => {
        const condNormalizado = normalizarCondominio(condominio)

        const chaveId = String(condNormalizado.id || '')
        const chaveCnpj = somenteDigitos(condNormalizado.cnpj)
        const chaveNome = normalizarTexto(condNormalizado.nome)

        return {
          ...condNormalizado,
          qtdFuncionarios:
            funcionariosPorCondominio[chaveId] ||
            funcionariosPorCondominio[chaveCnpj] ||
            funcionariosPorCondominio[chaveNome] ||
            condNormalizado.qtdFuncionarios ||
            0,
        }
      })

      setCondominios(lista)
    } catch (err) {
      console.error('Erro ao carregar condomínios:', err)
      setErroCondominios('Não foi possível carregar os condomínios cadastrados.')
    } finally {
      setLoadingCondominios(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ open: true, message, type })

    if (toastTimer.current) clearTimeout(toastTimer.current)

    toastTimer.current = setTimeout(
      () => setToast({ open: false, message: '', type: 'success' }),
      2500
    )
  }

  const condominiosFiltrados = useMemo(() => {
    if (!busca.trim()) return condominios

    const term = normalizarTexto(busca)
    const digits = somenteDigitos(busca)

    return condominios.filter((c) => {
      const nome = normalizarTexto(c.nome)
      const cnpj = somenteDigitos(c.cnpj)

      return nome.includes(term) || (digits && cnpj.includes(digits))
    })
  }, [busca, condominios])

  const totalPaginas = Math.max(
    1,
    Math.ceil(condominiosFiltrados.length / itensPorPagina)
  )

  const condominiosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    return condominiosFiltrados.slice(inicio, inicio + itensPorPagina)
  }, [condominiosFiltrados, paginaAtual])

  const inicioExibicao =
    condominiosFiltrados.length === 0
      ? 0
      : (paginaAtual - 1) * itensPorPagina + 1

  const fimExibicao = Math.min(
    paginaAtual * itensPorPagina,
    condominiosFiltrados.length
  )

  const irParaPaginaAnterior = () => {
    setPaginaAtual((prev) => Math.max(1, prev - 1))
  }

  const irParaProximaPagina = () => {
    setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      cnpj: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      responsavel: '',
      qtdFuncionarios: '',
      tipoRecebimento: 'condominio',
      enderecoRecebimento: '',
      ativo: true,
    })

    setEditandoId(null)
  }

  const handleSubmit = () => {
    const payload = {
      ...formData,
      enderecoRecebimento:
        formData.tipoRecebimento === 'condominio'
          ? formData.endereco
          : formData.enderecoRecebimento,
      qtdFuncionarios: parseInt(formData.qtdFuncionarios, 10) || 0,
    }

    if (editandoId) {
      setCondominios((prev) =>
        prev.map((c) =>
          c.id === editandoId
            ? {
                ...payload,
                id: editandoId,
              }
            : c
        )
      )

      showToast('Cadastro atualizado com sucesso')
    } else {
      const novoCondominio = {
        ...payload,
        id: Date.now(),
      }

      setCondominios((prev) => [...prev, novoCondominio])
      showToast('Cadastro realizado com sucesso')
    }

    resetForm()
    setModoAtivo('lista')
  }

  const handleEditar = (condominio) => {
    setFormData({
      ...condominio,
      tipoRecebimento: condominio.tipoRecebimento || 'condominio',
      enderecoRecebimento: condominio.enderecoRecebimento || '',
    })

    setEditandoId(condominio.id)
    setModoAtivo('form')
  }

  const handleAdicionarColaborador = (condominio) => {
    setColaboradorModal({
      open: true,
      condominio,
    })

    setColaboradorForm({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cargo: '',
      beneficio: '',
    })
  }

  const fecharModalColaborador = () => {
    setColaboradorModal({
      open: false,
      condominio: null,
    })

    setColaboradorForm({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cargo: '',
      beneficio: '',
    })
  }

  const handleColaboradorChange = (e) => {
    const { name, value } = e.target

    setColaboradorForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const salvarColaborador = () => {
    if (!colaboradorForm.nome.trim()) {
      showToast('Informe o nome do colaborador', 'danger')
      return
    }

    if (!colaboradorForm.beneficio) {
      showToast('Selecione o benefício do colaborador', 'danger')
      return
    }

    const beneficioSelecionado = getBeneficiosCondominio(
      colaboradorModal.condominio,
      beneficios
    ).find(
      (beneficio) =>
        String(getBeneficioValue(beneficio)) === String(colaboradorForm.beneficio)
    )

    const novoColaborador = {
      ...colaboradorForm,
      beneficioNome: getBeneficioLabel(beneficioSelecionado),
      id: Date.now(),
      condominioId: colaboradorModal.condominio?.id,
      condominioNome: colaboradorModal.condominio?.nome,
    }

    console.log('COLABORADOR PARA CADASTRAR:', novoColaborador)

    setCondominios((prev) =>
      prev.map((cond) =>
        cond.id === colaboradorModal.condominio?.id
          ? {
              ...cond,
              qtdFuncionarios: Number(cond.qtdFuncionarios || 0) + 1,
              funcionarios: [...toArray(cond.funcionarios), novoColaborador],
            }
          : cond
      )
    )

    showToast('Colaborador adicionado com sucesso')
    fecharModalColaborador()
  }

  const solicitarExcluir = (cond) =>
    setConfirm({ open: true, id: cond.id, nome: cond.nome })

  const confirmarExclusao = () => {
    setCondominios((prev) => prev.filter((c) => c.id !== confirm.id))
    setConfirm({ open: false, id: null, nome: '' })
    showToast('Condomínio excluído com sucesso', 'danger')
  }

  const cancelarExclusao = () =>
    setConfirm({ open: false, id: null, nome: '' })

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      setUploadStatus('error')
      setErrosUpload(['Formato de arquivo inválido. Use CSV ou XLSX.'])
      return
    }

    setUploadedFile(file)
    setUploadStatus('processing')
    setErrosUpload([])

    setTimeout(() => {
      setUploadStatus('success')

      setTimeout(() => {
        setModoAtivo('lista')
        setUploadStatus(null)
        setUploadedFile(null)
      }, 2000)
    }, 2000)
  }

  const downloadModelo = async () => {
    const XLSX = await ensureXLSX()

    const dados = [
      [
        'Nome',
        'CNPJ',
        'Endereco',
        'Bairro',
        'Cidade',
        'Estado',
        'CEP',
        'Telefone',
        'Email',
        'Responsavel',
        'QtdFuncionarios',
        'RecebimentoCartao',
        'EnderecoRecebimento',
        'Ativo',
        'Funcionarios',
      ],
    ]

    const ws = XLSX.utils.aoa_to_sheet(dados)
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, 'Modelo')
    XLSX.writeFile(wb, 'modelo_condominios.xlsx')
  }

  const ModalColaborador = ({ open, condominio, form, onChange, onSave, onCancel }) => {
    if (!open) return null

    const beneficiosDoCondominio = getBeneficiosCondominio(condominio, beneficios)

    return (
      <div className="modal-backdrop">
        <div className="modal cfg-colaborador-modal">
          <div className="modal-head">
            <div className="modal-title">
              <UserPlus className="ico brand" />
              <h3>Adicionar colaborador</h3>
            </div>

            <button
              className="icon-btn"
              onClick={onCancel}
              title="Fechar"
              aria-label="Fechar"
            >
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
                <label>CPF</label>
                <input
                  name="cpf"
                  value={form.cpf}
                  onChange={onChange}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="field">
                <label>Cargo</label>
                <input
                  name="cargo"
                  value={form.cargo}
                  onChange={onChange}
                  placeholder="Ex: Porteiro"
                />
              </div>

              <div className="field">
                <label>Benefício *</label>
                <select name="beneficio" value={form.beneficio} onChange={onChange}>
                  <option value="">Selecione um benefício...</option>

                  {beneficiosDoCondominio.map((beneficio) => (
                    <option
                      key={getBeneficioValue(beneficio)}
                      value={getBeneficioValue(beneficio)}
                    >
                      {getBeneficioLabel(beneficio)}
                    </option>
                  ))}
                </select>
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

  const ModalConfirm = ({ open, nome, onConfirm, onCancel }) => {
    if (!open) return null

    return (
      <div className="modal-backdrop">
        <div className="modal">
          <div className="modal-head">
            <div className="modal-title">
              <Trash2 className="ico danger" />
              <h3>Excluir condomínio</h3>
            </div>

            <button
              className="icon-btn"
              onClick={onCancel}
              title="Fechar"
              aria-label="Fechar"
            >
              <X className="ico" />
            </button>
          </div>

          <div className="modal-body">
            Tem certeza que deseja excluir <strong>{nome}</strong>? Esta ação não pode
            ser desfeita.
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

  const ListaAcoes = () => (
    <div className="cfg-actions">
      <button
        onClick={() => setModoAtivo('form')}
        className="btn btn-primary cfg-action-icon"
        title="Novo Condomínio"
        aria-label="Novo Condomínio"
      >
        <Plus className="ico" />
        <span>Novo Condomínio</span>
      </button>

      <button
        onClick={carregarCondominios}
        className="btn btn-light cfg-action-icon"
        title="Atualizar"
        aria-label="Atualizar"
      >
        <RefreshCw className="ico" />
        <span>Atualizar</span>
      </button>
    </div>
  )

  const Paginacao = () => {
    if (condominiosFiltrados.length <= itensPorPagina) return null

    return (
      <div className="cfg-pagination">
        <div className="cfg-pagination-info">
          Exibindo {inicioExibicao}–{fimExibicao} de {condominiosFiltrados.length}
        </div>

        <div className="cfg-pagination-actions">
          <button
            type="button"
            className="cfg-page-btn"
            onClick={irParaPaginaAnterior}
            disabled={paginaAtual === 1}
            title="Página anterior"
            aria-label="Página anterior"
          >
            <ChevronLeft className="ico" />
          </button>

          <span className="cfg-page-current">
            Página {paginaAtual} de {totalPaginas}
          </span>

          <button
            type="button"
            className="cfg-page-btn"
            onClick={irParaProximaPagina}
            disabled={paginaAtual === totalPaginas}
            title="Próxima página"
            aria-label="Próxima página"
          >
            <ChevronRight className="ico" />
          </button>
        </div>
      </div>
    )
  }

  const Tabela = () => (
    <div className="card">
      {loadingCondominios ? (
        <div className="empty">
          <Building2 className="ico xl muted" />
          <p>Carregando condomínios...</p>
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
                  <th>CNPJ</th>
                  <th>Funcionários</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>

              <tbody>
                {condominiosPaginados.map((cond) => (
                  <tr key={cond.id}>
                    <td>
                      <div className="cell-flex">
                        <Building2 className="ico brand" />

                        <div>
                          <div className="cell-title">{cond.nome}</div>
                        </div>
                      </div>
                    </td>

                    <td className="muted">{cond.cnpj || '—'}</td>

                    <td className="muted">{cond.qtdFuncionarios}</td>

                    <td>
                      <span className={'pill ' + (cond.ativo ? 'pill-green' : 'pill-red')}>
                        {cond.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td className="text-right">
                      <div className="cfg-row-actions">
                        <button
                          type="button"
                          className="icon-btn cfg-table-action green"
                          onClick={() => handleAdicionarColaborador(cond)}
                          title="Adicionar colaborador"
                          aria-label={`Adicionar colaborador em ${cond.nome}`}
                        >
                          <UserPlus className="ico" />
                        </button>

                        <button
                          type="button"
                          className="icon-btn cfg-table-action blue"
                          onClick={() => handleEditar(cond)}
                          title="Editar"
                          aria-label={`Editar ${cond.nome}`}
                        >
                          <Pencil className="ico" />
                        </button>

                        <button
                          type="button"
                          className="icon-btn cfg-table-action red"
                          onClick={() => solicitarExcluir(cond)}
                          title="Excluir"
                          aria-label={`Excluir ${cond.nome}`}
                        >
                          <Trash2 className="ico" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {condominios.length === 0 && (
            <div className="empty">
              <Building2 className="ico xl muted" />
              <p>Nenhum condomínio cadastrado</p>
            </div>
          )}

          {condominios.length > 0 && condominiosFiltrados.length === 0 && (
            <div className="empty">
              <Building2 className="ico xl muted" />
              <p>Nenhum condomínio encontrado para a busca</p>
            </div>
          )}

          <Paginacao />
        </>
      )}
    </div>
  )

  const Formulario = () => (
    <div className="card pad">
      <div className="card-head">
        <h2 className="card-title">
          {editandoId ? 'Editar Condomínio' : 'Novo Condomínio'}
        </h2>

        <button
          className="icon-btn"
          onClick={() => {
            resetForm()
            setModoAtivo('lista')
          }}
          title="Fechar"
          aria-label="Fechar"
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
          <label>Nome do Condomínio *</label>
          <input name="nome" value={formData.nome} onChange={handleInputChange} />
        </div>

        <div className="field">
          <label>CNPJ *</label>
          <input name="cnpj" value={formData.cnpj} onChange={handleInputChange} />
        </div>

        <div className="grid-full section-title mt">
          <MapPin className="ico" />
          <span>Endereço</span>
        </div>

        <div className="field grid-full">
          <label>Endereço Completo *</label>
          <input name="endereco" value={formData.endereco} onChange={handleInputChange} />
        </div>

        <div className="field">
          <label>Bairro *</label>
          <input name="bairro" value={formData.bairro} onChange={handleInputChange} />
        </div>

        <div className="field">
          <label>CEP *</label>
          <input name="cep" value={formData.cep} onChange={handleInputChange} />
        </div>

        <div className="field">
          <label>Cidade *</label>
          <input name="cidade" value={formData.cidade} onChange={handleInputChange} />
        </div>

        <div className="field">
          <label>Estado *</label>
          <select name="estado" value={formData.estado} onChange={handleInputChange}>
            <option value="">Selecione...</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="SP">São Paulo</option>
            <option value="MG">Minas Gerais</option>
            <option value="ES">Espírito Santo</option>
          </select>
        </div>

        <div className="field">
          <label>Telefone *</label>
          <input name="telefone" value={formData.telefone} onChange={handleInputChange} />
        </div>

        <div className="field">
          <label>E-mail *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid-full section-title mt">
          <MapPin className="ico" />
          <span>Recebimento do Cartão</span>
        </div>

        <div className="grid-full card pad cfg-card-recebimento">
          <div className="cfg-radio-group">
            <label className="cfg-radio">
              <input
                type="radio"
                name="tipoRecebimento"
                value="condominio"
                checked={formData.tipoRecebimento === 'condominio'}
                onChange={handleInputChange}
              />
              <span>Endereço do condomínio</span>
            </label>

            <label className="cfg-radio">
              <input
                type="radio"
                name="tipoRecebimento"
                value="administradora"
                checked={formData.tipoRecebimento === 'administradora'}
                onChange={handleInputChange}
              />
              <span>Endereço da administradora</span>
            </label>
          </div>

          {formData.tipoRecebimento === 'administradora' && (
            <div className="field grid-full">
              <label>Endereço da administradora *</label>
              <input
                name="enderecoRecebimento"
                value={formData.enderecoRecebimento}
                onChange={handleInputChange}
                placeholder="Digite o endereço da administradora"
              />
            </div>
          )}

          {formData.tipoRecebimento === 'condominio' && (
            <div className="cfg-info-box">
              Será utilizado automaticamente o endereço do condomínio informado acima.
            </div>
          )}
        </div>

        <div className="grid-full section-title mt">
          <Users className="ico" />
          <span>Informações Adicionais</span>
        </div>

        <div className="field">
          <label>Responsável *</label>
          <input
            name="responsavel"
            value={formData.responsavel}
            onChange={handleInputChange}
          />
        </div>

        <div className="field">
          <label>Quantidade de Funcionários *</label>
          <input
            type="number"
            min="0"
            name="qtdFuncionarios"
            value={formData.qtdFuncionarios}
            onChange={handleInputChange}
          />
        </div>

        <div className="grid-full">
          <label className="check">
            <input
              type="checkbox"
              name="ativo"
              checked={formData.ativo}
              onChange={handleInputChange}
            />
            <span>Condomínio ativo</span>
          </label>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-primary lg" onClick={handleSubmit}>
          <Save className="ico" />
          <span>{editandoId ? 'Atualizar' : 'Cadastrar'}</span>
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

  const UploadPlanilha = () => (
    <div className="card pad">
      <div className="card-head">
        <h2 className="card-title">Importar Condomínios</h2>

        <button
          className="icon-btn"
          onClick={() => {
            setModoAtivo('lista')
            setUploadStatus(null)
            setUploadedFile(null)
          }}
          title="Fechar"
          aria-label="Fechar"
        >
          <X className="ico" />
        </button>
      </div>

      <div className="tips">
        <h3>Instruções:</h3>
        <ol>
          <li>Baixe o modelo de planilha</li>
          <li>Preencha os dados seguindo o formato</li>
          <li>Salve em CSV ou XLSX</li>
          <li>Faça o upload do arquivo</li>
        </ol>

        <button className="btn btn-dark" onClick={downloadModelo}>
          <Download className="ico" />
          <span>Baixar Modelo de Planilha</span>
        </button>
      </div>

      <div className="drop">
        <input
          id="planilha-upload"
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileUpload}
        />

        <label htmlFor="planilha-upload" className="drop-area">
          <FileSpreadsheet className="ico xl" />
          <p className="drop-title">Clique para selecionar a planilha</p>
          <p className="drop-sub">Arquivos CSV ou XLSX (máx. 10MB)</p>
        </label>
      </div>

      {uploadStatus && (
        <div className={'alert ' + uploadStatus}>
          {uploadStatus === 'success' && <CheckCircle className="ico" />}
          {uploadStatus === 'error' && <AlertCircle className="ico" />}
          {uploadStatus === 'processing' && <span className="spinner" />}

          <div className="alert-text">
            <p className="alert-title">
              {uploadStatus === 'success'
                ? 'Condomínios importados com sucesso!'
                : uploadStatus === 'error'
                  ? 'Erro ao processar arquivo'
                  : 'Processando planilha...'}
            </p>

            {uploadedFile && <p className="alert-file">{uploadedFile.name}</p>}
          </div>
        </div>
      )}

      {errosUpload.length > 0 && (
        <div className="errors">
          <p className="errors-title">Erros encontrados:</p>

          <ul>
            {errosUpload.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  return (
    <div className="cfg-page">
      {modoAtivo === 'lista' && (
        <>
          <div className="cfg-header">
            <h1>Gerenciamento de Condomínios</h1>
            <p>Gerencie os condomínios cadastrados na plataforma</p>
          </div>

          <FiltroCondominios
            value={busca}
            onChange={setBusca}
            onClear={() => setBusca('')}
          />

          <ListaAcoes />
          <Tabela />
        </>
      )}

      {modoAtivo === 'form' && <Formulario />}
      {modoAtivo === 'upload' && <UploadPlanilha />}

      <ModalConfirm
        open={confirm.open}
        nome={confirm.nome}
        onConfirm={confirmarExclusao}
        onCancel={cancelarExclusao}
      />

      <ModalColaborador
        open={colaboradorModal.open}
        condominio={colaboradorModal.condominio}
        form={colaboradorForm}
        onChange={handleColaboradorChange}
        onSave={salvarColaborador}
        onCancel={fecharModalColaborador}
      />

      <div
        className={`cfg-toast-wrap ${toast.open ? 'show' : ''}`}
        role="status"
        aria-live="polite"
      >
        <div
          className={`cfg-toast ${
            toast.type === 'danger' ? 'cfg-toast-danger' : 'cfg-toast-success'
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
  )
}