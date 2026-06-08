// pages/ColaboradorDashboard/ColaboradorDashboardStyles.js
import styled, { keyframes, css } from 'styled-components';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const S = {
  Root: styled.div`
    --font: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

  // Header e estatísticas
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
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
    border-left: 3px solid ${props => props.$color || 'var(--sub)'};

    .value {
      font-size: 20px;
      font-weight: 700;
      color: ${props => props.$color || 'var(--text)'};
    }

    .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--sub);
      margin-top: 2px;
    }
  `,

  // Filtros
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

  // Tabela - COM ESPAÇAMENTOS MELHORADOS
  TableWrap: styled.div`
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow-x: auto;
    overflow-y: visible;
  `,

  Table: styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 1300px;
    font-size: 13px;

    thead th {
      background: var(--bg);
      padding: 16px 14px;
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--sub);
      font-weight: 600;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }

    tbody td {
      padding: 16px 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover td {
      background: var(--color-bg-tertiary);
    }

    /* Larguras específicas das colunas para melhor espaçamento */
    th:nth-child(1), td:nth-child(1) { width: 140px; } /* Pedido */
    th:nth-child(2), td:nth-child(2) { width: 240px; } /* Administradora */
    th:nth-child(3), td:nth-child(3) { width: 110px; } /* Vencimento */
    th:nth-child(4), td:nth-child(4) { width: 100px; } /* Competência */
    th:nth-child(5), td:nth-child(5) { width: 90px; text-align: center; } /* Funcionários */
    th:nth-child(6), td:nth-child(6) { width: 130px; } /* Valor */
    th:nth-child(7), td:nth-child(7) { width: 150px; } /* Status */
    th:nth-child(8), td:nth-child(8) { width: 80px; } /* Timeline */
    th:nth-child(9), td:nth-child(9) { width: 100px; } /* Excel */
    th:nth-child(10), td:nth-child(10) { width: 110px; } /* Documentos */
    th:nth-child(11), td:nth-child(11) { width: 100px; } /* Compra */
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
    max-width: 240px;
    min-width: 200px;
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
    gap: 6px;
    color: var(--sub);
    font-size: 13px;
  `,

  Empty: styled.td`
    padding: 48px !important;
    text-align: center;
    color: var(--sub);
    font-size: 13px;
  `,

  // Status Select
  StatusSelect: styled.div`
    select {
      padding: 6px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      font-family: var(--font);
      background: ${props => {
        switch (props.$status) {
          case 'faturado': return '#eff6ff';
          case 'cancelado': return '#fef2f2';
          case 'em_faturamento': return '#fffbeb';
          case 'comprado': return '#f0fdf4';
          default: return '#f0fdf4';
        }
      }};
      border: 1px solid ${props => {
        switch (props.$status) {
          case 'faturado': return '#bfdbfe';
          case 'cancelado': return '#fee2e2';
          case 'em_faturamento': return '#fde68a';
          case 'comprado': return '#bbf7d0';
          default: return '#bbf7d0';
        }
      }};
      color: ${props => {
        switch (props.$status) {
          case 'faturado': return '#2563eb';
          case 'cancelado': return '#dc2626';
          case 'em_faturamento': return '#d97706';
          case 'comprado': return '#16a34a';
          default: return '#16a34a';
        }
      }};
      cursor: pointer;
      transition: all 0.15s;

      &:focus {
        outline: none;
      }
    }
  `,

  // Botões
  Btn: styled.button`
    display: inline-flex;
    align-items: center;
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

    ${props => props.$variant === 'primary' && css`
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;

      &:hover:not(:disabled) {
        background: #1d4ed8;
        border-color: #1d4ed8;
      }
    `}

    ${props => props.$variant === 'secondary' && css`
      color: var(--sub);
    `}

    ${props => props.$size === 'sm' && css`
      padding: 5px 10px;
      font-size: 11px;
    `}
  `,

  // Timeline
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
    background: ${props => props.$done ? '#dcfce7' : '#e5e7eb'};
    color: ${props => props.$done ? '#16a34a' : '#64748b'};

    ${props => props.$current && css`
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

    ${props => props.$current && css`
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

  // Paginação
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

  // Modal
  Overlay: styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 9999;
    backdrop-filter: blur(2px);
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

  ModalHeader: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 20px 22px;
    border-bottom: 1px solid var(--border);
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
  `,

  ModalBody: styled.div`
    padding: 20px 22px;
    display: grid;
    gap: 16px;
  `,

  ModalFooter: styled.div`
    padding: 14px 22px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  `,

  // Dropzone e upload
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


  SkeletonLine : styled.div`
    width: ${({ $width }) => $width || '100%'};
    height: ${({ $height }) => $height || '16px'};
    margin-bottom: ${({ $marginBottom }) => $marginBottom || '0'};
    border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    
    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `,

  SkeletonIcon : styled.div`
    width: ${({ $width }) => $width || '18px'};
    height: ${({ $height }) => $height || '18px'};
    border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  `,

  // E atualize o StatMini para aceitar $color como transient prop:
  StatMini : styled.div`
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    padding: 16px 20px;
    min-width: 100px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

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
};

// ============================================
// SKELETON COMPONENTS STYLES
// ============================================

export const SkeletonLine = styled.div`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '16px'};
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '0'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export const SkeletonIcon = styled.div`
  width: ${({ $width }) => $width || '18px'};
  height: ${({ $height }) => $height || '18px'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
`;

// E atualize o StatMini para aceitar $color como transient prop:
export const StatMini = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  min-width: 100px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

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