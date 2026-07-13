// pages/Interno/Administradoras/AdministradorasStyles.js
import styled, { keyframes, css } from 'styled-components';

// Animação shimmer para skeleton
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const skeletonAnimation = css`
  animation: ${shimmer} 2s infinite linear;
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 30%,
    #f0f0f0 60%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
`;

export const S = {
  Container: styled.div`
    width: 100%;
  `,

  Header: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;

    h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    p {
      margin: 0;
      color: var(--color-text-tertiary);
    }
  `,

  HeaderActions: styled.div`
    display: flex;
    gap: 12px;
  `,

  Button: styled.button`
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    ${props => props.$variant === 'primary' && `
      background: var(--color-primary);
      color: white;

      &:hover:not(:disabled) {
        background: var(--color-primary-dark);
      }
    `}

    ${props => props.$variant === 'secondary' && `
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);

      &:hover:not(:disabled) {
        background: var(--color-border-light);
      }
    `}
  `,

  Card: styled.div`
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: var(--shadow-sm);

    h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    p {
      margin: 0 0 20px 0;
      color: var(--color-text-tertiary);
      font-size: 14px;
    }
  `,

  CardHeader: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
  `,

  DetailsGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  `,

  DetailItem: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-tertiary);
    }

    strong {
      font-size: 15px;
      color: var(--color-text-primary);
    }

    .status-ativa {
      color: var(--color-success);
    }

    .status-inativa {
      color: var(--color-danger);
    }
  `,

  CartaoBadge: styled.span`
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    background: ${props => props.$cartaoAdmin ? 'var(--color-success-bg)' : 'var(--color-info-bg)'};
    color: ${props => props.$cartaoAdmin ? 'var(--color-success)' : 'var(--color-info)'};
  `,

  // Skeleton Components
  SkeletonLine: styled.div`
    height: ${props => props.$height || '20px'};
    width: ${props => props.$width || '100%'};
    ${skeletonAnimation}
    border-radius: 6px;
    margin-bottom: ${props => props.$marginBottom || '0'};
  `,

  // Tabela para skeleton
  TableWrapper: styled.div`
    overflow-x: auto;
    border-radius: 12px;
  `,

  Table: styled.table`
    width: 100%;
    border-collapse: collapse;
    background: var(--color-bg-primary);
    border-radius: 12px;
    overflow: hidden;

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid var(--color-border-light);
    }

    th {
      background: var(--color-bg-tertiary);
      font-weight: 600;
      color: var(--color-text-primary);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    td {
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }
  `,

  RegraValorAction: styled.button`
  margin-top: 10px;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-secondary);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`,
};