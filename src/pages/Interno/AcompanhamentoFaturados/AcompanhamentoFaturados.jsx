import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  CalendarDays,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react'

import './Acompanhamento.css'
import { faturamentoService } from '../../../services/faturamentoService'
import { useLoading } from '../../../hooks/useLoading'
import PageLayout from '../../../Layouts/PageLayout/PageLayout'

const fmtDate = (s) => {
  if (!s) return '-'
  const value = String(s).trim()
  if (!value) return '-'
  if (value.includes('/')) return value

  // Datas puras (YYYY-MM-DD) são convertidas manualmente: new Date('2026-08-01')
  // é interpretado como UTC e, em fuso negativo, toLocaleDateString devolve o
  // dia anterior (31/07/2026). Datetimes seguem pelo Date(), que converte certo.
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoDate) {
    const [, ano, mes, dia] = isoDate
    return `${dia}/${mes}/${ano}`
  }

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

// Classe do badge conforme a situação dos boletos: nenhum pago, parcial ou total.
const situacaoPagamento = ({ total, pagos }) => {
  if (!total) return 'vazio'
  if (pagos === 0) return 'pendente'
  if (pagos < total) return 'parcial'
  return 'pago'
}

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
  // competencia vem do Faturamento; vigencia_inicio é apenas fallback para
  // importações antigas sem faturamento vinculado.
  competencia: pedidoApi.competencia || pedidoApi.vigencia_inicio || null,
  // Data de crédito = data de recebimento do benefício, escolhida pelo cliente
  // na importação da planilha. Não é a baixa do boleto.
  dataCredito: pedidoApi.data_credito || pedidoApi.data_recebimento || null,
  boletos: pedidoApi.boletos_pagamento || { total: 0, pagos: 0, pendentes: 0, itens: [] },
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
  const [search, setSearch] = useState('')
  const [expandidos, setExpandidos] = useState(() => new Set())
  const { loading, startLoading, stopLoading, updateProgress } = useLoading()

  const alternarExpandido = (id) => {
    setExpandidos((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }

  async function carregarPedidos() {
    try {
      startLoading("Carregando pedidos...")
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
      stopLoading()
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
    <PageLayout title='Compras Finalizadas' subtitle='Consulte pedidos finalizados e enviados para compra de benefícios.'>
      <div className="cf-root">
  
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
                <th>Data de Crédito</th>
                <th>Qtd. funcionários</th>
                <th>Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="cf-empty">
                    Carregando compras finalizadas...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="cf-empty">
                    Nenhuma compra finalizada encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <React.Fragment key={p.id}>
                  <tr>
                    <td>
                      <div className="cf-id-main">Pedido #{p.id}</div>
                      <div className="cf-id-sub">
                        {p.nomeCondominio} · {p.cnpj}
                      </div>
                    </td>

                    <td>{fmtDate(p.competencia)}</td>

                    <td>
                      <div className="cf-inline">
                        <CalendarDays size={14} />
                        {fmtDate(p.dataVencimento)}
                      </div>
                    </td>

                    <td>
                      {p.dataCredito ? (
                        <div className="cf-inline">
                          <CalendarDays size={14} />
                          {fmtDate(p.dataCredito)}
                        </div>
                      ) : (
                        <span className="cf-muted">-</span>
                      )}

                      {p.boletos.total > 0 && (
                        <button
                          type="button"
                          className={`cf-pgto-toggle ${situacaoPagamento(p.boletos)}`}
                          onClick={() => alternarExpandido(p.id)}
                          aria-expanded={expandidos.has(p.id)}
                          title="Ver boletos pagos e pendentes"
                        >
                          {expandidos.has(p.id) ? (
                            <ChevronDown size={13} />
                          ) : (
                            <ChevronRight size={13} />
                          )}
                          {p.boletos.pagos}/{p.boletos.total} pagos
                        </button>
                      )}
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

                  {expandidos.has(p.id) && (
                    <tr className="cf-detalhe-row">
                      <td colSpan={7}>
                        <div className="cf-detalhe">
                          <div className="cf-detalhe-head">
                            Situação dos boletos
                            <span className="cf-detalhe-resumo">
                              {p.boletos.pagos} pago{p.boletos.pagos === 1 ? '' : 's'}
                              {' · '}
                              {p.boletos.pendentes} pendente{p.boletos.pendentes === 1 ? '' : 's'}
                            </span>
                          </div>

                          <div className="cf-detalhe-scroll">
                          <table className="cf-detalhe-table">
                            <thead>
                              <tr>
                                <th>Condomínio</th>
                                <th>Fatura</th>
                                <th>Valor</th>
                                <th>Vencimento</th>
                                <th>Situação</th>
                                <th>Pago em</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.boletos.itens.map((b) => (
                                <tr key={b.id}>
                                  <td>
                                    <div className="cf-detalhe-nome">
                                      {b.condominio || '-'}
                                    </div>
                                    {b.cnpj && (
                                      <div className="cf-detalhe-cnpj">{b.cnpj}</div>
                                    )}
                                  </td>
                                  <td>{b.fatura || '-'}</td>
                                  <td>{b.valor == null ? '-' : fmtMoney(b.valor)}</td>
                                  <td>{fmtDate(b.vencimento)}</td>
                                  <td>
                                    <span
                                      className={`cf-pgto-pill ${b.pago ? 'pago' : 'pendente'}`}
                                    >
                                      {b.pago ? (
                                        <CheckCircle2 size={12} />
                                      ) : (
                                        <Clock size={12} />
                                      )}
                                      {b.pago ? 'Pago' : 'Pendente'}
                                    </span>
                                  </td>
                                  <td>{fmtDate(b.data_pagamento)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  )
}