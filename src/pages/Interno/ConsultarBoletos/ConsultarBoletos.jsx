import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { entebenService } from '../../../services/entebenService'
import PageLayout from '../../../Layouts/PageLayout/PageLayout'
import './ConsultarBoletos.css'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'pago', label: 'Pagos' },
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
  PENDING: 'pendente',
  PROCESSING: 'pendente',
  COMPLETED: 'pago',
  FATURADO: 'pago',
  FAILED: 'falhou',
}

export default function ConsultarBoletos() {
  const { user } = useAuth()
  const administradoraId = user?.administradora_ativa?.id || user?.administradora_id

  const [boletos, setBoletos] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const carregarBoletos = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 20,
      }
      if (administradoraId) params.administradora_id = administradoraId
      if (statusFilter) params.status = statusFilter

      const response = await entebenService.listarBoletos(params)
      setBoletos(response?.data || [])
      setTotalPages(response?.pages || 1)
      setTotal(response?.total || 0)
    } catch (error) {
      console.error('Erro ao carregar faturas:', error)
      setBoletos([])
    } finally {
      setLoading(false)
    }
  }, [administradoraId, page, statusFilter])

  useEffect(() => {
    carregarBoletos()
  }, [carregarBoletos])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  const boletosFiltrados = boletos.filter((b) => {
    if (!search) return true
    const term = search.toLowerCase()
    const condominios = b.condominios || []
    return (
      (b.administradora_nome || '').toLowerCase().includes(term) ||
      (b.importacao_id && String(b.importacao_id).includes(term)) ||
      (b.id && String(b.id).includes(term)) ||
      condominios.some(
        (c) =>
          (c.condominio_nome || '').toLowerCase().includes(term) ||
          (c.condominio_cnpj || '').includes(term)
      )
    )
  })

  const resumo = {
    total: boletos.length,
    pagos: boletos.filter((b) => STATUS_BADGE[b.status] === 'pago').length,
    pendentes: boletos.filter((b) => STATUS_BADGE[b.status] === 'pendente').length,
    valorTotal: boletos.reduce((s, b) => s + (b.valor_total || 0), 0),
    valorPago: boletos.filter((b) => STATUS_BADGE[b.status] === 'pago').reduce((s, b) => s + (b.valor_total || 0), 0),
    valorPendente: boletos.filter((b) => STATUS_BADGE[b.status] === 'pendente').reduce((s, b) => s + (b.valor_total || 0), 0),
  }

  return (
    <PageLayout title="Consulta de Faturas" subtitle="Consulte faturas geradas, pagas e pendentes">
      <div className="cb-container">
        <div className="cb-resumo">
          <div className="cb-resumo-card">
            <span className="cb-resumo-label">Total</span>
            <strong className="cb-resumo-value">{resumo.total}</strong>
            <span className="cb-resumo-sub">{fmtMoney(resumo.valorTotal)}</span>
          </div>
          <div className="cb-resumo-card pago">
            <span className="cb-resumo-label">Pagos</span>
            <strong className="cb-resumo-value">{resumo.pagos}</strong>
            <span className="cb-resumo-sub">{fmtMoney(resumo.valorPago)}</span>
          </div>
          <div className="cb-resumo-card pendente">
            <span className="cb-resumo-label">Pendentes</span>
            <strong className="cb-resumo-value">{resumo.pendentes}</strong>
            <span className="cb-resumo-sub">{fmtMoney(resumo.valorPendente)}</span>
          </div>
        </div>

        <div className="cb-filters">
          <input
            type="search"
            placeholder="Buscar por condomínio, CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cb-search"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cb-select"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="cb-loading">Carregando faturas...</div>
        ) : boletosFiltrados.length === 0 ? (
          <div className="cb-empty">Nenhuma fatura encontrada.</div>
        ) : (
          <>
            <div className="cb-table-wrap">
              <table className="cb-table">
                <thead>
                  <tr>
                    <th>Fatura</th>
                    <th>Administradora</th>
                    <th>Condomínio</th>
                    <th>CNPJ</th>
                    <th>Competência</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Vencimento</th>
                  </tr>
                </thead>
                <tbody>
                  {boletosFiltrados.map((b) => {
                    const badge = STATUS_BADGE[b.status] || 'pendente'
                    const docs = b.condominios || []
                    const primeiroDoc = docs[0] || {}
                    return (
                      <tr key={b.id}>
                        <td>FAT-{b.id}</td>
                        <td>{b.administradora_nome || '-'}</td>
                        <td>{primeiroDoc.condominio_nome || (docs.length > 1 ? `${docs.length} condomínios` : '-')}</td>
                        <td>{primeiroDoc.condominio_cnpj || '-'}</td>
                        <td>{fmtDate(b.competencia)}</td>
                        <td className="cb-valor">{fmtMoney(b.valor_total)}</td>
                        <td>
                          <span className={`cb-badge ${badge}`}>
                            {b.status_display || b.status}
                          </span>
                        </td>
                        <td>{fmtDate(b.data_vencimento)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="cb-pagination">
              <span>Página {page} de {totalPages} ({total} faturas)</span>
              <div className="cb-pagination-btns">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}
