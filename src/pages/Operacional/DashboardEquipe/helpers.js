export const moneyToCents = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return Math.round(value * 100);
  }

  const clean = String(value)
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const number = Number(clean);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(number * 100);
};

export const normalizeMoneyCents = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  const clean = String(value).trim();

  if (!clean) {
    return 0;
  }

  if (clean.includes(',') || clean.includes('R$')) {
    return moneyToCents(clean);
  }

  const number = Number(clean);

  return Number.isFinite(number) ? number : 0;
};

export const formatBRL = (value) => {
  const cents = normalizeMoneyCents(value);

  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const fmtDate = (value) => {
  if (!value) return '—';

  const raw = String(value).trim();

  if (!raw) return '—';

  if (raw.includes('/')) {
    return raw;
  }

  const date = new Date(raw.length === 10 ? `${raw}T12:00:00` : raw);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('pt-BR');
};

export const normalizeDateOnly = (value) => {
  if (!value) return '';

  const raw = String(value).trim();

  if (!raw) return '';

  if (raw.includes('/')) {
    const [day, month, year] = raw.split('/');

    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return '';
  }

  if (raw.length >= 10) {
    return raw.slice(0, 10);
  }

  return '';
};

export function isVerificar(dueDate, paidAt) {
  if (paidAt || !dueDate) return false;

  const normalizedDueDate = normalizeDateOnly(dueDate);

  if (!normalizedDueDate) return false;

  const today = new Date().toISOString().slice(0, 10);

  return today > normalizedDueDate;
}

export function userInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return '?';

  return (
    parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')
  ).toUpperCase();
}

export function getCoEstipulantes(fatura) {
  if (Array.isArray(fatura?.coEstipulantes)) {
    return fatura.coEstipulantes;
  }

  if (Array.isArray(fatura?.co_estipulantes)) {
    return fatura.co_estipulantes;
  }

  if (Array.isArray(fatura?.condominios)) {
    return fatura.condominios;
  }

  if (Array.isArray(fatura?.itens)) {
    return fatura.itens;
  }

  return [];
}

export function getManualStatus(fatura) {
  return (
    fatura?.manualStatus ||
    fatura?.manual_status ||
    fatura?.status_manual ||
    ''
  );
}

export function getPaidAt(item) {
  return (
    item?.paidAt ||
    item?.paid_at ||
    item?.data_pagamento ||
    item?.pago_em ||
    item?.dt_pagamento ||
    null
  );
}

export function getSentToCP(item) {
  return Boolean(
    item?.sentToCP ||
      item?.sent_to_cp ||
      item?.enviado_cp ||
      item?.enviado_contas_pagar ||
      item?.enviadoContasPagar
  );
}

export function getDueDate(item) {
  return (
    item?.dueDate ||
    item?.due_date ||
    item?.vencimento ||
    item?.data_vencimento ||
    item?.dt_vencimento ||
    ''
  );
}

export function computeStatus(fatura) {
  const manualStatus = getManualStatus(fatura);

  if (manualStatus) {
    return manualStatus;
  }

  const cos = getCoEstipulantes(fatura);

  if (!cos.length) {
    return 'faturado';
  }

  const allSentToCP = cos.every((item) => getSentToCP(item));
  const allPaid = cos.every((item) => Boolean(getPaidAt(item)));
  const hasOverdue = cos.some((item) => isVerificar(getDueDate(item), getPaidAt(item)));

  if (allPaid && allSentToCP) {
    return 'pago';
  }

  if (allSentToCP) {
    return 'aprovado';
  }

  if (hasOverdue) {
    return 'atrasado';
  }

  return 'faturado';
}

export const PERF_AVATARS = {
  gabriele: '/assets-boletos/avatars/gabi-avatar.png',
  gabi: '/assets-boletos/avatars/gabi-avatar.png',
  kelly: '/assets-boletos/avatars/kelly-avatar.png',
  brenda: '/assets-boletos/avatars/brenda-avatar.png',
};

export const ST_LABEL = {
  faturado: 'Faturado',
  atrasado: 'Confirmar Pagamento',
  aprovado: 'Boleto VR Enviado',
  pago: 'Pago',
};

export const ST_COLOR = {
  faturado: '#6366f1',
  atrasado: '#dc4c4c',
  aprovado: '#e67c1e',
  pago: '#2b9e6e',
};