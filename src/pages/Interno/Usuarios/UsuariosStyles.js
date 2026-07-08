import styled, { css, keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const skeletonAnimation = css`
  animation: ${shimmer} 2s infinite linear;
  background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 30%, #f0f0f0 60%, #f0f0f0 100%);
  background-size: 1000px 100%;
`;

export const S = {
  Container: styled.div`
    width: 100%;
  `,

  Card: styled.div`
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #eaeaea;
    overflow: hidden;
  `,

  CardHeader: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    flex-wrap: wrap;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }
  `,

  NovoBtn: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #051a62 100%);
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover { opacity: 0.9; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  `,

  FiltersRow: styled.div`
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    flex-wrap: wrap;
    align-items: center;
  `,

  SearchInput: styled.input`
    height: 38px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    color: #0f172a;
    min-width: 200px;
    flex: 1;
    box-sizing: border-box;

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
    }

    &:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }
  `,

  TableWrapper: styled.div`
    overflow-x: auto;
  `,

  Table: styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }

    th {
      background: #f8fafc;
      font-weight: 600;
      color: #475569;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    td {
      font-size: 14px;
      color: #0f172a;
    }

    tbody tr:hover td {
      background: #f8fafc;
    }

    tbody tr:last-child td {
      border-bottom: none;
    }
  `,

  EmptyState: styled.div`
    padding: 64px 24px;
    text-align: center;

    p {
      margin: 0;
      color: #9ca3af;
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
    color: #9ca3af;
    font-size: 14px;
  `,

  SkeletonTable: styled.div`
    background: #fff;
    overflow: hidden;
  `,

  SkeletonHeader: styled.div`
    display: flex;
    background: #f8fafc;
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
    border-bottom: 1px solid #f0f0f0;
    &:last-child { border-bottom: none; }
  `,

  SkeletonCell: styled.div`
    height: 20px;
    width: ${props => props.$width || '100px'};
    ${skeletonAnimation}
    border-radius: 4px;
  `,

  VinculadoInfo: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  `,

  VinculadoBadge: styled.span`
    background: #dcfce7;
    color: #166534;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  `,

  NaoVinculadoInfo: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,

  NaoVinculadoBadge: styled.span`
    background: #f3f4f6;
    color: #9ca3af;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-style: italic;
  `,

  VincularContainer: styled.div`
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
  `,

  VincularSelect: styled.select`
    padding: 5px 8px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 12px;
    background: #fff;
    color: #0f172a;
    cursor: pointer;
    min-width: 140px;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  `,

  Actions: styled.div`
    display: flex;
    gap: 6px;
    flex-wrap: nowrap;
  `,

  ActionBtn: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.15s;
    white-space: nowrap;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    ${props => props.$variant === 'edit' && css`
      background: #eff6ff;
      color: #1d4ed8;
      &:hover:not(:disabled) { background: #dbeafe; }
    `}

    ${props => props.$variant === 'delete' && css`
      background: #fef2f2;
      color: #dc2626;
      &:hover:not(:disabled) { background: #fee2e2; }
    `}

    ${props => props.$variant === 'link' && css`
      background: #dcfce7;
      color: #166534;
      &:hover:not(:disabled) { background: #bbf7d0; }
    `}

    ${props => props.$variant === 'unlink' && css`
      background: none;
      color: #dc2626;
      padding: 2px 4px;
      font-size: 14px;
      line-height: 1;
      &:hover:not(:disabled) { background: #fef2f2; border-radius: 4px; }
    `}
  `,

  ModalOverlay: styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
  `,

  ModalContent: styled.div`
    width: 100%;
    max-width: 440px;
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.25);
  `,

  ModalTitle: styled.h3`
    margin: 0 0 8px;
  `,

  ModalText: styled.p`
    margin: 0 0 4px;
    color: #475569;
    font-size: 14px;
  `,

  ModalUser: styled.strong`
    display: block;
    margin-bottom: 24px;
    color: #dc2626;
  `,

  ModalActions: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  `,

  ModalCancelBtn: styled.button`
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #475569;
  `,

  ModalDeleteBtn: styled.button`
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background: #dc2626;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `,
};
