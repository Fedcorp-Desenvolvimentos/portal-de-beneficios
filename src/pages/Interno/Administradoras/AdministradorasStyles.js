// pages/Interno/Administradoras/AdministradorasStyles.js
import styled from 'styled-components';

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

    &:hover {
      transform: translateY(-1px);
    }

    ${props => props.$variant === 'primary' && `
      background: var(--color-primary);
      color: white;

      &:hover {
        background: var(--color-primary-dark);
      }
    `}

    ${props => props.$variant === 'secondary' && `
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);

      &:hover {
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
};