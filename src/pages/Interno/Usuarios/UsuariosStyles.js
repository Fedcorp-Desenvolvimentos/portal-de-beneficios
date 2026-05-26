// pages/Interno/Usuarios/UsuariosStyles.js
import styled, { css, keyframes } from 'styled-components';

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
    padding: 24px;
    width: 100%;
  `,

  Filters: styled.div`
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  `,

  FilterSelect: styled.select`
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    min-width: 200px;
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-family: var(--font-family);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,

  TableWrapper: styled.div`
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: var(--shadow-sm);
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

    tbody tr:hover td {
      background: var(--color-bg-tertiary);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }
  `,

  EmptyState: styled.div`
    padding: 48px 24px;
    text-align: center;
    background: var(--color-bg-primary);
    border-radius: 12px;
    border: 1px dashed var(--color-border);

    p {
      margin: 0;
      color: var(--color-text-tertiary);
      font-size: 14px;

      &:first-child {
        font-weight: 500;
        margin-bottom: 8px;
      }
    }
  `,

  LoadingMessage: styled.div`
    padding: 48px 24px;
    text-align: center;
    color: var(--color-text-tertiary);
    font-size: 14px;
  `,

  // Skeleton
  SkeletonTable: styled.div`
    background: var(--color-bg-primary);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--color-border-light);
  `,

  SkeletonHeader: styled.div`
    display: flex;
    background: var(--color-bg-tertiary);
    padding: 14px 16px;
    gap: 16px;
  `,

  SkeletonHeaderCell: styled.div`
    height: 20px;
    width: ${props => props.$width || '100px'};
    ${skeletonAnimation}
    border-radius: 4px;
  `,

  SkeletonRow: styled.div`
    display: flex;
    padding: 14px 16px;
    gap: 16px;
    border-bottom: 1px solid var(--color-border-light);

    &:last-child {
      border-bottom: none;
    }
  `,

  SkeletonCell: styled.div`
    height: 20px;
    width: ${props => props.$width || '100px'};
    ${skeletonAnimation}
    border-radius: 4px;
  `,

  // Badges
  VinculadoInfo: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  `,

  VinculadoBadge: styled.span`
    background: var(--color-success-bg);
    color: var(--color-success);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
  `,

  NaoVinculadoInfo: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  NaoVinculadoBadge: styled.span`
    background: var(--color-bg-tertiary);
    color: var(--color-text-tertiary);
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-style: italic;
  `,

  VincularContainer: styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
  `,

  VincularSelect: styled.select`
    padding: 6px 8px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 12px;
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    cursor: pointer;
    flex: 1;
    min-width: 150px;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  `,

  // Botões
  Button: styled.button`
    padding: ${props => props.$size === 'small' ? '4px 8px' : '6px 12px'};
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: ${props => props.$size === 'small' ? '11px' : '12px'};
    font-weight: 500;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    ${props => props.$variant === 'edit' && css`
      background: var(--color-primary);
      color: white;

      &:hover:not(:disabled) {
        background: var(--color-primary-dark);
      }
    `}

    ${props => props.$variant === 'delete' && css`
      background: var(--color-danger);
      color: white;

      &:hover:not(:disabled) {
        background: #d32f2f;
      }
    `}

    ${props => props.$variant === 'unlink' && css`
      background: none;
      color: var(--color-danger);
      padding: 2px 6px;
      font-size: 14px;

      &:hover:not(:disabled) {
        background: var(--color-danger-bg);
      }
    `}

    ${props => props.$variant === 'link' && css`
      background: var(--color-success);
      color: white;

      &:hover:not(:disabled) {
        background: #45a049;
      }
    `}
  `,

  Actions: styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `,
};