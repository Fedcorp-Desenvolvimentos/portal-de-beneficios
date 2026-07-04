import { useMemo, useState } from 'react';
import {
  FaBolt,
  FaCheck,
  FaCheckCircle,
  FaCheckDouble,
  FaChevronDown,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaFileInvoice,
  FaPaperPlane,
  FaSort,
  FaSortDown,
  FaSortUp,
  FaSpinner,
  FaTrashAlt,
  FaUndo,
} from 'react-icons/fa';

import {
  computeStatus,
  fmtDate,
  formatBRL,
  isVerificar,
  userInitials,
} from '../helpers';

function getCoEstipulantes(fatura) {
  if (Array.isArray(fatura?.coEstipulantes)) {
    return fatura.coEstipulantes;
  }

  if (Array.isArray(fatura?.co_estipulantes)) {
    return fatura.co_estipulantes;
  }

  if (Array.isArray(fatura?.condominios)) {
    return fatura.condominios;
  }

  return [];
}

function getFaturaNum(fatura) {
  return (
    fatura?.faturaNum ||
    fatura?.fatura_num ||
    fatura?.numero_fatura ||
    fatura?.numero ||
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

function getEstipulanteName(fatura) {
  return (
    fatura?.estipulante?.name ||
    fatura?.estipulante?.nome ||
    fatura?.estipulante_nome ||
    fatura?.administradora_nome ||
    '—'
  );
}

function getUploaderName(fatura) {
  return (
    fatura?.uploaderName ||
    fatura?.uploader_name ||
    fatura?.usuario_nome ||
    fatura?.responsavel_nome ||
    '—'
  );
}

function getUploaderId(fatura) {
  return (
    fatura?.uploaderId ??
    fatura?.uploader_id ??
    fatura?.usuario_id ??
    fatura?.responsavel_id ??
    ''
  );
}

function getFaturaTotalCents(fatura) {
  const coEstipulantes = getCoEstipulantes(fatura);

  if (fatura?.totalCents !== undefined && fatura?.totalCents !== null) {
    return fatura.totalCents;
  }

  if (fatura?.total_cents !== undefined && fatura?.total_cents !== null) {
    return fatura.total_cents;
  }

  if (fatura?.valor_total_cents !== undefined && fatura?.valor_total_cents !== null) {
    return fatura.valor_total_cents;
  }

  if (fatura?.valor_total !== undefined && fatura?.valor_total !== null) {
    return moneyToCents(fatura.valor_total);
  }

  return coEstipulantes.reduce(
    (total, item) => total + Number(getCoValorCents(item) || 0),
    0
  );
}

function getCoIdx(item, index) {
  return item?.idx ?? item?.indice ?? item?.index ?? item?.id ?? index;
}

function getCoName(item) {
  return (
    item?.name ||
    item?.nome ||
    item?.condominio ||
    item?.condominio_nome ||
    item?.razao_social ||
    '—'
  );
}

function getCoCnpj(item) {
  return (
    item?.cnpj ||
    item?.documento ||
    item?.cpf_cnpj ||
    item?.cpfCnpj ||
    '—'
  );
}

function getCoValorCents(item) {
  if (item?.valorCents !== undefined && item?.valorCents !== null) {
    return item.valorCents;
  }

  if (item?.valor_cents !== undefined && item?.valor_cents !== null) {
    return item.valor_cents;
  }

  if (item?.valorCentavos !== undefined && item?.valorCentavos !== null) {
    return item.valorCentavos;
  }

  return moneyToCents(item?.valor_total ?? item?.valor ?? item?.total ?? 0);
}

function getCoDueDate(item) {
  return (
    item?.dueDate ||
    item?.due_date ||
    item?.vencimento ||
    item?.data_vencimento ||
    ''
  );
}

function getCoDataCredito(item) {
  return (
    item?.dataCredito ||
    item?.data_credito ||
    item?.credito ||
    ''
  );
}

function getCoPaidAt(item) {
  return (
    item?.paidAt ||
    item?.paid_at ||
    item?.data_pagamento ||
    item?.pago_em ||
    null
  );
}

function getCoSentToCP(item) {
  return Boolean(
    item?.sentToCP ||
    item?.sent_to_cp ||
    item?.enviado_cp ||
    item?.enviado_contas_pagar
  );
}

function getCoFormaPagamento(item) {
  return (
    item?.formaPagemento ||
    item?.formaPagamento ||
    item?.forma_pagamento ||
    ''
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

function sortFaturas(list, sortColumn, sortDir) {
  const STATUS_ORDER = {
    atrasado: 0,
    faturado: 1,
    aprovado: 2,
    pago: 3,
  };

  return [...list].sort((a, b) => {
    const statusA = computeStatus(a);
    const statusB = computeStatus(b);

    if (statusA === 'atrasado' && statusB !== 'atrasado') return -1;
    if (statusB === 'atrasado' && statusA !== 'atrasado') return 1;

    if (sortColumn === 'faturaNum') {
      const numberA = parseInt(getFaturaNum(a) || '0', 10);
      const numberB = parseInt(getFaturaNum(b) || '0', 10);

      return sortDir === 'asc' ? numberA - numberB : numberB - numberA;
    }

    if (sortColumn === 'emissao') {
      const dateA = getFaturaEmissao(a)
        ? new Date(`${getFaturaEmissao(a)}T12:00:00`).getTime()
        : 0;

      const dateB = getFaturaEmissao(b)
        ? new Date(`${getFaturaEmissao(b)}T12:00:00`).getTime()
        : 0;

      return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
    }

    if (sortColumn === 'status') {
      const orderA = STATUS_ORDER[statusA] ?? 99;
      const orderB = STATUS_ORDER[statusB] ?? 99;

      return sortDir === 'asc' ? orderA - orderB : orderB - orderA;
    }

    const dateA = getFaturaEmissao(a)
      ? new Date(`${getFaturaEmissao(a)}T12:00:00`).getTime()
      : 0;

    const dateB = getFaturaEmissao(b)
      ? new Date(`${getFaturaEmissao(b)}T12:00:00`).getTime()
      : 0;

    return dateB - dateA;
  });
}

function SortIcon({ active, dir }) {
  if (!active) {
    return <FaSort className="sort-icon sort-icon-off" />;
  }

  return dir === 'asc' ? (
    <FaSortUp className="sort-icon sort-icon-on" />
  ) : (
    <FaSortDown className="sort-icon sort-icon-on" />
  );
}

function CoRows({ coEstipulantes, faturaId, manualStatus, onTogglePago }) {
  const fatPago = manualStatus === 'pago';

  return coEstipulantes.map((item, index) => {
    const idx = getCoIdx(item, index);
    const paidAt = getCoPaidAt(item);
    const pago = Boolean(paidAt);
    const enviado = getCoSentToCP(item);
    const isPix = enviado && getCoFormaPagamento(item) === 'PIX';
    const dueDate = getCoDueDate(item);
    const overdue = isVerificar(dueDate, paidAt);

    let statusBadge;

    if (fatPago && enviado) {
      statusBadge = (
        <span className="badge-pago">
          <FaCheckCircle /> Pago
        </span>
      );
    } else if (enviado) {
      statusBadge = isPix ? (
        <span className="badge-enviado-cp badge-enviado-pix">
          <FaBolt /> Enviado PIX{' '}
          <span className="badge-urgente-sm">Urgente</span>
        </span>
      ) : (
        <span className="badge-enviado-cp">
          <FaPaperPlane /> Boleto VR Enviado
        </span>
      );
    } else if (pago) {
      statusBadge = (
        <span className="badge-pago">
          <FaCheckCircle /> Pago
        </span>
      );
    } else if (overdue) {
      statusBadge = (
        <span className="badge-verificar anim-pulse">
          <FaExclamationTriangle /> Confirmar Pagamento
        </span>
      );
    } else {
      statusBadge = (
        <span className="badge-faturado">
          <FaFileInvoice /> Faturado
        </span>
      );
    }

    const rowClass = (fatPago && enviado) || pago
      ? 'row-pago'
      : overdue
        ? 'row-verificar'
        : '';

    const showBtn = !enviado && !fatPago;

    return (
      <tr key={idx} className={rowClass}>
        <td className="co-name">{getCoName(item)}</td>
        <td className="co-cnpj">{getCoCnpj(item)}</td>
        <td className="co-valor">{formatBRL(getCoValorCents(item))}</td>
        <td className="co-venc">{fmtDate(dueDate)}</td>
        <td className="co-credito">{fmtDate(getCoDataCredito(item))}</td>
        <td>{statusBadge}</td>

        <td>
          {showBtn && (
            <button
              type="button"
              className={`btn-toggle-pago ${pago ? 'btn-desfazer' : 'btn-pagar'}`}
              onClick={(event) => {
                event.stopPropagation();
                onTogglePago(faturaId, idx);
              }}
            >
              {pago ? (
                <>
                  <FaUndo /> Desfazer
                </>
              ) : (
                <>
                  <FaCheck /> Pago
                </>
              )}
            </button>
          )}
        </td>
      </tr>
    );
  });
}

function FaturaRow({
  f,
  isOpen,
  onToggleOpen,
  onDelete,
  onPagarTodos,
  onTogglePago,
  onAbrirBoleto,
}) {
  const [deleting, setDeleting] = useState(false);
  const [pagandoTodos, setPagandoTodos] = useState(false);

  const coEstipulantes = getCoEstipulantes(f);
  const totalPago = coEstipulantes.filter((item) => getCoPaidAt(item)).length;
  const totalCount = coEstipulantes.length;

  const hasPaidNotSent = coEstipulantes.some(
    (item) => getCoPaidAt(item) && !getCoSentToCP(item)
  );

  const pct = totalCount ? Math.round((totalPago / totalCount) * 100) : 0;
  const status = computeStatus({
    ...f,
    coEstipulantes,
  });

  const statusBadge =
    status === 'pago' ? (
      <span className="fatura-status-badge fs-pago">
        <FaCheckCircle /> Pago
      </span>
    ) : status === 'aprovado' ? (
      <span className="fatura-status-badge fs-aprovado">
        <FaPaperPlane /> VR Enviado
      </span>
    ) : status === 'atrasado' ? (
      <span className="fatura-status-badge fs-verificar">
        <FaExclamationCircle /> Confirmar Pag.
      </span>
    ) : (
      <span className="fatura-status-badge fs-faturado">
        <FaFileInvoice /> Faturado
      </span>
    );

  async function handleDelete(event) {
    event.stopPropagation();

    if (
      !window.confirm(
        'Excluir esta fatura? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }

    setDeleting(true);

    const ok = await onDelete(f.id);

    if (!ok) {
      setDeleting(false);
    }
  }

  async function handlePagarTodos(event) {
    event.stopPropagation();

    setPagandoTodos(true);

    const ok = await onPagarTodos(f.id);

    if (!ok) {
      setPagandoTodos(false);
    }
  }

  function handleAbrirBoleto(event) {
    event.stopPropagation();
    onAbrirBoleto(f.id);
  }

  return (
    <tbody>
      <tr
        className={`fatura-row${status === 'pago' ? ' fatura-paga' : ''}`}
        onClick={() => onToggleOpen(f.id)}
      >
        <td>
          <div className="fatura-name-cell">
            <div
              className="resp-avatar"
              title={getUploaderName(f)}
            >
              {userInitials(getUploaderName(f))}
            </div>

            <div>
              <div className="fatura-estipulante-name">
                {getEstipulanteName(f)}
              </div>

              <div className="fatura-sub">
                {totalCount} condomínio(s)
              </div>
            </div>
          </div>
        </td>

        <td>
          <span className="fatura-num">
            {getFaturaNum(f) || '—'}
          </span>
        </td>

        <td>{fmtDate(getFaturaEmissao(f))}</td>

        <td>{statusBadge}</td>

        <td>
          <span className="fatura-valor">
            {formatBRL(getFaturaTotalCents(f))}
          </span>
        </td>

        <td>
          <div className="fatura-progress-cell">
            <span className="progress-text">
              {totalPago}/{totalCount} pagos
            </span>

            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </td>

        <td>
          <div className="fatura-row-actions">
            <button
              className="btn-delete-fatura"
              type="button"
              title="Excluir fatura"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? <FaSpinner className="fa-spin" /> : <FaTrashAlt />}
            </button>

            <FaChevronDown
              className="expand-icon"
              style={isOpen ? { transform: 'rotate(180deg)' } : undefined}
            />
          </div>
        </td>
      </tr>

      <tr
        className="fatura-detail-row"
        style={{ display: isOpen ? '' : 'none' }}
      >
        <td colSpan={7}>
          <div className="fatura-detail-wrap">
            <table className="co-subtable">
              <thead>
                <tr>
                  <th>Condomínio</th>
                  <th>CNPJ</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Dt. Crédito</th>
                  <th>Status</th>
                  <th className="th-action">
                    <div className="th-action-btns">
                      {status !== 'pago' && totalPago < totalCount && (
                        <button
                          className="btn-pagar-todos"
                          type="button"
                          disabled={pagandoTodos}
                          onClick={handlePagarTodos}
                        >
                          {pagandoTodos ? (
                            <>
                              <FaSpinner className="fa-spin" /> Aguarde...
                            </>
                          ) : (
                            <>
                              <FaCheckDouble /> Marcar todos
                            </>
                          )}
                        </button>
                      )}

                      {hasPaidNotSent && (
                        <button
                          className="btn-enviar-cp"
                          type="button"
                          onClick={handleAbrirBoleto}
                        >
                          Upload boleto VR
                        </button>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {coEstipulantes.length > 0 ? (
                  <CoRows
                    coEstipulantes={coEstipulantes}
                    faturaId={f.id}
                    manualStatus={f.manualStatus || f.manual_status}
                    onTogglePago={onTogglePago}
                  />
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                      Nenhum condomínio encontrado para esta fatura.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

export default function FaturasTable({
  faturas,
  filterUploaderId,
  filterStatus,
  filterSearch,
  openRows,
  onToggleOpen,
  onDelete,
  onPagarTodos,
  onTogglePago,
  onAbrirBoleto,
}) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const normalizedFaturas = useMemo(
    () => (Array.isArray(faturas) ? faturas : []),
    [faturas]
  );

  const filtered = useMemo(() => {
    let list = normalizedFaturas;

    if (filterUploaderId) {
      list = list.filter(
        (fatura) => String(getUploaderId(fatura)) === String(filterUploaderId)
      );
    }

    if (filterStatus) {
      list = list.filter((fatura) => {
        const coEstipulantes = getCoEstipulantes(fatura);

        return computeStatus({
          ...fatura,
          coEstipulantes,
        }) === filterStatus;
      });
    }

    if (filterSearch) {
      const query = filterSearch
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      list = list.filter((fatura) => {
        const coEstipulantes = getCoEstipulantes(fatura);

        const haystack = [
          getFaturaNum(fatura),
          getEstipulanteName(fatura),
          fatura?.estipulante?.cnpj,
          fatura?.estipulante_cnpj,
          ...coEstipulantes.flatMap((item) => [
            getCoName(item),
            getCoCnpj(item),
          ]),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        return haystack.includes(query);
      });
    }

    return list;
  }, [normalizedFaturas, filterUploaderId, filterStatus, filterSearch]);

  const sorted = useMemo(
    () => sortFaturas(filtered, sortColumn, sortDir),
    [filtered, sortColumn, sortDir]
  );

  function handleSortClick(column) {
    if (sortColumn === column) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortColumn(null);
        setSortDir('asc');
      }

      return;
    }

    setSortColumn(column);
    setSortDir('asc');
  }

  if (!sorted.length) {
    return (
      <p
        style={{
          padding: 32,
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '.88rem',
        }}
      >
        Nenhuma fatura encontrada.
      </p>
    );
  }

  return (
    <div className="table-responsive">
      <table className="faturas-table">
        <thead>
          <tr>
            <th>Estipulante</th>

            <th
              className="th-sortable"
              onClick={() => handleSortClick('faturaNum')}
            >
              Fatura{' '}
              <SortIcon
                active={sortColumn === 'faturaNum'}
                dir={sortDir}
              />
            </th>

            <th
              className="th-sortable"
              onClick={() => handleSortClick('emissao')}
            >
              Emissão{' '}
              <SortIcon
                active={sortColumn === 'emissao'}
                dir={sortDir}
              />
            </th>

            <th
              className="th-sortable"
              onClick={() => handleSortClick('status')}
            >
              Status{' '}
              <SortIcon
                active={sortColumn === 'status'}
                dir={sortDir}
              />
            </th>

            <th>Total</th>
            <th>Progresso</th>
            <th></th>
          </tr>
        </thead>

        {sorted.map((fatura) => (
          <FaturaRow
            key={fatura.id}
            f={fatura}
            isOpen={openRows.has(fatura.id)}
            onToggleOpen={onToggleOpen}
            onDelete={onDelete}
            onPagarTodos={onPagarTodos}
            onTogglePago={onTogglePago}
            onAbrirBoleto={onAbrirBoleto}
          />
        ))}
      </table>
    </div>
  );
}