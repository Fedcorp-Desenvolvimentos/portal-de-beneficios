// pages/ColaboradorDashboard/ColaboradorDashboardStyles.js
import styled, { keyframes, css } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
`;

const skeletonBackground = css`
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

export const S = {
  Root: styled.div`
    --font: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      sans-serif;
    --mono: 'Geist Mono', monospace;
    --bg: var(--color-bg-secondary);
    --surface: var(--color-bg-primary);
    --border: var(--color-border-light);
    --border2: var(--color-border);
    --text: var(--color-text-primary);
    --sub: var(--color-text-tertiary);
    --accent: var(--color-primary);
    --accent-l: var(--color-primary-bg);
    --danger: var(--color-danger);
  `,

  PageHeader: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;
  `,

  StatsMini: styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 640px) {
      width: 100%;
      justify-content: space-between;
    }
  `,

  StatMini: styled.div`
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    padding: 16px 20px;
    min-width: 100px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border-left: 3px solid ${({ $color }) => $color || 'transparent'};

    .value {
      font-size: 28px;
      font-weight: 700;
      color: ${({ $color }) => $color || '#2563eb'};
    }

    .label {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
  `,

  Filters: styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
  `,

  Search: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 9px 12px;
    flex: 1;
    min-width: 220px;
    transition: border-color 0.15s;

    &:focus-within {
      border-color: var(--accent);
    }

    input {
      border: 0;
      outline: 0;
      background: transparent;
      font-family: var(--font);
      font-size: 13px;
      color: var(--text);
      width: 100%;

      &::placeholder {
        color: var(--sub);
      }
    }
  `,

  SearchClear: styled.button`
    background: none;
    border: 0;
    cursor: pointer;
    color: var(--sub);
    padding: 0;
    display: inline-flex;
    align-items: center;

    &:hover {
      color: var(--text);
    }
  `,

  Select: styled.select`
    padding: 9px 12px;
    border-radius: 10px;
    font-family: var(--font);
    font-size: 13px;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    cursor: pointer;
    transition: border-color 0.15s;

    &:focus {
      outline: 0;
      border-color: var(--accent);
    }
  `,

  DateFilter: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 4px 10px;
    transition: border-color 0.15s;

    &:focus-within {
      border-color: var(--accent);
    }

    span {
      font-size: 13px;
      color: var(--sub);
      white-space: nowrap;
    }

    .datepicker-custom {
      border: 0;
      outline: 0;
      background: transparent;
      font-family: var(--font);
      font-size: 13px;
      color: var(--text);
      width: 100px;
      cursor: pointer;

      &::placeholder {
        color: var(--sub);
      }
    }
  `,

  TableWrap: styled.div`
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow-x: auto;
    overflow-y: visible;

    @media (max-width: 1600px) {
      overflow: visible;
    }
  `,

  Table: styled.table`
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    min-width: 1244px;
    font-size: 13px;

    thead th {
      background: var(--bg);
      padding: 14px 10px;
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--sub);
      font-weight: 600;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    tbody td {
      padding: 14px 10px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover td {
      background: var(--color-bg-tertiary);
    }

      th:nth-child(1),
      td:nth-child(1) {
        width: 4%;
        padding-right: 0;
      }

    th:nth-child(2),
    td:nth-child(2) {
      width: 200px;
    }

    th:nth-child(3),
    td:nth-child(3) {
      width: 130px;
    }

    th:nth-child(4),
    td:nth-child(4) {
      width: 90px;
    }

    th:nth-child(5),
    td:nth-child(5) {
      width: 95px;
      color: #dc2626;
    }

    th:nth-child(6),
    td:nth-child(6) {
      width: 90px;
    }

    th:nth-child(7),
    td:nth-child(7) {
      width: 90px;
    }

    th:nth-child(8),
    td:nth-child(8) {
      width: 100px;
    }

    th:nth-child(9),
    td:nth-child(9) {
      width: 150px;
      min-width: 150px;
      max-width: 150px;
    }

    th:nth-child(10),
    td:nth-child(10) {
      width: 44px;
      min-width: 44px;
      max-width: 44px;
      text-align: center;
      padding-left: 4px;
      padding-right: 4px;
    }

    td:nth-child(10) > button {
      min-width: 32px;
      width: 32px;
      height: 32px;
      padding: 0;
      justify-content: center;
    }

    th:nth-child(11),
    td:nth-child(11) {
      width: 44px;
      min-width: 44px;
      max-width: 44px;
      text-align: center;
      padding-left: 4px;
      padding-right: 4px;
    }

    td:nth-child(11) > button {
      min-width: 32px;
      width: 32px;
      height: 32px;
      padding: 0;
      justify-content: center;
    }

    th:nth-child(12),
    td:nth-child(12) {
      width: 72px;
      min-width: 72px;
      max-width: 72px;
      text-align: center;
      padding-left: 4px;
      padding-right: 4px;
    }

    td:nth-child(12) > button {
      min-width: 32px;
      width: 32px;
      height: 32px;
      padding: 0;
      justify-content: center;
    }

    td:nth-child(12) > div {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    th:nth-child(13),
    td:nth-child(13) {
      width: 110px;
      min-width: 110px;
      text-align: center;
      white-space: nowrap;
      padding-left: 16px;
    }

    td:nth-child(13) > button {
      min-width: 36px;
      width: 36px;
      height: 32px;
      padding: 0;
      justify-content: center;
    }

    td:nth-child(13) > span {
      white-space: nowrap;
    }

    th:nth-child(14),
    td:nth-child(14) {
      width: 44px;
      min-width: 44px;
      max-width: 44px;
      text-align: center;
      padding-left: 4px;
      padding-right: 4px;
    }

    td:nth-child(14) > button {
      min-width: 32px;
      width: 32px;
      height: 32px;
      padding: 0;
      justify-content: center;
    }

    @media (max-width: 1600px) {
      width: 100%;
      min-width: 0;
      table-layout: auto;

      thead th {
        padding: 11px 4px;
        font-size: 8px;
        letter-spacing: 0.04em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      tbody td {
        padding: 10px 4px;
        font-size: 11px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      tbody td.cd-actions-td {
        overflow: visible;
      }

      th:nth-child(1),
      td:nth-child(1) {
        width: 24px;
        min-width: 24px;
        max-width: 24px;
        padding: 10px 0 10px 4px;
      }

      th:nth-child(2),
      td:nth-child(2) {
        padding-left: 2px;
      }

      th:nth-child(3),
      td:nth-child(3) {
        white-space: nowrap;
      }

      th:nth-child(4),
      td:nth-child(4) {
        white-space: nowrap;
      }

      th:nth-child(5),
      td:nth-child(5) {
        white-space: nowrap;
      }

      th:nth-child(6),
      td:nth-child(6) {
        white-space: nowrap;
      }

      th:nth-child(7),
      td:nth-child(7) {
        white-space: nowrap;
      }

      th:nth-child(8),
      td:nth-child(8) {
      }

      th:nth-child(9),
      td:nth-child(9) {
        min-width: 0;
        max-width: none;
        overflow: visible;
      }

      td:nth-child(9) button {
        min-width: 0;
        width: auto;
        height: 34px;
        padding: 0 8px;
      }

      th:nth-child(10),
      td:nth-child(10) {
        min-width: 0;
        max-width: none;
        text-align: center;
      }

      th:nth-child(11),
      td:nth-child(11) {
        min-width: 0;
        max-width: none;
        text-align: center;
      }

      th:nth-child(12),
      td:nth-child(12) {
        min-width: 0;
        max-width: none;
        text-align: center;
      }

      th:nth-child(13),
      td:nth-child(13) {
        min-width: 0;
        max-width: none;
        text-align: center;
        white-space: nowrap;
      }

      th:nth-child(14),
      td:nth-child(14) {
        min-width: 0;
        max-width: none;
        text-align: center;
      }
    }

    @media (max-width: 1366px) {
      thead th {
        padding: 10px 3px;
        font-size: 7px;
        letter-spacing: 0.02em;
      }

      tbody td {
        padding: 8px 3px;
        font-size: 10px;
      }

      th:nth-child(1),
      td:nth-child(1) {
        width: 24px;
        min-width: 24px;
        max-width: 24px;
        padding: 8px 0 8px 3px;
      }
    }
  `,

  IdMain: styled.div`
    font-weight: 600;
    font-size: 13px;
  `,

  IdSub: styled.div`
    font-size: 11px;
    color: var(--sub);
    margin-top: 4px;
  `,

  AdminCell: styled.td`
    max-width: 220px;
    min-width: 0;
  `,

  AdminName: styled.div`
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--text);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
  `,

  Inline: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--sub);
    font-size: 13px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    svg {
      flex-shrink: 0;
    }

    @media (max-width: 1600px) {
      gap: 4px;
      font-size: 11px;
    }

    @media (max-width: 1366px) {
      gap: 3px;
      font-size: 10px;

      svg {
        width: 12px;
        height: 12px;
      }
    }
  `,

  Empty: styled.td`
    padding: 48px !important;
    text-align: center;
    color: var(--sub);
    font-size: 13px;
  `,

  StatusSelect: styled.div`
    width: 100%;
    min-width: 0;
    overflow: hidden;

    select {
      width: 100%;
      min-width: 0;
      max-width: 100%;
      padding: 6px 26px 6px 9px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      font-family: var(--font);
      background: ${({ $status }) => {
      switch ($status) {
        case 'faturado':
          return '#eff6ff';
        case 'cancelado':
          return '#fef2f2';
        case 'em_faturamento':
          return '#fffbeb';
        case 'comprado':
          return '#f0fdf4';
        case 'pago_parcialmente':
          return '#f5f3ff';
        default:
          return '#f0fdf4';
      }
    }};
      border: 1px solid
        ${({ $status }) => {
      switch ($status) {
        case 'faturado':
          return '#bfdbfe';
        case 'cancelado':
          return '#fee2e2';
        case 'em_faturamento':
          return '#fde68a';
        case 'comprado':
          return '#bbf7d0';
        case 'pago_parcialmente':
          return '#ddd6fe';
        default:
          return '#bbf7d0';
      }
    }};
      color: ${({ $status }) => {
      switch ($status) {
        case 'faturado':
          return '#2563eb';
        case 'cancelado':
          return '#dc2626';
        case 'em_faturamento':
          return '#d97706';
        case 'comprado':
          return '#16a34a';
        case 'pago_parcialmente':
          return '#7c3aed';
        default:
          return '#16a34a';
      }
    }};
      cursor: pointer;
      transition: all 0.15s;
      text-overflow: ellipsis;

      &:focus {
        outline: none;
      }
    }

    @media (max-width: 1600px) {
      select {
        padding: 6px 22px 6px 8px;
        font-size: 10px;
      }
    }

    @media (max-width: 1366px) {
      select {
        padding: 5px 19px 5px 6px;
        font-size: 9px;
      }
    }
  `,

  Btn: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);

    &:hover:not(:disabled) {
      background: var(--bg);
      border-color: var(--border2);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    ${({ $variant }) =>
      $variant === 'primary' &&
      css`
        background: #2563eb;
        border-color: #2563eb;
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #1d4ed8;
          border-color: #1d4ed8;
        }

        &:focus-visible {
          outline: 3px solid rgba(37, 99, 235, 0.25);
          outline-offset: 2px;
        }
      `}

    ${({ $variant }) =>
      $variant === 'secondary' &&
      css`
        color: var(--sub);
      `}

    ${({ $variant }) =>
      $variant === 'danger' &&
      css`
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.3);

        &:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.4);
          color: #dc2626;
        }
      `}

    ${({ $size }) =>
      $size === 'sm' &&
      css`
        padding: 5px 10px;
        font-size: 11px;
      `}
  `,

  RowActions: styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  `,

  ActionsMenuWrap: styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
    overflow: visible;
  `,

  ActionsMenuButton: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 78px;
    height: 34px;
    padding: 0 8px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: #ffffff;
    color: var(--text);
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font);
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    transition:
      background 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;

    svg {
      flex-shrink: 0;
    }

    &:hover {
      background: var(--bg);
      border-color: var(--border2);
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
    }

    @media (max-width: 1440px) {
      min-width: 68px;
      height: 32px;
      padding: 0 5px;
      font-size: 10px;
      gap: 3px;
    }

    @media (max-width: 1366px) {
      min-width: 62px;
      height: 30px;
      padding: 0 4px;
      font-size: 9px;

      svg {
        width: 13px;
        height: 13px;
      }
    }
  `,

  ActionsDropdown: styled.div`
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 1000;
    width: min(230px, calc(100vw - 32px));
    padding: 8px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: #ffffff;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
    display: grid;
    gap: 4px;

    @media (max-width: 1440px) {
      width: 220px;
    }

    @media (max-width: 640px) {
      right: 0;
      width: min(220px, calc(100vw - 24px));
    }
  `,

  ActionItem: styled.button`
    width: 100%;
    min-height: 38px;
    padding: 9px 10px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--text);
    display: grid;
    grid-template-columns: 18px 1fr;
    align-items: center;
    gap: 10px;
    text-align: left;
    font-family: var(--font);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    line-height: 1.25;

    svg {
      width: 16px;
      height: 16px;
      color: #64748b;
    }

    span {
      display: block;
      white-space: normal;
    }

    &:hover:not(:disabled) {
      background: #f8fafc;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.primary {
      background: #2563eb;
      color: #ffffff;

      svg {
        color: #ffffff;
      }

      &:hover:not(:disabled) {
        background: #1d4ed8;
      }
    }

    &.danger {
      color: #ef4444;

      svg {
        color: #ef4444;
      }

      &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.08);
        color: #dc2626;

        svg {
          color: #dc2626;
        }
      }
    }
  `,

  ActionStatus: styled.div`
    margin-top: 4px;
    padding: 9px 10px 6px;
    font-size: 12px;
    color: #64748b;
    border-top: 1px solid var(--border);
    text-align: center;
  `,

  Timeline: styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 8px 0;
  `,

  TimelineStep: styled.div`
    position: relative;
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 10px;
    padding-bottom: 18px;

    &:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 16px;
      top: 28px;
      bottom: -2px;
      width: 2px;
      background: #e5e7eb;
    }
  `,

  TimelineMarker: styled.div`
    z-index: 1;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $done }) => ($done ? '#dcfce7' : '#e5e7eb')};
    color: ${({ $done }) => ($done ? '#16a34a' : '#64748b')};

    ${({ $current }) =>
      $current &&
      css`
        background: #dbeafe;
        color: #2563eb;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
      `}
  `,

  TimelineContent: styled.div`
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;

    ${({ $current }) =>
      $current &&
      css`
        border-color: #93c5fd;
        background: #eff6ff;
      `}
  `,

  TimelineTop: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;

    strong {
      font-size: 13px;
      color: #0f172a;
    }

    span {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
    }
  `,

  TimelineDescription: styled.p`
    margin: 4px 0 0;
    font-size: 12px;
    color: #64748b;
  `,

  Pagination: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 14px;
    padding: 12px 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    flex-wrap: wrap;

    @media (max-width: 640px) {
      align-items: stretch;

      .actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  `,

  PaginationInfo: styled.div`
    font-size: 12px;
    color: var(--sub);
  `,

  PaginationActions: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
  `,

  PaginationPage: styled.span`
    font-size: 12px;
    color: var(--sub);
    white-space: nowrap;
  `,

  Overlay: styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    padding-left: ${(props) =>
      props.$sidebarWidth != null
        ? `calc(${props.$sidebarWidth}px + 16px)`
        : '16px'};
    z-index: 9999;
    backdrop-filter: blur(2px);

    @media (max-width: 768px) {
      padding-left: 16px;
    }
  `,

  Modal: styled.div`
    width: min(640px, 100%);
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    border: 1px solid var(--border);
    max-height: 90vh;
    overflow-y: auto;
  `,

  BoletoModal: styled.div`
    width: 100%;
    max-width: 980px;
    background: var(--surface);
    border-radius: 18px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
    overflow: hidden;
    border: 1px solid var(--border);
    max-height: 90vh;
    display: flex;
    flex-direction: column;

    @media (max-width: 760px) {
      max-height: 92vh;
      border-radius: 14px;
    }

    @media (max-width: 480px) {
      max-height: 100vh;
      min-height: 100vh;
      border-radius: 0;
    }
  `,

  ModalHeader: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 22px;
    border-bottom: 1px solid var(--border);

    @media (max-width: 480px) {
      padding: 14px 16px;
    }
  `,

  ModalTitle: styled.div`
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 2px;
  `,

  ModalSub: styled.div`
    font-size: 12px;
    color: var(--sub);
  `,

  ModalClose: styled.button`
    background: transparent;
    border: 0;
    color: var(--sub);
    cursor: pointer;
    padding: 2px;
    border-radius: 6px;
    transition: background 0.15s;

    &:hover {
      background: var(--bg);
      color: var(--text);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,

  ModalBody: styled.div`
    padding: 20px 22px;
    display: grid;
    gap: 16px;
  `,

  BoletoModalBody: styled.div`
    padding: 0;
    overflow: hidden;
  `,

  BoletoTableWrap: styled.div`
    width: 100%;
    max-height: 460px;
    overflow-y: auto;
    overflow-x: hidden;
    border-bottom: 1px solid var(--border);

    @media (max-width: 1440px) {
      max-height: 420px;
    }

    @media (max-width: 1280px) {
      overflow-x: auto;
      max-height: 390px;
    }

    @media (max-width: 760px) {
      max-height: 55vh;
    }

    @media (max-width: 480px) {
      max-height: none;
      flex: 1;
    }
  `,

  BoletoTable: styled.table`
    width: 100%;
    min-width: 0;
    border-collapse: collapse;
    table-layout: fixed;

    thead th {
      position: sticky;
      top: 0;
      z-index: 2;
      background: #f8fafc;
      padding: 12px 14px;
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--sub);
      font-weight: 700;
      text-align: left;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    tbody td {
      padding: 12px 14px;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover td {
      background: #f8fafc;
    }

    th:nth-child(1),
    td:nth-child(1) {
      width: 52px;
      text-align: center;
    }

    th:nth-child(2),
    td:nth-child(2) {
      width: auto;
      min-width: 0;
    }

    th:nth-child(3),
    td:nth-child(3) {
      width: 170px;
    }

    th:nth-child(4),
    td:nth-child(4) {
      width: 130px;
    }

    th:nth-child(5),
    td:nth-child(5) {
      width: 130px;
      text-align: right;
    }

    th:nth-child(6),
    td:nth-child(6) {
      width: 80px;
      text-align: center;
    }

    td strong {
      display: block;
      max-width: 100%;
      font-size: 13px;
      line-height: 1.35;
      color: var(--text);
      white-space: normal;
      overflow-wrap: anywhere;
    }

    input[type='checkbox'] {
      width: 15px;
      height: 15px;
      cursor: pointer;
    }

    @media (max-width: 1440px) {
      thead th {
        padding: 11px 12px;
      }

      tbody td {
        padding: 11px 12px;
      }

      th:nth-child(1),
      td:nth-child(1) {
        width: 46px;
      }

      th:nth-child(3),
      td:nth-child(3) {
        width: 150px;
      }

      th:nth-child(4),
      td:nth-child(4) {
        width: 120px;
      }

      th:nth-child(5),
      td:nth-child(5) {
        width: 120px;
      }

      th:nth-child(6),
      td:nth-child(6) {
        width: 70px;
      }
    }

    @media (max-width: 1280px) {
      min-width: 720px;
    }

    @media (max-width: 760px) {
      min-width: 680px;

      thead th {
        font-size: 9px;
        padding: 10px;
      }

      tbody td {
        padding: 10px;
        font-size: 12px;
      }

      th:nth-child(1),
      td:nth-child(1) {
        width: 42px;
      }

      th:nth-child(3),
      td:nth-child(3) {
        width: 145px;
      }

      th:nth-child(4),
      td:nth-child(4) {
        width: 110px;
      }

      th:nth-child(5),
      td:nth-child(5) {
        width: 115px;
      }

      th:nth-child(6),
      td:nth-child(6) {
        width: 64px;
      }
    }

    @media (max-width: 640px) {
      table-layout: auto;

      thead th {
        padding: 8px 10px;
        font-size: 8px;
      }

      tbody td {
        padding: 8px 10px;
        font-size: 11px;
      }

      th:nth-child(1),
      td:nth-child(1) {
        width: 38px;
      }

      th:nth-child(3),
      td:nth-child(3) {
        width: 120px;
      }

      th:nth-child(4),
      td:nth-child(4) {
        width: 90px;
      }

      th:nth-child(5),
      td:nth-child(5) {
        width: 100px;
      }

      td strong {
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      th:nth-child(3),
      td:nth-child(3) {
        display: none;
      }
    }
  `,

  ModalFooter: styled.div`
    padding: 14px 22px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;

    @media (max-width: 760px) {
      padding: 12px 14px;
      flex-wrap: wrap;
    }

    @media (max-width: 520px) {
      button {
        flex: 1;
      }
    }

    @media (max-width: 480px) {
      padding: 12px 16px;
    }
  `,

  BoletoFooterInfo: styled.div`
    margin-right: auto;
    padding: 7px 12px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #475569;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;

    @media (max-width: 760px) {
      width: 100%;
      margin-right: 0;
      text-align: center;
      white-space: normal;
    }

    @media (max-width: 480px) {
      font-size: 11px;
      padding: 6px 10px;
    }
  `,

  InfoGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--sub);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .info-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      word-break: break-word;
    }
  `,

  Dropzone: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 16px;
    border-radius: 12px;
    cursor: pointer;
    border: 2px dashed var(--border2);
    background: var(--bg);
    transition: border-color 0.15s, background 0.15s;

    &:hover {
      border-color: var(--accent);
      background: var(--accent-l);
    }
  `,

  DropzoneIcon: styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--accent-l);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      color: var(--accent);
    }
  `,

  DropzoneTitle: styled.div`
    font-size: 13px;
    font-weight: 600;
  `,

  DropzoneHint: styled.div`
    font-size: 11px;
    color: var(--sub);
    margin-top: 2px;
  `,

  FileInput: styled.input`
    display: none;
  `,

  FilesList: styled.div`
    display: grid;
    gap: 8px;
  `,

  FileRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg);
  `,

  FileLeft: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;

    svg {
      color: var(--sub);
      flex-shrink: 0;
    }
  `,

  FileName: styled.div`
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  `,

  FileSub: styled.div`
    font-size: 11px;
    color: var(--sub);
    margin-top: 1px;
  `,

  FileRemove: styled.button`
    background: transparent;
    border: 0;
    cursor: pointer;
    color: var(--sub);
    padding: 4px;
    border-radius: 6px;
    transition: background 0.15s;

    &:hover {
      background: #fee2e2;
      color: var(--danger);
    }
  `,

  FilesEmpty: styled.div`
    font-size: 12px;
    color: var(--sub);
    padding: 8px 2px;
    text-align: center;
  `,

  UploadProgress: styled.div`
    display: grid;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg);
  `,

  UploadProgressTop: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--sub);

    strong {
      color: var(--accent);
    }
  `,

  UploadProgressBar: styled.div`
    height: 8px;
    border-radius: 999px;
    background: #e5e7eb;
    overflow: hidden;
  `,

  UploadProgressFill: styled.div`
    height: 100%;
    border-radius: inherit;
    background: var(--accent);
    transition: width 0.2s ease;
  `,

  Textarea: styled.textarea`
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    font-family: var(--font);
    font-size: 13px;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: var(--accent);
    }
  `,

  FieldLabel: styled.label`
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 4px;
    display: block;
  `,

  FieldError: styled.div`
    font-size: 11px;
    color: var(--danger);
    margin-top: 4px;
  `,

  ConfirmMsg: styled.p`
    font-size: 14px;
    color: var(--sub);
    line-height: 1.6;
    margin: 0;
  `,

  SkeletonLine: styled.div`
    width: ${({ $width }) => $width || '100%'};
    height: ${({ $height }) => $height || '16px'};
    margin-bottom: ${({ $marginBottom }) => $marginBottom || '0'};
    border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
    ${skeletonBackground}
  `,

  SkeletonIcon: styled.div`
    width: ${({ $width }) => $width || '18px'};
    height: ${({ $height }) => $height || '18px'};
    border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
    ${skeletonBackground}
  `,

  ExpandBtn: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: #f1f5f9;
    border-radius: 6px;
    cursor: pointer;
    color: #64748b;
    transition: all 0.15s;
    flex-shrink: 0;

    &:hover {
      background: #e2e8f0;
      color: #334155;
    }
  `,
};

export const SkeletonLine = styled.div`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '16px'};
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '0'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
  ${skeletonBackground}
`;

export const SkeletonIcon = styled.div`
  width: ${({ $width }) => $width || '18px'};
  height: ${({ $height }) => $height || '18px'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
  ${skeletonBackground}
`;

export const StatMini = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  min-width: 100px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-left: 3px solid ${({ $color }) => $color || 'transparent'};

  .value {
    font-size: 28px;
    font-weight: 700;
    color: ${({ $color }) => $color || '#2563eb'};
  }

  .label {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
  }
`;