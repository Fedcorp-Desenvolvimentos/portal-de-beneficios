// pages/Dashboard/DashboardStyles.js
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
  Root: styled.div`
    min-height: 100vh;
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    font-family: var(--font-family);
  `,

  Body: styled.main`
    max-width: 1240px;
    margin: 0 auto;
    padding: 28px 28px 72px;

    @media (max-width: 720px) {
      padding: 18px 16px 48px;
    }
  `,

  // ============================================
  // SKELETON COMPONENTS
  // ============================================

  SkeletonLine: styled.div`
    height: ${props => props.$height || '20px'};
    width: ${props => props.$width || '100%'};
    ${skeletonAnimation}
    border-radius: ${props => props.$borderRadius || '6px'};
    margin-bottom: ${props => props.$marginBottom || '0'};
  `,

  SkeletonIcon: styled.div`
    width: ${props => props.$width || '24px'};
    height: ${props => props.$height || '24px'};
    ${skeletonAnimation}
    border-radius: ${props => props.$borderRadius || '8px'};
    flex-shrink: 0;
  `,

  SkeletonButton: styled.div`
    width: ${props => props.$width || '120px'};
    height: ${props => props.$height || '42px'};
    ${skeletonAnimation}
    border-radius: 12px;
  `,

  // ============================================
  // COMPONENTES EXISTENTES
  // ============================================

  Hero: styled.section`
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: flex-start;
    margin-bottom: 24px;
    padding: 28px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
    border: 1px solid var(--color-border-light);
    border-radius: 24px;
    box-shadow: var(--shadow-lg);

    @media (max-width: 720px) {
      flex-direction: column;
      padding: 20px;
    }
  `,

  HeroActions: styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 720px) {
      flex-direction: column;
    }
  `,

  Eyebrow: styled.p`
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-primary);
    margin: 0 0 8px;
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
    color: var(--color-text-tertiary);
    max-width: 720px;
    font-size: 15px;
  `,

  Button: styled.button`
    border: 1px solid var(--color-border-light);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    border-radius: 12px;
    padding: 11px 16px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    transition: transform 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    ${props => props.variant === 'primary' && `
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: #fff;
    `}

    ${props => props.variant === 'secondary' && `
      &:hover:not(:disabled) {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    `}

    ${props => props.variant === 'success' && `
      background: var(--color-success-bg);
      border-color: rgba(22, 163, 74, 0.16);
      color: var(--color-success);
    `}
  `,

  KPIs: styled.section`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    @media (max-width: 1100px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  `,

  KPICard: styled.button`
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 18px;
    padding: 20px;
    box-shadow: var(--shadow-lg);
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s ease;
    width: 100%;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      border-color: var(--color-border);
    }

    &:disabled {
      cursor: not-allowed;
    }
  `,

  KPITop: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--color-text-tertiary);
    margin-bottom: 18px;
  `,

  KPILabel: styled.span`
    font-size: 13px;
    font-weight: 600;
  `,

  KPIValue: styled.div`
    font-size: 30px;
    line-height: 1;
    letter-spacing: -0.03em;
    font-weight: 500;
    margin-bottom: 10px;
  `,

  KPIFoot: styled.div`
    font-size: 12px;
    color: var(--color-text-tertiary);
  `,

  GridMain: styled.div`
    display: grid;
    grid-template-columns: 1.4fr 0.9fr;
    gap: 20px;
    margin-bottom: 24px;

    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
    }
  `,

  SideStack: styled.div`
    display: grid;
    gap: 20px;
  `,

  Panel: styled.div`
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 22px;
    box-shadow: var(--shadow-lg);
    padding: 22px;
    ${props => props.highlight && `
      background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    `}
  `,

  PanelHead: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 18px;
  `,

  PanelEyebrow: styled.p`
    margin: 0 0 4px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-tertiary);
  `,

  PanelTitle: styled.h2`
    margin: 0;
    font-size: 20px;
    letter-spacing: -0.02em;
  `,

  PanelActions: styled.div`
    margin-top: 18px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 720px) {
      flex-direction: column;
    }
  `,

  ImportMain: styled.div`
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 18px;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-light);
    border-radius: 16px;
    margin-bottom: 16px;
  `,

  ImportIcon: styled.div`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(29, 78, 216, 0.08);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 18px;
      height: 18px;
      stroke: var(--color-primary);
    }
  `,

  ImportContent: styled.div`
    min-width: 0;
  `,

  ImportName: styled.div`
    font-size: 15px;
    font-weight: 700;
    word-break: break-word;
  `,

  ImportMeta: styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 6px;
    color: var(--color-text-tertiary);
    font-size: 13px;
  `,

  ImportStats: styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  `,

  MiniStat: styled.div`
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-light);
    border-radius: 14px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,

  MiniLabel: styled.span`
    color: var(--color-text-tertiary);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: 'DM Mono', monospace;
  `,

  Badge: styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;

    ${props => props.status === 'success' && `
      background: var(--color-success-bg);
      color: var(--color-success);
    `}
    ${props => props.status === 'warning' && `
      background: var(--color-warning-bg);
      color: var(--color-warning);
    `}
    ${props => props.status === 'danger' && `
      background: var(--color-danger-bg);
      color: var(--color-danger);
    `}
    ${props => props.status === 'info' && `
      background: rgba(29, 78, 216, 0.08);
      color: var(--color-primary);
    `}
  `,

  SearchBox: styled.div`
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid var(--color-border-light);
    background: var(--color-bg-tertiary);
    border-radius: 14px;
    padding: 0 14px;
    margin-bottom: 14px;

    input {
      width: 100%;
      border: 0;
      outline: 0;
      background: transparent;
      padding: 14px 10px;
      font: inherit;
      color: var(--color-text-primary);

      &:disabled {
        opacity: 0.6;
      }
    }
  `,

  SearchIcon: styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 18px;
      height: 18px;
      stroke: var(--color-primary);
    }
  `,

  SearchClear: styled.button`
    border: 0;
    background: transparent;
    color: var(--color-text-tertiary);
    cursor: pointer;
    font-size: 22px;
    line-height: 1;
  `,

  SearchResults: styled.div`
    display: grid;
    gap: 10px;
  `,

  SearchItem: styled.button`
    text-align: left;
    border: 1px solid var(--color-border-light);
    background: var(--color-bg-tertiary);
    color: #000;
    border-radius: 14px;
    padding: 12px 14px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
      font-size: 13px;
    }

    span {
      font-size: 12px;
      color: var(--color-text-tertiary);
    }

    &:hover {
      border-color: var(--color-border);
    }
  `,

  EmptyState: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--color-text-tertiary);
    text-align: center;
    padding: 28px 16px;
    border: 1px dashed var(--color-border-light);
    background: var(--color-bg-tertiary);
    border-radius: 16px;

    svg {
      width: 18px;
      height: 18px;
      stroke: var(--color-primary);
    }
  `,

  EmptyInline: styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--color-text-tertiary);
    text-align: center;
    padding: 28px 16px;
    border: 1px dashed var(--color-border-light);
    background: var(--color-bg-tertiary);
    border-radius: 16px;
  `,

  QuickActions: styled.div`
    display: grid;
    gap: 12px;
  `,

  QuickBtn: styled.button`
    border: 1px solid var(--color-border-light);
    background: var(--color-bg-tertiary);
    color: #000;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover:not(:disabled) {
      border-color: var(--color-border);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    strong {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }

    span {
      font-size: 12px;
      color: var(--color-text-tertiary);
    }
  `,

  ModalOverlay: styled.div`
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 1050;
    overflow: hidden;

    @media (max-width: 1440px), (max-height: 860px) {
      padding: 10px;
      align-items: center;
    }

    @media (max-width: 720px) {
      padding: 8px;
      align-items: flex-start;
      overflow-y: auto;
    }
  `,

  Modal: styled.div`
    width: min(860px, calc(100vw - 32px));
    height: auto;
    max-height: min(760px, calc(100dvh - 32px));
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 20px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);

    @media (max-width: 1440px), (max-height: 860px) {
      width: min(820px, calc(100vw - 24px));
      max-height: calc(100dvh - 90px);
      border-radius: 16px;
    }

    @media (max-width: 1280px), (max-height: 780px) {
      width: min(760px, calc(100vw - 20px));
      max-height: calc(100dvh - 70px);
      border-radius: 14px;
    }

    @media (max-width: 720px) {
      width: calc(100vw - 16px);
      max-height: calc(100dvh - 16px);
      border-radius: 14px;
    }
  `,

  ModalHeader: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 20px 22px 14px;
    border-bottom: 1px solid var(--color-border-light);
    flex-shrink: 0;

    @media (max-width: 1440px), (max-height: 860px) {
      padding: 14px 18px 10px;
      gap: 10px;
    }

    @media (max-width: 720px) {
      padding: 14px 14px 10px;
    }
  `,

  ModalTitle: styled.h2`
    margin: 0;
    font-size: 24px;
    line-height: 1.05;
    letter-spacing: -0.03em;

    @media (max-width: 1440px), (max-height: 860px) {
      font-size: 21px;
    }

    @media (max-width: 720px) {
      font-size: 19px;
    }
  `,

  ModalClose: styled.button`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--color-border-light);
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      border-color: var(--color-border);
    }

    @media (max-width: 1440px), (max-height: 860px) {
      width: 32px;
      height: 32px;
      font-size: 20px;
      border-radius: 9px;
    }
  `,

  ModalBody: styled.div`
    padding: 16px 22px 0;
    overflow-y: auto;
    flex: 1;
    min-height: 0;

    @media (max-width: 1440px), (max-height: 860px) {
      padding: 12px 18px 0;
    }

    @media (max-width: 720px) {
      padding: 12px 14px 0;
    }
  `,

  ModalStatusRow: styled.div`
    margin-bottom: 12px;

    @media (max-width: 1440px), (max-height: 860px) {
      margin-bottom: 8px;
    }
  `,

  ModalGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding-bottom: 12px;

    @media (max-width: 1440px), (max-height: 860px) {
      gap: 9px;
      padding-bottom: 10px;
    }

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  `,

  ModalInfo: styled.div`
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-light);
    border-radius: 13px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;

    &.full {
      grid-column: 1 / -1;
    }

    span,
    small,
    label {
      font-size: 11px;
      line-height: 1.2;
    }

    strong {
      font-size: 15px;
      line-height: 1.2;
      word-break: break-word;
    }

    strong.money {
      color: var(--color-success);
    }

    @media (max-width: 1440px), (max-height: 860px) {
      padding: 10px 12px;
      border-radius: 11px;
      gap: 4px;

      strong {
        font-size: 14px;
      }
    }

    @media (max-width: 1280px), (max-height: 780px) {
      padding: 8px 10px;

      span,
      small,
      label {
        font-size: 10px;
      }

      strong {
        font-size: 13px;
      }
    }
  `,

  ModalActions: styled.div`
    position: sticky;
    bottom: 0;
    margin-top: 0;
    padding: 12px 22px 16px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
    flex-shrink: 0;
    background: var(--color-bg-primary);
    border-top: 1px solid var(--color-border-light);
    box-shadow: 0 -8px 20px rgba(15, 23, 42, 0.06);

    button {
      min-height: 38px;
      padding-top: 9px;
      padding-bottom: 9px;
    }

    @media (max-width: 1440px), (max-height: 860px) {
      padding: 10px 18px 12px;

      button {
        min-height: 34px;
        padding-top: 7px;
        padding-bottom: 7px;
      }
    }

    @media (max-width: 720px) {
      padding: 10px 14px 12px;
      flex-direction: column;

      button {
        width: 100%;
        justify-content: center;
      }
    }
  `,

  // ============================================
  // FIGMA-INSPIRED COMPONENTS
  // ============================================

  IconBox: styled.span`
    width: ${props => props.$size || 36}px;
    height: ${props => props.$size || 36}px;
    border-radius: ${props => props.$radius || 10}px;
    background: ${props => props.$bg || 'rgba(29, 78, 216, 0.08)'};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: ${props => props.$iconSize || 17}px;
      height: ${props => props.$iconSize || 17}px;
      stroke: ${props => props.$color || 'var(--color-primary)'};
    }
  `,

  ChangeBadge: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 999px;

    ${props => props.$up && `
      background: rgba(22, 163, 74, 0.10);
      color: var(--color-success);
    `}

    ${props => !props.$up && `
      background: rgba(239, 68, 68, 0.10);
      color: var(--color-danger);
    `}
  `,

  StatCard: styled.button`
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 18px;
    padding: 20px;
    box-shadow: var(--shadow-lg);
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease;
    width: 100%;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      border-color: var(--color-border);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `,

  StatTop: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  `,

  StatValue: styled.div`
    font-size: 30px;
    line-height: 1;
    letter-spacing: -0.03em;
    font-weight: 500;
    margin-bottom: 6px;
  `,

  StatLabel: styled.span`
    font-size: 13px;
    color: var(--color-text-tertiary);
  `,

  Card: styled.section`
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 22px;
    box-shadow: var(--shadow-lg);
    padding: 22px;
  `,

  CardHead: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }
  `,

  CardLink: styled.button`
    border: 0;
    background: transparent;
    color: var(--color-primary);
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  `,

  MovementItem: styled.article`
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border-light);

    &:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }

    > div:nth-child(2) {
      flex: 1;
      min-width: 0;

      strong {
        display: block;
        font-size: 14px;
        margin-bottom: 2px;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: var(--color-text-tertiary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  `,

  MovementValue: styled.div`
    text-align: right;
    flex-shrink: 0;

    strong {
      display: block;
      font-size: 14px;
    }

    span {
      font-size: 12px;
      color: var(--color-text-tertiary);
    }
  `,

  CondoListItem: styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    border: 0;
    background: transparent;
    color: var(--color-text-primary);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    font: inherit;
    transition: background 0.15s ease;

    &:hover {
      background: var(--color-bg-tertiary);
    }

    > span:nth-child(2) {
      flex: 1;
      min-width: 0;

      strong {
        display: block;
        font-size: 14px;
        margin-bottom: 2px;
      }

      small {
        font-size: 12px;
        color: var(--color-text-tertiary);
      }
    }

    svg:last-child {
      flex-shrink: 0;
      color: var(--color-text-tertiary);
    }
  `,

  CountBadge: styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    border-radius: 999px;
    background: var(--color-bg-tertiary);
    color: var(--color-text-tertiary);
    font-size: 12px;
    font-weight: 600;
  `,
};