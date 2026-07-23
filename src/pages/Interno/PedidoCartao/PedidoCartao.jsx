import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { pedidoCartaoService } from '../../../services/pedidoCartaoService'
import { entebenService } from '../../../services/entebenService'
import PageLayout from '../../../Layouts/PageLayout/PageLayout'
import './PedidoCartao.css'

const PRODUTOS = [
  { value: 'VR', label: 'VR Benefícios' },
  { value: 'VA', label: 'Vale Alimentação' },
  { value: 'AUTO', label: 'Auto / Mobilidade' },
  { value: 'MULTI', label: 'Multi Benefícios' },
]

const fmtMoney = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const fmtDate = (s) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}

const STATUS_BADGE = {
  PENDENTE: 'pendente',
  EM_ANALISE: 'analise',
  APROVADO: 'aprovado',
  ENVIADO: 'enviado',
  RECUSADO: 'recusado',
  CANCELADO: 'cancelado',
}

const INITIAL_FORM = {
  tipo_pedido: 'NOVO',
  nome_completo: '',
  cpf: '',
  data_nascimento: '',
  produto: 'VR',
  nome_condominio: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  valor: '',
  observacao: '',
}

export default function PedidoCartao() {
  const { user } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [condominios, setCondominios] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [showForm, setShowForm] = useState(false)
  const [condominioCnpj, setCondominioCnpj] = useState('')

  const carregarPedidos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await pedidoCartaoService.listarMeus()
      setPedidos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const carregarCondominios = useCallback(async () => {
    try {
      const data = await entebenService.getcondominios()
      setCondominios(Array.isArray(data) ? data : data?.results || [])
    } catch (error) {
      console.error('Erro ao carregar condomínios:', error)
    }
  }, [])

  useEffect(() => {
    carregarPedidos()
    carregarCondominios()
  }, [carregarPedidos, carregarCondominios])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCondominioChange = (e) => {
    const cnpj = e.target.value
    setCondominioCnpj(cnpj)
    const condo = condominios.find((c) => c.cnpj === cnpj)
    if (condo) {
      setForm((prev) => ({
        ...prev,
        nome_condominio: condo.nome || '',
        cep: condo.cep || '',
        logradouro: condo.endereco || '',
        numero: condo.numero || '',
        complemento: condo.complemento || '',
        bairro: condo.bairro || '',
        cidade: condo.cidade || '',
        estado: condo.estado || '',
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        nome_condominio: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
      }))
    }
  }

  const formatCpf = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  const formatCep = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    return digits.replace(/(\d{5})(\d{1,3})$/, '$1-$2')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await pedidoCartaoService.criar({
        ...form,
        cpf: form.cpf.replace(/\D/g, ''),
        cep: form.cep.replace(/\D/g, ''),
        valor: form.valor ? parseFloat(form.valor) : null,
      })
      setForm(INITIAL_FORM)
      setCondominioCnpj('')
      setShowForm(false)
      await carregarPedidos()
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout title="Pedidos de Cartão" subtitle="Solicite cartões novos ou segunda via">
      <div className="pc-container">
        <div className="pc-header">
          <button className="pc-btn-novo" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Novo Pedido'}
          </button>
        </div>

        {showForm && (
          <form className="pc-form" onSubmit={handleSubmit}>
            <h3>Novo Pedido de Cartão</h3>

            <div className="pc-form-row">
              <div className="pc-field">
                <label>Tipo de Pedido *</label>
                <div className="pc-radio-group">
                  <label className="pc-radio">
                    <input
                      type="radio"
                      name="tipo_pedido"
                      value="NOVO"
                      checked={form.tipo_pedido === 'NOVO'}
                      onChange={handleChange}
                    />
                    Cartão Novo
                  </label>
                  <label className="pc-radio">
                    <input
                      type="radio"
                      name="tipo_pedido"
                      value="SEGUNDA_VIA"
                      checked={form.tipo_pedido === 'SEGUNDA_VIA'}
                      onChange={handleChange}
                    />
                    Segunda Via
                  </label>
                </div>
              </div>
            </div>

            <div className="pc-form-grid">
              <div className="pc-field">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  name="nome_completo"
                  value={form.nome_completo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="pc-field">
                <label>CPF *</label>
                <input
                  type="text"
                  name="cpf"
                  value={form.cpf}
                  onChange={(e) => setForm((prev) => ({ ...prev, cpf: formatCpf(e.target.value) }))}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="pc-field">
                <label>Data de Nascimento *</label>
                <input
                  type="date"
                  name="data_nascimento"
                  value={form.data_nascimento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="pc-field">
                <label>Produto *</label>
                <select name="produto" value={form.produto} onChange={handleChange} required>
                  {PRODUTOS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="pc-field pc-field-full">
                <label>Condomínio *</label>
                <select
                  name="nome_condominio"
                  value={condominioCnpj}
                  onChange={handleCondominioChange}
                  required
                >
                  <option value="">Selecionar condomínio...</option>
                  {condominios.map((c) => (
                    <option key={c.cnpj} value={c.cnpj}>
                      {c.nome} ({c.cnpj})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pc-field">
                <label>CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={form.cep}
                  onChange={(e) => setForm((prev) => ({ ...prev, cep: formatCep(e.target.value) }))}
                  placeholder="00000-000"
                />
              </div>

              <div className="pc-field pc-field-wide">
                <label>Logradouro</label>
                <input
                  type="text"
                  name="logradouro"
                  value={form.logradouro}
                  onChange={handleChange}
                />
              </div>

              <div className="pc-field">
                <label>Número</label>
                <input
                  type="text"
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                />
              </div>

              <div className="pc-field">
                <label>Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={form.complemento}
                  onChange={handleChange}
                />
              </div>

              <div className="pc-field">
                <label>Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={form.bairro}
                  onChange={handleChange}
                />
              </div>

              <div className="pc-field">
                <label>Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                />
              </div>

              <div className="pc-field">
                <label>UF</label>
                <input
                  type="text"
                  name="estado"
                  value={form.estado}
                  onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                  maxLength={2}
                />
              </div>

              <div className="pc-field">
                <label>Valor</label>
                <input
                  type="number"
                  name="valor"
                  value={form.valor}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="pc-field pc-field-full">
              <label>Observação</label>
              <textarea
                name="observacao"
                value={form.observacao}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="pc-form-actions">
              <button type="button" className="pc-btn-cancelar" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="pc-btn-enviar" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Pedido'}
              </button>
            </div>
          </form>
        )}

        <div className="pc-table-wrap">
          {loading ? (
            <div className="pc-loading">Carregando pedidos...</div>
          ) : pedidos.length === 0 ? (
            <div className="pc-empty">Nenhum pedido encontrado.</div>
          ) : (
            <table className="pc-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Produto</th>
                  <th>Condomínio</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.id}</strong></td>
                    <td>{p.tipo_pedido_display}</td>
                    <td>{p.nome_completo}</td>
                    <td>{p.cpf}</td>
                    <td>{p.produto}</td>
                    <td>{p.nome_condominio}</td>
                    <td className="pc-valor">{p.valor ? fmtMoney(p.valor) : '-'}</td>
                    <td>
                      <span className={`pc-badge ${STATUS_BADGE[p.status] || ''}`}>
                        {p.status_display}
                      </span>
                    </td>
                    <td>{fmtDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
