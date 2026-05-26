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
    border-radius: 18px;
    padding: 16px;
    box-shadow: var(--shadow-lg);
  `,

  Search: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--color-border);
    background: var(--color-bg-tertiary);
    border-radius: 14px;
    padding: 0 14px;

    input {
      width: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      padding: 14px 4px;
      font-size: 14px;
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
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-top: 1rem;

    select {
      height: 44px;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 0 0.9rem;
      font-size: 0.95rem;
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
  `,

  FilterLabel: styled.label`
    display: flex;
    flex-direction: column;
    gap: 6px;

    span {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `,

  ClearButton: styled.button`
    height: 44px;
    padding: 0 1.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);

    &:hover {
      background: var(--color-border-light);
      color: var(--color-text-primary);
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

    @media (max-width: 980px) {
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

    @media (max-width: 980px) {
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
  `,
};