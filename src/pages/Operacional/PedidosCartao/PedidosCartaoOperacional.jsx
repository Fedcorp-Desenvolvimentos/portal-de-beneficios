import React, { useState, useEffect, useCallback } from 'react'
import { pedidoCartaoService } from '../../../services/pedidoCartaoService'
import PageLayout from '../../../Layouts/PageLayout/PageLayout'
import './PedidosCartaoOperacional.css'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_ANALISE', label: 'Em Análise' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'RECUSADO', label: 'Recusado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const STATUS_UPDATE_OPTIONS = [
  { value: 'EM_ANALISE', label: 'Em Análise' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'RECUSADO', label: 'Recusado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const STATUS_BADGE = {
  PENDENTE: 'pendente',
  EM_ANALISE: 'analise',
  APROVADO: 'aprovado',
  ENVIADO: 'enviado',
  RECUSADO: 'recusado',
  CANCELADO: 'cancelado',
}

const fmtMoney = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const fmtDate = (s) => {
  if (!s) return '-'
  const d = new Date(s)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-BR')
}

export default function PedidosCartaoOperacional() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [alterandoId, setAlterandoId] = useState(null)

  const carregarPedidos = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filtroStatus) params.status = filtroStatus
      if (filtroTipo) params.tipo = filtroTipo
      if (search.trim()) params.search = search.trim()

      const data = await pedidoCartaoService.listarOperacional(params)
      setPedidos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }, [filtroStatus, filtroTipo, search])

  useEffect(() => {
    carregarPedidos()
  }, [carregarPedidos])

  const handleAlterarStatus = async (id, novoStatus) => {
    if (!novoStatus) return
    setAlterandoId(id)
    try {
      await pedidoCartaoService.alterarStatus(id, novoStatus)
      await carregarPedidos()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    } finally {
      setAlterandoId(null)
    }
  }

  const resumo = {
    total: pedidos.length,
    pendentes: pedidos.filter((p) => p.status === 'PENDENTE').length,
    emAnalise: pedidos.filter((p) => p.status === 'EM_ANALISE').length,
    aprovados: pedidos.filter((p) => p.status === 'APROVADO').length,
    enviados: pedidos.filter((p) => p.status === 'ENVIADO').length,
  }

  return (
    <PageLayout title="Pedidos de Cartão" subtitle="Gerencie pedidos de cartão das administradoras">
      <div className="pco-container">
        <div className="pco-resumo">
          <div className="pco-resumo-card">
            <span className="pco-resumo-label">Total</span>
            <strong className="pco-resumo-value">{resumo.total}</strong>
          </div>
          <div className="pco-resumo-card pendente">
            <span className="pco-resumo-label">Pendentes</span>
            <strong className="pco-resumo-value">{resumo.pendentes}</strong>
          </div>
          <div className="pco-resumo-card analise">
            <span className="pco-resumo-label">Em Análise</span>
            <strong className="pco-resumo-value">{resumo.emAnalise}</strong>
          </div>
          <div className="pco-resumo-card aprovado">
            <span className="pco-resumo-label">Aprovados</span>
            <strong className="pco-resumo-value">{resumo.aprovados}</strong>
          </div>
          <div className="pco-resumo-card enviado">
            <span className="pco-resumo-label">Enviados</span>
            <strong className="pco-resumo-value">{resumo.enviados}</strong>
          </div>
        </div>

        <div className="pco-filters">
          <input
            type="search"
            placeholder="Buscar por nome, CPF, condomínio, administradora..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pco-search"
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="pco-select"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="pco-select"
          >
            <option value="">Todos os tipos</option>
            <option value="NOVO">Cartão Novo</option>
            <option value="SEGUNDA_VIA">Segunda Via</option>
          </select>
        </div>

        {loading ? (
          <div className="pco-loading">Carregando pedidos...</div>
        ) : pedidos.length === 0 ? (
          <div className="pco-empty">Nenhum pedido encontrado.</div>
        ) : (
          <div className="pco-table-wrap">
            <table className="pco-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Produto</th>
                  <th>Condomínio</th>
                  <th>Endereço</th>
                  <th>Administradora</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ação</th>
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
                    <td className="pco-endereco">
                      {p.logradouro}{p.numero ? `, ${p.numero}` : ''}
                      {p.bairro ? ` - ${p.bairro}` : ''}
                      {p.cidade && p.estado ? ` / ${p.cidade}/${p.estado}` : ''}
                      {p.cep ? ` CEP: ${p.cep}` : ''}
                    </td>
                    <td>{p.administradora_nome || '-'}</td>
                    <td className="pco-valor">{fmtMoney(p.valor)}</td>
                    <td>
                      <span className={`pco-badge ${STATUS_BADGE[p.status] || ''}`}>
                        {p.status_display}
                      </span>
                    </td>
                    <td>{fmtDate(p.created_at)}</td>
                    <td>
                      {p.status !== 'ENVIADO' && p.status !== 'CANCELADO' && (
                        <select
                          className="pco-action-select"
                          value=""
                          onChange={(e) => handleAlterarStatus(p.id, e.target.value)}
                          disabled={alterandoId === p.id}
                        >
                          <option value="">Alterar...</option>
                          {STATUS_UPDATE_OPTIONS.filter((opt) => opt.value !== p.status).map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
