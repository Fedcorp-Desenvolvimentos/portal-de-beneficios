// pages/Dashboard/DashboardStyles.js
import styled from 'styled-components';

export const S = {
  Root: styled.div`
    min-height: 100vh;
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    font-family: var(--font-family);
  `,

  Body: styled.main`
    margin: 0 auto;
    padding: 28px 28px 72px;

    @media (max-width: 720px) {
      padding: 18px 16px 48px;
    }
  `,

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

    &:hover {
      transform: translateY(-1px);
    }

    ${props => props.variant === 'primary' && `
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: #fff;
    `}

    ${props => props.variant === 'secondary' && `
      &:hover {
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

    &:hover {
      transform: translateY(-2px);
      border-color: var(--color-border);
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

    &:hover {
      border-color: var(--color-border);
      transform: translateY(-1px);
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
    padding: 20px;
    z-index: 1050;
  `,

  Modal: styled.div`
    width: min(920px, 100%);
    max-height: 90vh;
    overflow: auto;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-light);
    border-radius: 22px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  `,

  ModalHeader: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 24px 16px;
    border-bottom: 1px solid var(--color-border-light);
  `,

  ModalTitle: styled.h2`
    margin: 0;
    font-size: 26px;
    line-height: 1.1;
    letter-spacing: -0.03em;

    @media (max-width: 720px) {
      font-size: 22px;
    }
  `,

  ModalClose: styled.button`
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid var(--color-border-light);
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;

    &:hover {
      border-color: var(--color-border);
    }
  `,

  ModalBody: styled.div`
    padding: 20px 24px 24px;
  `,

  ModalStatusRow: styled.div`
    margin-bottom: 16px;
  `,

  ModalGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;

    @media (max-width: 720px) {
      grid-template-columns: 1fr;
    }
  `,

  ModalInfo: styled.div`
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-light);
    border-radius: 14px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    &.full {
      grid-column: 1 / -1;
    }

    strong.money {
      color: var(--color-success);
    }
  `,

  ModalActions: styled.div`
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  `,
};