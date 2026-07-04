import { useMemo } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaCalendarCheck,
  FaCheckCircle,
  FaCoins,
  FaFileInvoiceDollar,
} from 'react-icons/fa';

import {
  computeStatus,
  formatBRL,
  getCoEstipulantes,
  ST_COLOR,
  ST_LABEL,
} from '../helpers';

import styles from '../DashboardEquipe.module.css';

function getUploaderId(fatura) {
  return (
    fatura?.uploaderId ??
    fatura?.uploader_id ??
    fatura?.usuario_id ??
    fatura?.responsavel_id ??
    fatura?.created_by ??
    fatura?.created_by_id ??
    ''
  );
}

function getUploaderName(fatura) {
  return (
    fatura?.uploaderName ||
    fatura?.uploader_name ||
    fatura?.usuario_nome ||
    fatura?.responsavel_nome ||
    fatura?.created_by_name ||
    ''
  );
}

function getFaturaEmissao(fatura) {
  return (
    fatura?.emissao ||
    fatura?.data_emissao ||
    fatura?.createdAt ||
    fatura?.created_at ||
    ''
  );
}

function getFaturaTotalCents(fatura) {
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
    (total, item) => total + getCoValorCents(item),
    0
  );
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

function parseDate(value) {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();

  if (!raw) {
    return null;
  }

  if (raw.includes('/')) {
    const [day, month, year] = raw.split('/');

    if (day && month && year) {
      const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        12,
        0,
        0
      );

      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(raw.length === 10 ? `${raw}T12:00:00` : raw);

  return Number.isNaN(date.getTime()) ? null : date;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}`;
}

function sameUser(fatura, userId, userName) {
  const uploaderId = getUploaderId(fatura);
  const uploaderName = getUploaderName(fatura);

  if (
    userId !== undefined &&
    userId !== null &&
    String(userId).trim() &&
    uploaderId !== undefined &&
    uploaderId !== null &&
    String(uploaderId).trim()
  ) {
    return String(uploaderId) === String(userId);
  }

  if (userName && uploaderName) {
    return (
      String(uploaderName).trim().toLowerCase() ===
      String(userName).trim().toLowerCase()
    );
  }

  return false;
}

export default function PersonalSection({ faturas, userId, userName }) {
  const data = useMemo(() => {
    if (!userId && !userName) return null;

    const list = Array.isArray(faturas) ? faturas : [];
    const mine = list.filter((fatura) => sameUser(fatura, userId, userName));

    const now = new Date();
    const curKey = monthKey(now);

    const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastKey = monthKey(lastDate);

    let thisMon = 0;
    let lastMon = 0;
    let totalCents = 0;
    let pagas = 0;

    const statusCount = {
      faturado: 0,
      atrasado: 0,
      aprovado: 0,
      pago: 0,
    };

    mine.forEach((fatura) => {
      totalCents += getFaturaTotalCents(fatura);

      const status = computeStatus(fatura);
      statusCount[status] = (statusCount[status] || 0) + 1;

      if (status === 'pago') {
        pagas += 1;
      }

      const date = parseDate(getFaturaEmissao(fatura));

      if (date) {
        const key = monthKey(date);

        if (key === curKey) {
          thisMon += 1;
        }

        if (key === lastKey) {
          lastMon += 1;
        }
      }
    });

    const months = [];

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      months.push({
        key: monthKey(date),
        label: date
          .toLocaleDateString('pt-BR', { month: 'short' })
          .replace('.', ''),
        count: 0,
        isCurrent: i === 0,
      });
    }

    mine.forEach((fatura) => {
      const date = parseDate(getFaturaEmissao(fatura));

      if (!date) {
        return;
      }

      const key = monthKey(date);
      const slot = months.find((month) => month.key === key);

      if (slot) {
        slot.count += 1;
      }
    });

    const maxCount = Math.max(...months.map((month) => month.count), 1);

    return {
      mine,
      thisMon,
      lastMon,
      totalCents,
      pagas,
      statusCount,
      months,
      maxCount,
    };
  }, [faturas, userId, userName]);

  if (!data) return null;

  const {
    mine,
    thisMon,
    lastMon,
    totalCents,
    pagas,
    statusCount,
    months,
    maxCount,
  } = data;

  const totalMine = mine.length || 1;

  const trendBadge = (cur, prev) => {
    if (!prev && !cur) {
      return (
        <span className={`${styles['ps-trend']} ${styles['ps-trend-neu']}`}>
          sem registros este mês
        </span>
      );
    }

    if (!prev) {
      return (
        <span className={`${styles['ps-trend']} ${styles['ps-trend-neu']}`}>
          primeiro mês com registros
        </span>
      );
    }

    const pct = ((cur - prev) / prev) * 100;

    if (pct > 0) {
      return (
        <span className={`${styles['ps-trend']} ${styles['ps-trend-up']}`}>
          <FaArrowUp /> +{pct.toFixed(1)}% vs mês passado
        </span>
      );
    }

    if (pct < 0) {
      return (
        <span className={`${styles['ps-trend']} ${styles['ps-trend-dn']}`}>
          <FaArrowDown /> {Math.abs(pct).toFixed(1)}% vs mês passado
        </span>
      );
    }

    return (
      <span className={`${styles['ps-trend']} ${styles['ps-trend-neu']}`}>
        igual ao mês passado
      </span>
    );
  };

  const statusEntries = Object.entries(statusCount).filter(([, value]) => value > 0);

  return (
    <div className={styles['ps-section-inner']}>
      <div className={styles['ps-kpi-row']}>
        <div className={styles['ps-kpi-card']}>
          <div
            className={styles['ps-kpi-icon']}
            style={{ background: '#e8f3fc', color: 'var(--accent)' }}
          >
            <FaFileInvoiceDollar />
          </div>

          <div className={styles['ps-kpi-label']}>Minhas Faturas</div>
          <div className={styles['ps-kpi-value']}>{mine.length}</div>

          <span className={`${styles['ps-trend']} ${styles['ps-trend-neu']}`}>
            total importadas
          </span>
        </div>

        <div className={styles['ps-kpi-card']}>
          <div
            className={styles['ps-kpi-icon']}
            style={{ background: '#e8f6f0', color: 'var(--success)' }}
          >
            <FaCalendarCheck />
          </div>

          <div className={styles['ps-kpi-label']}>Este Mês</div>
          <div className={styles['ps-kpi-value']}>{thisMon}</div>

          {trendBadge(thisMon, lastMon)}
        </div>

        <div className={styles['ps-kpi-card']}>
          <div
            className={styles['ps-kpi-icon']}
            style={{ background: '#fef3e8', color: 'var(--warning)' }}
          >
            <FaCoins />
          </div>

          <div className={styles['ps-kpi-label']}>Valor Total</div>

          <div
            className={`${styles['ps-kpi-value']} ${styles['ps-kpi-value-sm']}`}
          >
            {formatBRL(totalCents)}
          </div>

          <span className={`${styles['ps-trend']} ${styles['ps-trend-neu']}`}>
            faturado por mim
          </span>
        </div>

        <div className={styles['ps-kpi-card']}>
          <div
            className={styles['ps-kpi-icon']}
            style={{ background: '#e8f6f0', color: 'var(--success)' }}
          >
            <FaCheckCircle />
          </div>

          <div className={styles['ps-kpi-label']}>Faturas Pagas</div>
          <div className={styles['ps-kpi-value']}>{pagas}</div>

          <span className={`${styles['ps-trend']} ${styles['ps-trend-neu']}`}>
            de {mine.length} importadas
          </span>
        </div>
      </div>

      <div className={styles['ps-charts-row']}>
        <div className={styles['ps-chart-card']}>
          <div className={styles['ps-chart-header']}>
            <div>
              <div className={styles['ps-chart-title']}>Minha Evolução</div>
              <div className={styles['ps-chart-sub']}>
                Faturas importadas - Últimos 6 meses
              </div>
            </div>

            <div className={styles['ps-chart-legend']}>
              <span>
                <span
                  className={`${styles['ps-legend-dot']} ${styles['ps-legend-prev']}`}
                />
                Anteriores
              </span>

              <span>
                <span
                  className={`${styles['ps-legend-dot']} ${styles['ps-legend-cur']}`}
                />
                Este mês
              </span>
            </div>
          </div>

          <div className={styles['ps-bar-chart-wrap']}>
            <div className={styles['ps-bar-chart']}>
              {months.map((month) => {
                const pct = Math.max(
                  Math.round((month.count / maxCount) * 100),
                  month.count > 0 ? 10 : 4
                );

                return (
                  <div
                    key={month.key}
                    className={styles['ps-bar-col']}
                    title={`${month.count} fatura${
                      month.count !== 1 ? 's' : ''
                    }`}
                  >
                    <div className={styles['ps-bar-wrap']}>
                      <div
                        className={`${styles['ps-bar-fill']} ${
                          month.isCurrent ? styles['ps-bar-current'] : ''
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                    </div>

                    <span className={styles['ps-bar-label']}>
                      {month.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles['ps-chart-card']}>
          <div className={styles['ps-chart-header']}>
            <div>
              <div className={styles['ps-chart-title']}>Por Status</div>
              <div className={styles['ps-chart-sub']}>
                Distribuição das minhas faturas
              </div>
            </div>
          </div>

          <div className={styles['ps-status-list']}>
            {statusEntries.length ? (
              statusEntries.map(([status, count]) => {
                const pct = Math.round((count / totalMine) * 100);

                return (
                  <div key={status}>
                    <div className={styles['ps-status-top']}>
                      <div className={styles['ps-status-name']}>
                        <span
                          className={styles['ps-status-dot']}
                          style={{ background: ST_COLOR[status] }}
                        />
                        {ST_LABEL[status] || status}
                      </div>

                      <span className={styles['ps-status-val']}>
                        {count}{' '}
                        <span className={styles['ps-status-pct']}>
                          ({pct}%)
                        </span>
                      </span>
                    </div>

                    <div className={styles['ps-status-bar-bg']}>
                      <div
                        className={styles['ps-status-bar-fill']}
                        style={{
                          width: `${pct}%`,
                          background: ST_COLOR[status],
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles['ps-empty']}>Nenhuma fatura ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}