import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  CalendarDays,
  CheckCircle2,
  X,
} from 'lucide-react'

import '../../styles/Acompanhamento.css'
import { faturamentoService } from '../../services/faturamentoService'

const fmtDate = (s) => {
  if (!s) return '-'
  const value = String(s).trim()
  if (!value) return '-'
  if (value.includes('/')) return value

  const date = new Date(value)
  if (!isNaN(date.getTime())) return date.toLocaleDateString('pt-BR')

  return value
}

const fmtMoney = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const normalizarStatus = (status) => {
  const map = {
    FATURADO: 'faturado',
    COMPRADO: 'comprado',
  }

  return map[status] || map[String(status || '').toUpperCase()] || status
}

const extrairResumoPedido = (pedidoApi) => ({
  id: pedidoApi.id,
  status: normalizarStatus(pedidoApi.status),
  dataVencimento: pedidoApi.data_vencimento,
  competencia: pedidoApi.vigencia_inicio || pedidoApi.competencia || '-',
  valorTotal: parseFloat(pedidoApi.valor_total || 0),
  totalFuncionarios: pedidoApi.total_funcionarios || pedidoApi.registros_processados || 0,
  nomeCondominio: pedidoApi.nome_condominio || `Pedido ${pedidoApi.id}`,
  cnpj: pedidoApi.cnpj || '-',
  cidade: pedidoApi.cidade || '-',
  uf: pedidoApi.uf || '-',
  faturadoEm: pedidoApi.data_faturamento || null,
  compradoEm: pedidoApi.data_compra || pedidoApi.data_comprado || null,
})

export default function AcompanhamentoFaturados() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function carregarPedidos() {
    try {
      setLoading(true)

      const response = await faturamentoService.listarPedidosFuncionario()

      let lista = []

      if (Array.isArray(response)) lista = response
      else if (Array.isArray(response?.results)) lista = response.results
      else if (Array.isArray(response?.data)) lista = response.data

      const formatados = lista
        .map(extrairResumoPedido)
        .filter((pedido) => pedido.status === 'comprado')

      setPedidos(formatados)
    } catch (error) {
      console.error('Erro ao carregar compras finalizadas:', error)
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPedidos()
  }, [])

  const stats = useMemo(
    () => ({
      comprados: pedidos.length,
      valorTotal: pedidos.reduce((acc, p) => acc + Number(p.valorTotal || 0), 0),
    }),
    [pedidos]
  )

  const filtered = useMemo(() => {
    const q = norm(search)

    return pedidos.filter((p) => {
      const hay = norm(
        [
          p.id,
          p.nomeCondominio,
          p.cnpj,
          p.cidade,
          p.uf,
          p.competencia,
        ].join(' ')
      )

      return !q || hay.includes(q)
    })
  }, [pedidos, search])

  return (
    <div className="cf-root">
      <div className="cf-page-header">
        <div>
          <div className="cf-page-title">Compras Finalizadas</div>
          <div className="cf-page-sub">
            Consulte pedidos finalizados e enviados para compra de benefícios.
          </div>
        </div>

      </div>

      <div className="cf-filters">
        <div className="cf-search">
          <Search size={15} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por pedido, condomínio, CNPJ..."
          />

          {search && (
            <button className="cf-search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="cf-table-wrap">
        <table className="cf-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Competência</th>
              <th>Vencimento</th>
              <th>Qtd. funcionários</th>
              <th>Valor Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="cf-empty">
                  Carregando compras finalizadas...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="cf-empty">
                  Nenhuma compra finalizada encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cf-id-main">Pedido #{p.id}</div>
                    <div className="cf-id-sub">
                      {p.nomeCondominio} · {p.cnpj}
                    </div>
                  </td>

                  <td>{p.competencia}</td>

                  <td>
                    <div className="cf-inline">
                      <CalendarDays size={14} />
                      {fmtDate(p.dataVencimento)}
                    </div>
                  </td>

                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {p.totalFuncionarios}
                  </td>

                  <td style={{ fontWeight: 600, color: '#16a34a' }}>
                    {fmtMoney(p.valorTotal)}
                  </td>

                  <td>
                    <span className="cf-status-pill comprado">
                      <CheckCircle2 size={14} />
                      Comprado
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}