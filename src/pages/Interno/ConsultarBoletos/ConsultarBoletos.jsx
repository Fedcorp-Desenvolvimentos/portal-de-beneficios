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
    if (!administradoraId) return

    setLoading(true)
    try {
      const params = {
        administradora_id: administradoraId,
        page,
        limit: 20,
      }
      if (statusFilter) params.status = statusFilter

      const response = await entebenService.listarBoletos(params)
      setBoletos(response?.data || [])
      setTotalPages(response?.pages || 1)
      setTotal(response?.total || 0)
    } catch (error) {
      console.error('Erro ao carregar boletos:', error)
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
    return (
      (b.nome_cobrado || '').toLowerCase().includes(term) ||
      (b.cnpj_cobrado || '').includes(term) ||
      (b.documento || '').toLowerCase().includes(term) ||
      (b.fatura || '').toLowerCase().includes(term)
    )
  })

  const resumo = {
    total: boletos.length,
    pagos: boletos.filter((b) => b.baixa).length,
    pendentes: boletos.filter((b) => !b.baixa).length,
    valorTotal: boletos.reduce((s, b) => s + (b.valor || 0), 0),
    valorPago: boletos.filter((b) => b.baixa).reduce((s, b) => s + (b.valor || 0), 0),
    valorPendente: boletos.filter((b) => !b.baixa).reduce((s, b) => s + (b.valor || 0), 0),
  }

  return (
    <PageLayout title="Consulta de Boletos" subtitle="Consulte boletos gerados, pagos e pendentes">
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
            placeholder="Buscar por nome, CNPJ, documento..."
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
          <div className="cb-loading">Carregando boletos...</div>
        ) : boletosFiltrados.length === 0 ? (
          <div className="cb-empty">Nenhum boleto encontrado.</div>
        ) : (
          <>
            <div className="cb-table-wrap">
              <table className="cb-table">
                <thead>
                  <tr>
                    <th>Condomínio</th>
                    <th>CNPJ</th>
                    <th>Documento</th>
                    <th>Fatura</th>
                    <th>Vencimento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Data Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {boletosFiltrados.map((b) => (
                    <tr key={b.id}>
                      <td>{b.nome_cobrado || '-'}</td>
                      <td>{b.cnpj_cobrado || '-'}</td>
                      <td>{b.documento || '-'}</td>
                      <td>{b.fatura || '-'}</td>
                      <td>{fmtDate(b.vencimento)}</td>
                      <td className="cb-valor">{fmtMoney(b.valor)}</td>
                      <td>
                        <span className={`cb-badge ${b.baixa ? 'pago' : 'pendente'}`}>
                          {b.baixa ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td>{fmtDate(b.dt_baixa)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cb-pagination">
              <span>Página {page} de {totalPages} ({total} boletos)</span>
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
