import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaChartBar,
  FaChartLine,
  FaClock,
  FaFileInvoiceDollar,
  FaReceipt,
  FaSyncAlt,
  FaSearch,
FaSlidersH,
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

import TopNav from './TopNav/TopNav';
import DashboardEquipe from './DashboardEquipe/DashboardEquipe';
import UploadFaturaPanel from './DashboardEquipe/components/UploadFaturaPanel';

import {
  computeStatus,
  fmtDate,
  formatBRL,
  getCoEstipulantes,
  getDueDate,
  getPaidAt,
} from './DashboardEquipe/helpers';

import {
  operacionalBoletoService,
  operacionalFaturaService,
} from '../../services/operacionalService';

import './Operacional.css';

const STATUS_LABEL = {
  faturado: 'Faturado',
  atrasado: 'Confirmar pagamento',
  aprovado: 'Boleto VR enviado',
  pago: 'Pago',
};

const STATUS_COLUMNS = [
  { key: 'faturado', label: STATUS_LABEL.faturado },
  { key: 'atrasado', label: STATUS_LABEL.atrasado },
  { key: 'aprovado', label: STATUS_LABEL.aprovado },
  { key: 'pago', label: STATUS_LABEL.pago },
];

const KANBAN_STATUS_CLASS = {
  faturado: 'kanban-status-faturado',
  atrasado: 'kanban-status-atrasado',
  aprovado: 'kanban-status-aprovado',
  pago: 'kanban-status-pago',
};

function getViewFromPath(pathname) {
  if (pathname.includes('/operacional/kanban')) return 'kanban';
  if (pathname.includes('/operacional/faturas')) return 'faturas';
  if (pathname.includes('/operacional/analises')) return 'analises';

  return 'dashboard';
}

