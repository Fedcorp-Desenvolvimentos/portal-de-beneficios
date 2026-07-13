import styled, { css } from 'styled-components';

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  
  ${props => props.$status === 'sucesso' && css`
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  `}
  
  ${props => props.$status === 'erro' && css`
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
  `}
  
  ${props => props.$status === 'processando' && css`
    background: #eff6ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
  `}
  
  ${props => props.$status === 'warning' && css`
    background: #fffbeb;
    color: #b45309;
    border: 1px solid #fde68a;
  `}
  
  ${props => props.$status === 'info' && css`
    background: #f0f9ff;
    color: #0369a1;
    border: 1px solid #bae6fd;
  `}
`;

export const BadgeIcon = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 12px;
`;