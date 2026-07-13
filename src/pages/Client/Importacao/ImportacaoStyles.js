import styled, { css, keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const toastEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const importSpin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

// Container Principal
export const Container = styled.div`
  padding: 24px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  @media (max-width: 1024px) {
    padding: 20px;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

// Header
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 12px 0;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
  }
`;

// Cards de Totais
export const TotaisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 24px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const TotalCard = styled.div`
  background: var(--panel, #fff);
  border: 1px solid var(--border, #eaeaea);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  }

  h3 {
    font-size: 15px;
    color: var(--muted, #666);
    margin-bottom: 8px;
    font-weight: 600;
  }

  .valor {
    font-size: 32px;
    font-weight: 800;
    margin: 0;
    color: #111;
  }

  ${props => props.$isCompra && css`
    border-color: rgba(37, 99, 235, 0.3);
    background: rgba(37, 99, 235, 0.05);
    
    .valor {
      color: #2563eb;
    }
  `}

  ${props => props.$isFaturamento && css`
    border-color: rgba(16, 185, 129, 0.3);
    background: rgba(16, 185, 129, 0.05);
    
    .valor {
      color: #059669;
    }
  `}
`;

// Lote Card
export const LoteCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #eaeaea;
  margin-top: ${props => props.$marginTop || 0};
  margin-bottom: ${props => props.$marginBottom || 0};
`;

export const LoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 2px solid #f5f5f5;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #1a1a1a;
  }

  small {
    color: #666;
  }
`;

export const LoteKpis = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Kpi = styled.div`
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 12px;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  position: relative;

  ${props => props.$clickable && css`
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `}

  ${props => props.$isError && css`
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    border-left: 4px solid #f59f00;
  `}

  ${props => props.$isBlocked && css`
    background: #fff7f7;
    border-left: 4px solid #dc2626;
  `}

  ${props => props.$active && css`
    background: linear-gradient(135deg, #ffeaa7 0%, #ffd970 100%);
    border-left: 4px solid #e67700;
  `}
`;

export const KpiLabel = styled.span`
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
`;

export const KpiValue = styled.span`
  font-weight: 700;
  font-size: 20px;
  color: #111;

  ${props => props.$isError && css`
    color: #e67700;
  `}

  ${props => props.$isBlocked && css`
    color: #b91c1c;
  `}
`;

// Tabela
export const TableWrapper = styled.div`
  overflow: auto;
  border-radius: 10px;
  border: 1px solid #eee;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
`;

export const TableHead = styled.thead`
  th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #fafafa;
    color: #444;
    font-weight: 600;
    font-size: 12px;
    text-align: left;
    padding: 12px;
    border-bottom: 1px solid #eee;
    user-select: none;
  }
`;

export const TableBody = styled.tbody`
  td {
    padding: 12px;
    border-bottom: 1px solid #f5f5f5;
    font-size: 14px;
    color: #1f2937;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr.row-bloqueado {
    background: #fff7f7;
    
    td {
      border-bottom-color: #ffe2e2;
    }
  }

  tr.row-backend-error {
    background-color: #fffbf0;
    border-left: 3px solid #f59f00;
    
    &:hover {
      background-color: #fff8e0;
    }
  }
`;

// Colunas específicas
export const ColValor = styled.td`
  width: 160px;
`;

export const ColStatus = styled.td`
  width: 120px;
`;

export const ColAcoes = styled.td`
  width: 220px;

  @media (max-width: 720px) {
    width: 140px;
  }
`;

// Tags e Badges
export const Tag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  border: 1px solid transparent;

  ${props => props.$isOk && css`
    background: #ecfdf5;
    border-color: #d1fae5;
    color: #065f46;
    
    &::before {
      content: "✓ ";
      font-weight: bold;
    }
  `}

  ${props => props.$isDanger && css`
    background: #fee2e2;
    border-color: #fecaca;
    color: #991b1b;
  `}

  ${props => props.$isWarning && css`
    background: #fff3cd;
    color: #e67700;
    border: 1px solid #ffe0a3;
  `}
`;

export const StatusStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatusDetail = styled.small`
  display: block;
  font-size: 11px;
  line-height: 1.3;
  color: #b91c1c;
`;

// Ações em linha
export const AcoesInline = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

// Botões
export const Button = styled.button`
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
`;

export const ButtonPrimary = styled(Button)`
  background: #3b82f6;
  color: #fff;
  border: 1px solid #3b82f6;
  padding: 10px 14px;
  border-radius: 10px;

  &:disabled {
    background: #9db7f8;
    border-color: #9db7f8;
    cursor: not-allowed;
  }
`;

export const ButtonOutline = styled(Button)`
  background: #fff;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  border-radius: 8px;

  &:hover {
    background: #f8fafc;
  }
`;

export const ButtonGhost = styled(Button)`
  background: transparent;
  color: #374151;
  border: 1px solid #e2e8f0;
  padding: 8px 10px;
  border-radius: 8px;

  &:hover {
    background: #f8fafc;
  }
`;

export const ButtonDanger = styled(Button)`
  border-color: #fecaca;
  color: #991b1b;
  background: #fff;

  &:hover {
    background: #fef2f2;
  }
`;

export const ButtonSm = styled(Button)`
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
`;

export const ButtonIcon = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;

  ${props => props.$danger && css`
    border-color: #fecaca;
    color: #991b1b;
    
    &:hover {
      background: #fee2e2;
    }
  `}

  .btn-text {
    @media (max-width: 720px) {
      display: none;
    }
  }
`;

// Lote Actions
export const LoteActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

export const Hint = styled.span`
  color: #6b7280;
  font-size: 13px;
`;

// Modal
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 50;
`;

export const ModalCard = styled.div`
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eaeaea;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  ${props => props.$large && css`
    max-width: 680px;
  `}
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0;
    font-size: 16px;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
`;

// Formulário de Envio
export const FormEnvio = styled.form`
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 24px !important;
`;

export const FormRow = styled.div`
  width: 100%;
  grid-column: 1 / -1;

  ${props => props.$twoCols && css`
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 28px !important;
  `}

  ${props => props.$fullWidth && css`
    display: grid !important;
    grid-template-columns: 1fr !important;
  `}
`;

export const FormLabel = styled.label`
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  min-width: 0;

  span {
    min-height: 28px;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    line-height: 1.2;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background: #fff;
  color: #0f172a;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background: #fff;
  color: #0f172a;
`;

// Review Summary
export const ReviewSummary = styled.div`
  display: grid;
  gap: 16px;
`;

export const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const ReviewCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 6px;

  ${props => props.$highlight && css`
    background: #eff6ff;
    border-color: #bfdbfe;
  `}
`;

export const ReviewLabel = styled.span`
  font-size: 13px;
  color: #6b7280;
`;

export const ReviewValue = styled.strong`
  font-size: 20px;
  color: #111827;
`;

export const ReviewDetails = styled.div`
  display: grid;
  gap: 8px;
  font-size: 14px;
  color: #374151;
`;

// Processamento
export const ProcessingBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  margin-top: 16px;
  border-radius: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e3a8a;

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #475569;
  }
`;

export const ProcessingSpinner = styled.div`
  width: 22px;
  height: 22px;
  border: 3px solid #bfdbfe;
  border-top-color: #2563eb;
  border-radius: 999px;
  animation: ${importSpin} 0.8s linear infinite;
`;

// Detalhes dos Benefícios
export const DetailsBenefitsList = styled.div`
  display: grid;
  gap: 10px;
`;

export const DetailsBenefitCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #f8fafc;
`;

export const DetailsBenefitInfo = styled.div`
  display: grid;
  gap: 4px;
`;

export const DetailsBenefitName = styled.strong`
  color: #111827;
  font-size: 14px;
`;

export const DetailsBenefitCode = styled.span`
  opacity: 0.7;
  font-size: 13px;
  color: #6b7280;
`;

export const DetailsBenefitValue = styled.div`
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Edit Inline
export const EditInline = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const InputValor = styled.input`
  width: 110px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 14px;
  outline: none;
  color: #111;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }
`;

// Confirm Delete
export const ConfirmDeleteContent = styled.div`
  display: grid;
  gap: 12px;
`;

export const ConfirmDeleteText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
`;

export const ConfirmDeleteWarning = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
`;

// Empty State
export const EmptyState = styled.td`
  text-align: center;
  padding: 24px !important;
  color: #94a3b8;
`;

// Alert Toast
export const Alert = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  min-width: 260px;
  max-width: 380px;
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  opacity: 0;
  transform: translateY(12px);
  animation: ${toastEnter} 0.25s ease-out forwards;

  ${props => props.$isSuccess && css`
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: #f9fafb;
    border-left: 4px solid #166534;
  `}

  ${props => props.$isError && css`
    background: linear-gradient(135deg, #dc2626, #ef4444);
    color: #fff7f7;
    border-left: 4px solid #7f1d1d;
  `}
`;

// VT Badge
export const VtBadge = styled.span`
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  margin-left: 8px;
`;

// Filter Badge
export const FilterBadge = styled.span`
  display: inline-block;
  background: #e67700;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 8px;
`;

// Erros List
export const ErrosList = styled.div`
  max-height: 60vh;
  overflow-y: auto;
`;

export const ErroItem = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 12px;

  details summary {
    cursor: pointer;
    color: #3b82f6;
    font-size: 13px;
  }

  pre {
    background: #f1f5f9;
    padding: 8px;
    border-radius: 4px;
    font-size: 11px;
    overflow-x: auto;
    margin-top: 8px;
  }
`;

export const ErroHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const ErroLinha = styled.span`
  font-weight: bold;
  color: #64748b;
`;

export const ErroMensagem = styled.span`
  color: #dc2626;
`;