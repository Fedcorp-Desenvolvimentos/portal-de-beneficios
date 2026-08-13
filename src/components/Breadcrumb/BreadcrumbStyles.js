import styled, { css, keyframes } from 'styled-components';

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Nav = styled.nav`
  height: 64px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  
  /* Ajuste para sidebar aberta/fechada no desktop */
  @media (min-width: 769px) {
    width: ${props => props.$sidebarOpen ? 'calc(100% - 240px)' : 'calc(100% - 62px)'};
    margin-left: ${props => props.$sidebarOpen ? '240px' : '62px'};
  }
  
  @media (max-width: 768px) {
    padding: 0 16px;
    width: 100%;
    margin-left: 0 !important;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

export const MenuButton = styled.button`
  /* Visível também no desktop: recolhe/expande a sidebar (demanda perfil
     supervisor, seção 3.2). No mobile continua abrindo/fechando o menu. */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  flex-shrink: 0;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

export const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  
  @media (max-width: 768px) {
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      height: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
  }
`;

export const BreadcrumbItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const Separator = styled.div`
  color: #94a3b8;
  font-size: 14px;
`;

export const BreadcrumbLink = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: ${props => props.$active ? '#1e293b' : '#94a3b8'};
  font-size: 14px;
  cursor: ${props => props.$active ? 'default' : 'pointer'};
  transition: all 0.2s;
  font-weight: ${props => props.$active ? '500' : '400'};
  
  &:hover:not(:disabled) {
    background: #f8fafc;
    color: #1e293b;
  }
  
  &:disabled {
    cursor: default;
    opacity: 1;
  }
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const DateTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding-right: 16px;
  border-right: 1px solid #e2e8f0;
  margin-right: 4px;
  gap: 4px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const DateWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  
  svg {
    color: #2463eb;
  }
`;

export const Date = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

export const TimeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  
  svg {
    color: #2463eb;
  }
`;

export const Time = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
`;

export const UserContainer = styled.div`
  position: relative;
`;

export const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px 6px 8px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  
  @media (max-width: 768px) {
    min-width: auto;
    padding: 6px;
  }
`;

export const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2463eb, #8b5cf6);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

export const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
`;

export const UserRole = styled.span`
  font-size: 12px;
  color: ${props => props.$color || '#64748b'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
`;

export const DropdownArrow = styled.div`
  color: #64748b;
  transition: transform 0.2s;
  flex-shrink: 0;
  
  ${props => props.$rotated && css`
    transform: rotate(180deg);
  `}
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 52px;
  right: 0;
  width: 280px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: ${slideDown} 0.2s ease;
  
  @media (max-width: 768px) {
    width: 260px;
  }
`;

export const DropdownHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

export const DropdownUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const DropdownAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2463eb, #8b5cf6);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
`;

export const DropdownName = styled.p`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

export const DropdownEmail = styled.p`
  margin: 0;
  font-size: 12px;
  color: #64748b;
  word-break: break-all;
`;

export const DropdownNivel = styled.p`
  margin: 4px 0 0 0;
  font-size: 11px;
`;

export const AccessBadge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  color: ${props => props.$color};
  border: 1px solid ${props => props.$color};
`;

export const Divider = styled.div`
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
`;

export const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f8fafc;
    color: #1e293b;
  }
  
  ${props => props.$logout && css`
    color: #dc2626;
    
    &:hover {
      background: #fee2e2;
    }
  `}
`;

export const DropdownIcon = styled.span`
  display: flex;
  align-items: center;
  font-size: 16px;
`;

export const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
`;

export const AdminSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  svg {
    color: #2463eb;
  }
`;

export const AdminOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 16px;
  background: ${props => props.$active ? '#eff6ff' : 'none'};
  border: none;
  text-align: left;
  font-size: 13px;
  color: ${props => props.$active ? '#1e40af' : '#475569'};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${props => props.$active ? '#eff6ff' : '#f8fafc'};
  }
`;

export const AdminCheckbox = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid ${props => props.$checked ? '#2463eb' : '#cbd5e1'};
  background: ${props => props.$checked ? '#2463eb' : 'white'};
  color: white;
  flex-shrink: 0;
  transition: all 0.15s;
`;

export const AdminOptionLabel = styled.span`
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;