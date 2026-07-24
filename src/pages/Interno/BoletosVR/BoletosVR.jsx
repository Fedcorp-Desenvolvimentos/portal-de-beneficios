import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaChartBar,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileInvoiceDollar,
  FaProjectDiagram,
  FaReceipt,
  FaSyncAlt,
} from 'react-icons/fa';

import PageLayout from '../../../Layouts/PageLayout/PageLayout';
import { dashboardBoletosService } from '../../../services/dashboardBoletosService';
import './BoletosVR.css';

const VIEWS = [
  { key: 'dashboard', path: '/boletos-vr', label: 'Dashboard', icon: <FaChartBar /> },
  { key: 'kanban', path: '/boletos-vr/kanban', label: 'Kanban', icon: <FaProjectDiagram /> },
  { key: 'faturas', path: '/boletos-vr/faturas', label: 'Faturas VR', icon: <FaReceipt /> },
  { key: 'analises', path: '/boletos-vr/analises', label: 'Análises', icon: <FaChartLine /> },
];

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

const formatCurrencyFromCents = (value) =>
  (Number(value || 0) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(String(value).length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('pt-BR');
};

const isOverdue = (dateValue, paidAt) => {
  if (paidAt || !dateValue) return false;

  const due = new Date(String(dateValue).length === 10 ? `${dateValue}T12:00:00` : dateValue);
  if (Number.isNaN(due.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return due < today;
};

const getFaturaStatus = (fatura) => {
  const coestipulantes = fatura?.coEstipulantes || [];
  if (!coestipulantes.length) return fatura?.manualStatus || 'faturado';

  if (coestipulantes.some((item) => isOverdue(item.dueDate, item.paidAt))) return 'atrasado';

  if (fatura?.manualStatus === 'pago') return 'pago';
  if (coestipulantes.every((item) => item.paidAt)) return 'pago';
  if (coestipulantes.every((item) => item.sentToCP)) return 'aprovado';
  return 'faturado';
};

const getFaturaTotal = (fatura) =>
  (fatura?.coEstipulantes || []).reduce(
    (acc, item) => acc + Number(item.valorCents || 0),
    0
  );

const getFirstDueDate = (fatura) =>
  (fatura?.coEstipulantes || []).find((item) => item.dueDate)?.dueDate || null;

const getPaidCount = (fatura) =>
  (fatura?.coEstipulantes || []).filter((item) => item.paidAt).length;

const getInitials = (value) => {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

function EmptyState({ message }) {
  return (
    <div className="bvr-empty">
      <FaFileInvoiceDollar />
      <span>{message}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`bvr-status bvr-status-${status}`}>{STATUS_LABEL[status] || status}</span>;
}

function BoletosVRDashboard({ faturas, boletos, metrics }) {
  const recentFaturas = faturas.slice(0, 5);
  const recentBoletos = boletos.slice(0, 5);

  return (
    <>
      <div className="bvr-kpis">
        <article className="bvr-kpi">
          <span>Faturas VR</span>
          <strong>{metrics.totalFaturas}</strong>
        </article>
        <article className="bvr-kpi">
          <span>A confirmar</span>
          <strong>{metrics.aConfirmar}</strong>
        </article>
        <article className="bvr-kpi">
          <span>Pagas</span>
          <strong>{metrics.pagas}</strong>
        </article>
        <article className="bvr-kpi">
          <span>Valor em faturas</span>
          <strong>{formatCurrencyFromCents(metrics.valorFaturas)}</strong>
        </article>
      </div>

      <div className="bvr-grid-two">
        <section className="bvr-panel">
          <header className="bvr-panel-header">
            <h3>Faturas recentes</h3>
          </header>
          {recentFaturas.length ? (
            <div className="bvr-list">
              {recentFaturas.map((fatura) => {
                const status = getFaturaStatus(fatura);
                return (
                  <div className="bvr-list-row" key={fatura.id}>
                    <div>
                      <strong>{fatura.estipulante?.name || 'Fatura sem estipulante'}</strong>
                      <span>{fatura.faturaNum || fatura.id}</span>
                    </div>
                    <div className="bvr-list-right">
                      <strong>{formatCurrencyFromCents(getFaturaTotal(fatura))}</strong>
                      <StatusBadge status={status} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState message="Nenhuma fatura registrada." />
          )}
        </section>

        <section className="bvr-panel">
          <header className="bvr-panel-header">
            <h3>Boletos recentes</h3>
          </header>
          {recentBoletos.length ? (
            <div className="bvr-list">
              {recentBoletos.map((boleto) => (
                <div className="bvr-list-row" key={boleto.id}>
                  <div>
                    <strong>{boleto.name || boleto.file_name || 'Boleto sem nome'}</strong>
                    <span>{formatDate(boleto.due_date)}</span>
                  </div>
                  <div className="bvr-list-right">
                    <strong>{formatCurrencyFromCents(boleto.value_cents)}</strong>
                    <span className="bvr-mini-muted">{boleto.paid_at ? 'Pago' : 'Aberto'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Nenhum boleto registrado." />
          )}
        </section>
      </div>
    </>
  );
}

function BoletosVRKanban({ faturas }) {
  const groups = useMemo(() => {
    const grouped = STATUS_COLUMNS.reduce((acc, column) => {
      acc[column.key] = [];
      return acc;
    }, {});

    faturas.forEach((fatura) => {
      grouped[getFaturaStatus(fatura)]?.push(fatura);
    });

    return grouped;
  }, [faturas]);

  return (
    <div className="bvr-kanban">
      {STATUS_COLUMNS.map((column) => (
        <section className={`bvr-column bvr-column-${column.key}`} key={column.key}>
          <header>
            <div>
              <span />
              <strong>{column.label}</strong>
            </div>
            <em>{groups[column.key].length}</em>
          </header>

          <div className="bvr-column-body">
            {groups[column.key].length ? (
              groups[column.key].map((fatura) => {
                const total = getFaturaTotal(fatura);
                const totalCo = fatura.coEstipulantes?.length || 0;
                const paid = getPaidCount(fatura);

                return (
                  <article className="bvr-card" key={fatura.id}>
                    <StatusBadge status={column.key} />
                    <h3>{fatura.estipulante?.name || 'Fatura sem estipulante'}</h3>
                    <span className="bvr-card-code">{fatura.faturaNum || fatura.id}</span>
                    <strong className="bvr-card-value">{formatCurrencyFromCents(total)}</strong>
                    <div className="bvr-card-meta">
                      <span>Vence {formatDate(getFirstDueDate(fatura))}</span>
                      <span>{paid}/{totalCo} pagos</span>
                    </div>
                    <div className="bvr-card-footer">
                      <span>{getInitials(fatura.uploaderName)}</span>
                      <small>{fatura.uploaderName || '-'}</small>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="bvr-column-empty">Sem faturas</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function BoletosVRFaturas({ faturas }) {
  return (
    <section className="bvr-panel">
      <header className="bvr-panel-header">
        <h3>Faturas VR</h3>
      </header>

      {faturas.length ? (
        <div className="bvr-table-wrap">
          <table className="bvr-table">
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
                const status = getFaturaStatus(fatura);
                const coestipulantes = fatura.coEstipulantes || [];

                return (
                  <tr key={fatura.id}>
                    <td>
                      <strong>{fatura.faturaNum || fatura.id}</strong>
                      <span>{formatDate(fatura.createdAt)}</span>
                    </td>
                    <td>{fatura.estipulante?.name || '-'}</td>
                    <td>{formatDate(getFirstDueDate(fatura))}</td>
                    <td>{coestipulantes.length}</td>
                    <td>{formatCurrencyFromCents(getFaturaTotal(fatura))}</td>
                    <td><StatusBadge status={status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState message="Nenhuma fatura registrada." />
      )}
    </section>
  );
}

function BoletosVRAnalises({ faturas, boletos, metrics }) {
  const uploaders = useMemo(() => {
    const map = new Map();

    [...faturas, ...boletos].forEach((item) => {
      const name = item.uploaderName || item.uploader_name || 'Sem responsável';
      map.set(name, (map.get(name) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [faturas, boletos]);

  const maxStatus = Math.max(1, ...STATUS_COLUMNS.map((item) => metrics.status[item.key] || 0));
  const maxUploader = Math.max(1, ...uploaders.map((item) => item.total));

  return (
    <div className="bvr-grid-two">
      <section className="bvr-panel">
        <header className="bvr-panel-header">
          <h3>Status das faturas</h3>
        </header>
        <div className="bvr-bars">
          {STATUS_COLUMNS.map((column) => {
            const total = metrics.status[column.key] || 0;
            return (
              <div className="bvr-bar-row" key={column.key}>
                <span>{column.label}</span>
                <div><strong style={{ width: `${(total / maxStatus) * 100}%` }} /></div>
                <em>{total}</em>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bvr-panel">
        <header className="bvr-panel-header">
          <h3>Responsáveis</h3>
        </header>
        {uploaders.length ? (
          <div className="bvr-bars">
            {uploaders.map((item) => (
              <div className="bvr-bar-row" key={item.name}>
                <span>{item.name}</span>
                <div><strong style={{ width: `${(item.total / maxUploader) * 100}%` }} /></div>
                <em>{item.total}</em>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Nenhum responsável encontrado." />
        )}
      </section>
    </div>
  );
}

export default function BoletosVR({ view = 'dashboard' }) {
  const location = useLocation();
  const [faturas, setFaturas] = useState([]);
  const [boletos, setBoletos] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function carregarDados() {
    try {
      setLoading(true);
      setError('');

      const [healthResult, faturasResult, boletosResult] = await Promise.allSettled([
        dashboardBoletosService.health(),
        dashboardBoletosService.listarFaturas(),
        dashboardBoletosService.listarBoletos(),
      ]);

      if (healthResult.status === 'fulfilled') setHealth(healthResult.value);

      if (faturasResult.status === 'fulfilled') setFaturas(Array.isArray(faturasResult.value) ? faturasResult.value : []);
      else throw faturasResult.reason;

      if (boletosResult.status === 'fulfilled') setBoletos(Array.isArray(boletosResult.value) ? boletosResult.value : []);
      else throw boletosResult.reason;
    } catch (err) {
      console.error('Erro ao carregar Boletos VR:', err);
      setError(err?.status === 401
        ? 'Sessão do módulo Boletos VR não autenticada.'
        : err?.message || 'Não foi possível carregar os dados de Boletos VR.');
      setFaturas([]);
      setBoletos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const metrics = useMemo(() => {
    const status = STATUS_COLUMNS.reduce((acc, column) => {
      acc[column.key] = 0;
      return acc;
    }, {});

    let valorFaturas = 0;

    faturas.forEach((fatura) => {
      const currentStatus = getFaturaStatus(fatura);
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

  const actions = (
    <button className="bvr-refresh" type="button" onClick={carregarDados} disabled={loading}>
      <FaSyncAlt className={loading ? 'spinning' : ''} />
      Atualizar
    </button>
  );

  return (
    <PageLayout
      title="Boletos VR"
      subtitle="Painel interno de faturas, boletos e pagamentos VR."
      actions={actions}
    >
      <div className="bvr-root">
        <div className="bvr-tabs" aria-label="Navegação de Boletos VR">
          {VIEWS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link className={active ? 'active' : ''} to={item.path} key={item.key}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="bvr-runtime">
          <span className={health?.status === 'ok' ? 'ok' : 'warn'}>
            {health?.status === 'ok' ? <FaCheckCircle /> : <FaClock />}
            Backend {health?.status || 'pendente'}
          </span>
          <span>{dashboardBoletosService.getBaseUrl()}</span>
        </div>

        {error && (
          <div className="bvr-alert">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bvr-loading">Carregando Boletos VR...</div>
        ) : (
          <>
            {view === 'dashboard' && (
              <BoletosVRDashboard faturas={faturas} boletos={boletos} metrics={metrics} />
            )}
            {view === 'kanban' && <BoletosVRKanban faturas={faturas} />}
            {view === 'faturas' && <BoletosVRFaturas faturas={faturas} />}
            {view === 'analises' && (
              <BoletosVRAnalises faturas={faturas} boletos={boletos} metrics={metrics} />
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