function EmptyState({ message }) {
  return (
    <div className="op-empty-state">
      <FaFileInvoiceDollar />
      <span>{message}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="op-empty-state">
      <FaClock />
      <span>Carregando...</span>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`fatura-status-badge fs-${status}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function getFaturaId(fatura) {
  return fatura?.id || fatura?.pk || fatura?.codigo || fatura?.numero || '';
}

function getFaturaNum(fatura) {
  return (
    fatura?.faturaNum ||
    fatura?.fatura_num ||
    fatura?.numero_fatura ||
    fatura?.numero ||
    getFaturaId(fatura) ||
    ''
  );
}

function getFaturaCreatedAt(fatura) {
  return (
    fatura?.createdAt ||
    fatura?.created_at ||
    fatura?.data_criacao ||
    fatura?.emissao ||
    fatura?.data_emissao ||
    ''
  );
}

function getFaturaEstipulanteName(fatura) {
  return (
    fatura?.estipulante?.name ||
    fatura?.estipulante?.nome ||
    fatura?.estipulante_nome ||
    fatura?.administradora_nome ||
    'Fatura'
  );
}

function getUploaderName(item) {
  return (
    item?.uploaderName ||
    item?.uploader_name ||
    item?.usuario_nome ||
    item?.responsavel_nome ||
    item?.created_by_name ||
    'Sem responsável'
  );
}

function moneyToCents(value) {
  if (typeof value === 'number') {
    return Math.round(value * 100);
  }

  const clean = String(value || '')
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const number = Number(clean);

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.round(number * 100);
}

function getCoValorCents(item) {
  if (item?.valorCents !== undefined && item?.valorCents !== null) {
    return Number(item.valorCents) || 0;
  }

  if (item?.valor_cents !== undefined && item?.valor_cents !== null) {
    return Number(item.valor_cents) || 0;
  }

  if (item?.valorCentavos !== undefined && item?.valorCentavos !== null) {
    return Number(item.valorCentavos) || 0;
  }

  return moneyToCents(item?.valor_total ?? item?.valor ?? item?.total ?? 0);
}

function getFaturaTotal(fatura) {
  const coEstipulantes = getCoEstipulantes(fatura);

  if (fatura?.totalCents !== undefined && fatura?.totalCents !== null) {
    return Number(fatura.totalCents) || 0;
  }

  if (fatura?.total_cents !== undefined && fatura?.total_cents !== null) {
    return Number(fatura.total_cents) || 0;
  }

  if (
    fatura?.valor_total_cents !== undefined &&
    fatura?.valor_total_cents !== null
  ) {
    return Number(fatura.valor_total_cents) || 0;
  }

  if (fatura?.valor_total !== undefined && fatura?.valor_total !== null) {
    return moneyToCents(fatura.valor_total);
  }

  return coEstipulantes.reduce(
    (acc, item) => acc + getCoValorCents(item),
    0
  );
}

function getFirstDueDate(fatura) {
  const coEstipulantes = getCoEstipulantes(fatura);
  const item = coEstipulantes.find((co) => getDueDate(co));

  return item ? getDueDate(item) : null;
}

function getPaidCount(fatura) {
  return getCoEstipulantes(fatura).filter((item) => getPaidAt(item)).length;
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function OperacionalKanban({ faturas }) {
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [responsavelFilter, setResponsavelFilter] = useState('');

  const responsaveis = useMemo(() => {
    const map = new Map();

    faturas.forEach((fatura) => {
      const name = getUploaderName(fatura);

      if (name && name !== 'Sem responsável') {
        map.set(name, name);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );
  }, [faturas]);

  const filteredFaturas = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return faturas.filter((fatura) => {
      const status = computeStatus(fatura);
      const responsavel = getUploaderName(fatura);

      if (statusFilter && status !== statusFilter) {
        return false;
      }

      if (responsavelFilter && responsavel !== responsavelFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const coEstipulantes = getCoEstipulantes(fatura);

      const haystack = [
        getFaturaNum(fatura),
        getFaturaEstipulanteName(fatura),
        responsavel,
        ...coEstipulantes.flatMap((co) => [
          co?.name,
          co?.nome,
          co?.condominio,
          co?.condominio_nome,
          co?.cnpj,
          co?.documento,
          co?.cpf_cnpj,
        ]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return haystack.includes(normalizedSearch);
    });
  }, [faturas, search, statusFilter, responsavelFilter]);

  const groups = useMemo(() => {
    const grouped = STATUS_COLUMNS.reduce((acc, column) => {
      acc[column.key] = [];
      return acc;
    }, {});

    filteredFaturas.forEach((fatura) => {
      const status = computeStatus(fatura);

      if (grouped[status]) {
        grouped[status].push(fatura);
      }
    });

    return grouped;
  }, [filteredFaturas]);

  return (
    <div className="op-kanban-page">
      <div className="op-kanban-toolbar">
        <div className="op-kanban-search">
          <FaSearch />

          <input
            type="search"
            placeholder="Buscar fatura..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          className={`op-kanban-filter-btn${filtersOpen ? ' active' : ''}`}
          type="button"
          title="Filtros"
          onClick={() => setFiltersOpen((value) => !value)}
        >
          <FaSlidersH />
        </button>
      </div>

      {filtersOpen && (
        <div className="op-kanban-filters">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="faturado">Faturado</option>
            <option value="atrasado">Confirmar Pagamento</option>
            <option value="aprovado">Boleto VR Enviado</option>
            <option value="pago">Pago</option>
          </select>

          <select
            value={responsavelFilter}
            onChange={(event) => setResponsavelFilter(event.target.value)}
          >
            <option value="">Todos os responsáveis</option>

            {responsaveis.map((responsavel) => (
              <option key={responsavel} value={responsavel}>
                {responsavel}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="op-kanban-divider" />

      <div className="op-kanban-grid">
        {STATUS_COLUMNS.map((column) => {
          const statusClass = KANBAN_STATUS_CLASS[column.key] || '';

          return (
            <section
              key={column.key}
              className={`op-kanban-column ${statusClass}`}
            >
              <header className="op-kanban-column-header">
                <div className="op-kanban-title-wrap">
                  <span className="op-kanban-dot" />

                  <strong className="op-kanban-title">
                    {column.label}
                  </strong>
                </div>

                <span className="op-kanban-count">
                  {groups[column.key].length}
                </span>
              </header>

              <div className="op-kanban-column-body">
                {groups[column.key].length ? (
                  <div className="op-kanban-card-list">
                    {groups[column.key].map((fatura) => {
                      const coEstipulantes = getCoEstipulantes(fatura);
                      const id = getFaturaId(fatura);

                      return (
                        <article key={id} className="op-kanban-card">
                          <div className="op-kanban-card-title">
                            {getFaturaEstipulanteName(fatura)}
                          </div>

                          <div className="op-kanban-card-sub">
                            {getFaturaNum(fatura)}
                          </div>

                          <div className="op-kanban-card-value">
                            {formatBRL(getFaturaTotal(fatura))}
                          </div>

                          <div className="op-kanban-card-footer">
                            <span>
                              Vence {fmtDate(getFirstDueDate(fatura))}
                            </span>

                            <span>
                              {getPaidCount(fatura)}/{coEstipulantes.length} pagos
                            </span>
                          </div>

                          <div className="op-kanban-card-uploader">
                            {getUploaderName(fatura)}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="op-kanban-empty">
                    Nenhuma fatura
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function OperacionalFaturas({ faturas }) {
  return (
    <section className="boletos-section">
      <div className="section-header">
        <h3 className="section-title">
          <FaReceipt /> Faturas VR
        </h3>
      </div>

      {faturas.length ? (
        <div className="table-responsive">
          <table className="faturas-table">
            <thead>
              <tr>
                <th>Fatura</th>
                <th>Estipulante</th>
                <th>Vencimento</th>
                <th>Coestipulantes</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {faturas.map((fatura) => {
                const coEstipulantes = getCoEstipulantes(fatura);
                const id = getFaturaId(fatura);
                const status = computeStatus(fatura);

                return (
                  <tr key={id} className="fatura-row">
                    <td>
                      <strong className="op-table-main-text">
                        {getFaturaNum(fatura)}
                      </strong>

                      <div className="op-table-muted-text">
                        {fmtDate(getFaturaCreatedAt(fatura))}
                      </div>
                    </td>

                    <td>{getFaturaEstipulanteName(fatura)}</td>
                    <td>{fmtDate(getFirstDueDate(fatura))}</td>
                    <td>{coEstipulantes.length}</td>

                    <td className="fatura-valor">
                      {formatBRL(getFaturaTotal(fatura))}
                    </td>

                    <td>
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="op-faturas-empty">
          <FaFileInvoiceDollar className="op-faturas-empty-icon" />

          <p>Nenhuma fatura carregada.</p>

          <span>
            Use o botão de upload na barra superior para importar um PDF.
          </span>
        </div>
      )}
    </section>
  );
}

function OperacionalAnalises({ faturas, metrics }) {
  const meses = useMemo(() => {
    const now = new Date();

    const list = [];

    for (let i = 11; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      list.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
        labelTable: date.toLocaleDateString('pt-BR', {
          month: 'short',
          year: '2-digit',
        }).replace('.', ''),
        count: 0,
        total: 0,
        isCurrent: i === 0,
      });
    }

    faturas.forEach((fatura) => {
      const createdAt = getFaturaCreatedAt(fatura);
      const date = createdAt
        ? new Date(String(createdAt).length === 10 ? `${createdAt}T12:00:00` : createdAt)
        : null;

      if (!date || Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const mes = list.find((item) => item.key === key);

      if (mes) {
        mes.count += 1;
        mes.total += getFaturaTotal(fatura);
      }
    });

    return list;
  }, [faturas]);

  const totalFaturado = metrics.valorFaturas || 0;
  const totalFaturas = metrics.totalFaturas || 0;
  const mediaPorFatura = totalFaturas ? Math.round(totalFaturado / totalFaturas) : 0;

  const condominiosUnicos = useMemo(() => {
    const set = new Set();

    faturas.forEach((fatura) => {
      getCoEstipulantes(fatura).forEach((co) => {
        const key =
          co?.cnpj ||
          co?.documento ||
          co?.cpf_cnpj ||
          co?.name ||
          co?.nome ||
          co?.condominio_nome;

        if (key) set.add(String(key));
      });
    });

    return set.size;
  }, [faturas]);

  const maxMes = Math.max(...meses.map((mes) => mes.total), 1);

  const statusRows = STATUS_COLUMNS.map((column) => {
    const count = metrics.status[column.key] || 0;
    const pct = totalFaturas ? Math.round((count / totalFaturas) * 100) : 0;

    return {
      ...column,
      count,
      pct,
    };
  });

  const topEstipulantes = useMemo(() => {
    const map = new Map();

    faturas.forEach((fatura) => {
      const name = getFaturaEstipulanteName(fatura);
      const current = map.get(name) || {
        name,
        total: 0,
        count: 0,
      };

      current.total += getFaturaTotal(fatura);
      current.count += 1;

      map.set(name, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [faturas]);

  const topContribuidores = useMemo(() => {
    const map = new Map();

    faturas.forEach((fatura) => {
      const name = getUploaderName(fatura);
      const current = map.get(name) || {
        name,
        total: 0,
      };

      current.total += 1;

      map.set(name, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [faturas]);

  return (
    <div className="op-analytics-page">
      <div className="op-analytics-date">
        A partir de 04/07/2026
      </div>

      <div className="op-analytics-kpis">
        <div className="op-analytics-kpi">
          <span>Total faturado</span>
          <strong>{formatBRL(totalFaturado)}</strong>
        </div>

        <div className="op-analytics-kpi">
          <span>Faturas</span>
          <strong>{totalFaturas}</strong>
        </div>

        <div className="op-analytics-kpi">
          <span>Média por fatura</span>
          <strong>{formatBRL(mediaPorFatura)}</strong>
        </div>

        <div className="op-analytics-kpi">
          <span>Condomínios</span>
          <strong>{condominiosUnicos}</strong>
          <small>{condominiosUnicos} CNPJs únicos</small>
        </div>
      </div>

      <section className="op-analytics-card op-analytics-chart-card">
        <div className="op-analytics-card-header">
          <strong>Evolução Mensal</strong>
          <span>Últimos 12 meses — valores em R$</span>
        </div>

        <div className="op-analytics-chart">
          {meses.map((mes) => {
            const height = Math.max(Math.round((mes.total / maxMes) * 100), mes.total > 0 ? 10 : 3);

            return (
              <div className="op-analytics-month-col" key={mes.key}>
                <div className="op-analytics-bar-wrap">
                  <div
                    className={`op-analytics-bar ${mes.isCurrent ? 'current' : ''}`}
                    style={{ height: `${height}%` }}
                    title={`${mes.label}: ${formatBRL(mes.total)}`}
                  />
                </div>

                <span>{mes.label}</span>
              </div>
            );
          })}
        </div>

        <div className="op-analytics-legend">
          <span>
            <i className="legend-prev" />
            Anteriores
          </span>

          <span>
            <i className="legend-current" />
            Mês atual
          </span>
        </div>
      </section>

      <div className="op-analytics-grid">
        <section className="op-analytics-card">
          <div className="op-analytics-card-header">
            <strong>Mês a Mês</strong>
            <span>12 meses</span>
          </div>

          <table className="op-analytics-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Faturas</th>
                <th>Total</th>
                <th>Variação</th>
              </tr>
            </thead>

            <tbody>
              {[...meses].reverse().map((mes, index, array) => {
                const prev = array[index + 1];
                const variation = prev && prev.total
                  ? ((mes.total - prev.total) / prev.total) * 100
                  : null;

                return (
                  <tr key={mes.key}>
                    <td>
                      {mes.labelTable}
                      {mes.isCurrent && <span className="op-current-badge">atual</span>}
                    </td>
                    <td>{mes.count}</td>
                    <td>{mes.total ? formatBRL(mes.total) : '—'}</td>
                    <td>
                      {variation === null
                        ? '—'
                        : `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="op-analytics-card">
          <div className="op-analytics-card-header">
            <strong>Distribuição por Status</strong>
            <span>todas as faturas</span>
          </div>

          <div className="op-status-distribution">
            {statusRows.map((row) => (
              <div className={`op-status-line status-${row.key}`} key={row.key}>
                <div className="op-status-line-top">
                  <span>
                    <i />
                    {row.label}
                  </span>

                  <strong>
                    {row.count}
                    <small>{row.pct}%</small>
                  </strong>
                </div>

                <div className="op-status-line-bar">
                  <div style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="op-analytics-grid">
        <section className="op-analytics-card">
          <div className="op-analytics-card-header">
            <strong>Top Estipulantes</strong>
            <span>por valor faturado</span>
          </div>

          {topEstipulantes.length ? (
            <div className="op-ranking-list">
              {topEstipulantes.map((item) => (
                <div className="op-ranking-row" key={item.name}>
                  <span>{item.name}</span>
                  <strong>{formatBRL(item.total)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="op-analytics-empty">Nenhum dado disponível</p>
          )}
        </section>

        <section className="op-analytics-card">
          <div className="op-analytics-card-header">
            <strong>Top Contribuidores</strong>
            <span>quem mais importou faturas</span>
          </div>

          {topContribuidores.length ? (
            <div className="op-ranking-list">
              {topContribuidores.map((item) => (
                <div className="op-ranking-row" key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.total}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="op-analytics-empty">Nenhum dado disponível</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default function Operacional({ view }) {
  const location = useLocation();

  const resolvedView = view || getViewFromPath(location.pathname);

  const [faturas, setFaturas] = useState([]);
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);

    try {
      const [faturasResponse, boletosResponse] = await Promise.allSettled([
        operacionalFaturaService.getAll(),
        operacionalBoletoService.getAll(),
      ]);

      const nextFaturas =
        faturasResponse.status === 'fulfilled'
          ? normalizeList(faturasResponse.value?.data)
          : [];

      const nextBoletos =
        boletosResponse.status === 'fulfilled'
          ? normalizeList(boletosResponse.value?.data)
          : [];

      setFaturas(nextFaturas);
      setBoletos(nextBoletos);
    } catch (error) {
      console.error('Erro ao carregar dados operacionais:', error);
      setFaturas([]);
      setBoletos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resolvedView !== 'dashboard') {
      carregar();
    }
  }, [resolvedView, carregar]);

  const metrics = useMemo(() => {
    const status = STATUS_COLUMNS.reduce((acc, column) => {
      acc[column.key] = 0;
      return acc;
    }, {});

    let valorFaturas = 0;

    faturas.forEach((fatura) => {
      const currentStatus = computeStatus(fatura);

      status[currentStatus] = (status[currentStatus] || 0) + 1;
      valorFaturas += getFaturaTotal(fatura);
    });

    return {
      totalFaturas: faturas.length,
      totalBoletos: boletos.length,
      aConfirmar: status.atrasado || 0,
      pagas: status.pago || 0,
      valorFaturas,
      status,
    };
  }, [faturas, boletos]);

  const uploadAction = (
    <button
      className="btn-upload-fatura"
      type="button"
      onClick={() => {
        if (resolvedView === 'dashboard') {
          document
            .getElementById('dropZone')
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

          return;
        }

        setUploadModalOpen(true);
      }}
    >
      Upload Boleto Faturamento
    </button>
  );

  const refreshAction = (
    <button
      className="btn-action"
      type="button"
      onClick={carregar}
      disabled={loading}
    >
      <FaSyncAlt /> Atualizar
    </button>
  );

  const topNavAction =
    resolvedView === 'dashboard' || resolvedView === 'faturas'
      ? uploadAction
      : refreshAction;

  return (
    <>
      <TopNav extraActions={topNavAction} />

      {resolvedView === 'dashboard' ? (
        <DashboardEquipe />
      ) : (
        <div className="op-root">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {resolvedView === 'kanban' && (
                <OperacionalKanban faturas={faturas} />
              )}

              {resolvedView === 'faturas' && (
                <OperacionalFaturas faturas={faturas} />
              )}

              {resolvedView === 'analises' && (
                <OperacionalAnalises
                  faturas={faturas}
                  boletos={boletos}
                  metrics={metrics}
                />
              )}

              {!['kanban', 'faturas', 'analises'].includes(resolvedView) && (
                <EmptyState message="Área operacional não encontrada." />
              )}
            </>
          )}
        </div>
      )}

      {uploadModalOpen && (
        <div
          className="op-upload-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setUploadModalOpen(false);
            }
          }}
        >
          <div className="op-upload-modal">
            <button
              className="op-upload-modal-close"
              type="button"
              aria-label="Fechar"
              onClick={() => setUploadModalOpen(false)}
            >
              ×
            </button>

            <UploadFaturaPanel
              onSaved={async () => {
                setUploadModalOpen(false);
                await carregar();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}