// pages/Faturamento/FaturamentoStyles.js
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

const notebookSmall = '1440px';

export const S = {
  Page: styled.div`
    width: 100%;
  `,

  Hero: styled.section`
    margin-bottom: 24px;
  `,

  Title: styled.h1`
    margin: 0;
    font-size: 34px;
    line-height: 1.05;
    letter-spacing: -0.03em;

    @media (max-width: 720px) {
      font-size: 28px;
    }
  `,

  Subtitle: styled.p`
    margin: 10px 0 0;
    font-size: 15px;
    color: var(--color-text-tertiary);
    max-width: 760px;
  `,

  Toolbar: styled.section`
    margin-bottom: 18px;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 14px;
    padding: 12px 14px;
    box-shadow: var(--shadow-lg);
  `,

  Search: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-bg-tertiary);
    border-radius: 10px;
    padding: 0 10px;

    input {
      width: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      padding: 9px 4px;
      font-size: 13px;
      color: var(--color-text-primary);

      &::placeholder {
        color: var(--color-text-tertiary);
      }
    }

    svg {
      color: var(--color-text-tertiary);
      flex-shrink: 0;
    }
  `,

  Filters: styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr)) auto;
  gap: 0.6rem;
  margin-top: 0.6rem;
  align-items: end;

  select {
    height: 34px;
    border: 1px solid var(--color-border);
    border-radius: 9px;
    padding: 0 0.6rem;
    font-size: 0.85rem;
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    transition: all 0.2s ease;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(15, 61, 93, 0.12);
    }
  }

  @media (max-width: ${notebookSmall}) {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    gap: 0.6rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`,

  FilterLabel: styled.label`
    display: flex;
    flex-direction: column;
    gap: 4px;

    span {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `,
  ClearButton: styled.button`
  height: 34px;
  padding: 0 1rem;
  border-radius: 9px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  align-self: end;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--color-border-light);
    color: var(--color-text-primary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: ${notebookSmall}) {
    width: 100%;
    height: 34px;
    padding: 0 0.8rem;
  }
`,
  List: styled.section`
    display: flex;
    flex-direction: column;
    gap: 18px;
  `,

  // Skeleton Card
  SkeletonCard: styled.div`
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 22px;
    overflow: hidden;
    padding: 22px;
  `,

  SkeletonCardTop: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--color-border-light);

    @media (max-width: 980px) {
      flex-direction: column;
    }
  `,

  SkeletonMain: styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
  `,

  SkeletonIcon: styled.div`
    width: 46px;
    height: 46px;
    border-radius: 14px;
    ${skeletonAnimation}
  `,

  SkeletonText: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  SkeletonLine: styled.div`
    height: ${props => props.$height || '20px'};
    width: ${props => props.$width || '200px'};
    border-radius: 8px;
    ${skeletonAnimation}
  `,

  SkeletonSummary: styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 980px) {
      margin-top: 10px;
    }
  `,

  SkeletonSummaryItem: styled.div`
    min-width: 125px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  SkeletonTags: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  `,

  SkeletonTag: styled.div`
    width: ${props => props.$width || '100px'};
    height: 36px;
    border-radius: 999px;
    ${skeletonAnimation}
  `,

  SkeletonDocs: styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    @media (max-width: 720px) {
      flex-direction: column;
    }
  `,

  SkeletonButton: styled.div`
    width: ${props => props.$width || '100px'};
    height: 42px;
    border-radius: 999px;
    ${skeletonAnimation}
  `,

  Card: styled.article`
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }
  `,

  CardTop: styled.div`
    padding: 22px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    border-bottom: 1px solid var(--color-border-light);

   @media (max-width: ${notebookSmall}) {
  flex-direction: column;
  align-items: flex-start;
}
  `,

  CardMain: styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  `,

  Icon: styled.div`
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: var(--color-primary-bg);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  `,

  MainText: styled.div`
    h2 {
      margin: 0;
      font-size: 22px;
      line-height: 1.1;
      letter-spacing: -0.02em;

      @media (max-width: 720px) {
        font-size: 18px;
      }
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
  `,
Summary: styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: ${notebookSmall}) {
    width: 100%;
    justify-content: flex-start;
  }
`,
SummaryItem: styled.div`
  min-width: 125px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-tertiary);
  }

  strong {
    font-size: 15px;
    color: var(--color-text-primary);
  }

  @media (max-width: ${notebookSmall}) {
    min-width: 150px;
  }

  @media (max-width: 640px) {
    min-width: 100%;
  }
`,

  CardBody: styled.div`
    padding: 20px 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  `,

  Label: styled.span`
    display: inline-block;
    margin-bottom: 10px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-tertiary);
    font-weight: 700;
  `,

  BenefitTags: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  `,

  Tag: styled.span`
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;

    ${props => props.$variant === 'success' && css`
      background: var(--color-success-bg);
      color: #166534;
      border: 1px solid #86efac;
    `}

    ${props => props.$variant === 'warning' && css`
      background: var(--color-warning-bg);
      color: #92400e;
      border: 1px solid #fcd34d;
    `}

    ${props => props.$variant === 'danger' && css`
      background: var(--color-danger-bg);
      color: #991b1b;
      border: 1px solid #fca5a5;
    `}

    ${props => props.$variant === 'info' && css`
      background: var(--color-info-bg);
      color: #1e40af;
      border: 1px solid #93c5fd;
    `}
  `,

  Docs: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;

    @media (max-width: 720px) {
      flex-direction: column;
      align-items: stretch;
    }
  `,

  Button: styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid var(--color-border);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    border-radius: 999px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: var(--color-bg-tertiary);
      border-color: var(--color-border-dark);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      filter: grayscale(0.25);
    }

    ${props => props.$variant === 'primary' && css`
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: #ffffff;

      &:hover:not(:disabled) {
        background: #1e40af;
        border-color: #1e40af;
      }
    `}

    @media (max-width: 720px) {
      width: 100%;
    }
  `,

  Empty: styled.div`
    padding: 22px 18px;
    border: 1px dashed var(--color-border);
    border-radius: 16px;
    background: var(--color-bg-tertiary);
    color: var(--color-text-tertiary);
    font-size: 14px;
    text-align: center;
  `,

  Pagination: styled.div`
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    span {
      font-weight: 600;
      color: var(--color-primary);
    }
  `,
TotalCard: styled.div`
  margin: 1rem 0;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 24px rgba(15, 61, 93, 0.18);

  span {
    font-size: 0.95rem;
    opacity: 0.9;
  }

  strong {
    font-size: 1.5rem;
    font-weight: 700;
  }

  @media (max-width: ${notebookSmall}) {
    padding: 1rem 1.25rem;

    strong {
      font-size: 1.35rem;
    }
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    strong {
      font-size: 1.25rem;
    }
    }
  `,

  // ============================================
  // FIGMA-INSPIRED COMPONENTS
  // ============================================

  StatsGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 22px;

    @media (max-width: 1100px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `,

  StatCard: styled.div`
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 16px;
    padding: 18px;
    box-shadow: var(--shadow-lg);
  `,

  StatRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  `,

  StatValue: styled.div`
    font-size: 26px;
    line-height: 1;
    letter-spacing: -0.03em;
    font-weight: 500;
    margin-bottom: 4px;
  `,

  StatLabel: styled.span`
    font-size: 13px;
    color: var(--color-text-tertiary);
  `,

  IconBox: styled.span`
    width: ${props => props.$size || 34}px;
    height: ${props => props.$size || 34}px;
    border-radius: ${props => props.$radius || 9}px;
    background: ${props => props.$bg || 'rgba(29, 78, 216, 0.08)'};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: ${props => props.$iconSize || 16}px;
      height: ${props => props.$iconSize || 16}px;
      stroke: ${props => props.$color || 'var(--color-primary)'};
    }
  `,

  CardHead: styled.button`
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 20px 22px;
    border: 0;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font: inherit;
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-light);
    transition: background 0.15s ease;

    &:hover {
      background: var(--color-bg-tertiary);
    }
  `,

  CardTitle: styled.div`
    flex: 1;
    min-width: 0;

    strong {
      display: block;
      font-size: 16px;
      margin-bottom: 2px;
    }

    small {
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
  `,

  CardStatus: styled.span`
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;

    ${props => props.$variant === 'success' && css`
      background: var(--color-success-bg);
      color: var(--color-success);
    `}
    ${props => props.$variant === 'warning' && css`
      background: var(--color-warning-bg);
      color: var(--color-warning);
    `}
    ${props => props.$variant === 'danger' && css`
      background: var(--color-danger-bg);
      color: var(--color-danger);
    `}
    ${props => props.$variant === 'info' && css`
      background: var(--color-info-bg);
      color: var(--color-primary);
    `}
  `,

  CardCompetencia: styled.span`
    font-size: 13px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  `,

  CardTotal: styled.strong`
    font-size: 15px;
    flex-shrink: 0;
  `,

  ToggleIcon: styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-text-tertiary);
    transition: transform 0.2s ease;

    ${props => props.$open && css`
      transform: rotate(180deg);
    `}
  `,
};