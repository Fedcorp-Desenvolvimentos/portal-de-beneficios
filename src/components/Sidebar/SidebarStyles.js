import styled, { css, keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  z-index: 999;
  opacity: 1;
  transition: opacity 0.3s ease;
`;

export const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #fafcff 100%);
  box-shadow: 3px 0 20px rgba(36, 99, 235, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              width 0.3s ease;
  overflow-y: auto;
  border-right: 1px solid #e8edf5;
  padding: 5px;
  
  scrollbar-width: thin;
  scrollbar-color: #e0e7ef #f8fafc;
  
  &::-webkit-scrollbar {
    width: 6px;
    background: #f8fafc;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e0e7ef;
    border-radius: 4px;
    
    &:hover {
      background: #cbd5e1;
    }
  }
  
  @media (min-width: 769px) {
    width: ${props => props.$isOpen ? '240px' : '62px'};
    transform: translateX(0) !important;
  }
  
  @media (max-width: 768px) {
    width: 280px !important;
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    box-shadow: 5px 0 30px rgba(0, 0, 0, 0.15);
    
    @media (max-width: 480px) {
      width: 85vw !important;
    }
  }
`;

export const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  border-bottom: 1px solid #e8edf5;
  position: relative;
  background: white;
  margin: 10px;
  margin-top: 20px;
  padding: 0 10px;
`;

export const LogoLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

export const Logo = styled.img`
  transition: all 0.3s ease;
  object-fit: contain;
  
  /* Desktop styles */
  @media (min-width: 769px) {
    width: 230px;
    height: auto;
    padding: 5px;
    
    /* Quando a sidebar está fechada no desktop */
    ${props => props.$isClosed && css`
      width: 40px;
      height: 40px;
      padding: 5px;
      opacity: 1;
    `}
  }
  
  /* Mobile styles */
  @media (max-width: 768px) {
    width: 180px;
    height: auto;
    max-height: 50px;
    object-fit: contain;
  }
  
  @media (max-width: 480px) {
    width: 150px;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s ease;
  z-index: 100;
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
  
  &:hover {
    background-color: #f1f5f9;
    color: #2463eb;
  }
`;

export const Nav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 0.5rem;
  
  & ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  & li {
    display: block;
    margin-bottom: 2px;
    position: relative;
  }
`;

export const NavLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 0.75rem;
  color: #334155;
  text-decoration: none;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: transparent;
  width: 100%;
  min-height: 46px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  ${props => props.$isActive && css`
    background: linear-gradient(90deg, #2463eb15 0%, #2463eb08 100%);
    color: #2463eb;
    font-weight: 600;
    border-left: 3px solid #2463eb;
    
    svg {
      color: #2463eb;
    }
  `}
  
  &:hover {
    background: #f1f5f9;
    color: #2463eb;
    
    svg {
      color: #2463eb;
    }
  }
  
  @media (min-width: 769px) {
    ${props => props.$isClosed && css`
      justify-content: center;
      padding: 0.85rem;
      
      & span {
        display: none !important;
      }
      
      &:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        left: calc(100% + 10px);
        top: 50%;
        transform: translateY(-50%);
        background: #1e293b;
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.85rem;
        white-space: nowrap;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        pointer-events: none;
        animation: ${fadeIn} 0.2s ease forwards;
      }
    `}
  }
  
  @media (max-width: 768px) {
    ${props => props.$isOpen && css`
      justify-content: flex-start !important;
      padding: 0.85rem 0.75rem !important;
      
      & span {
        display: inline !important;
      }
    `}
  }
`;

export const IconTooltip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  
  ${props => props.$isClosed && css`
    justify-content: center;
    gap: 0;
  `}
  
  @media (max-width: 768px) {
    ${props => props.$isOpen && css`
      justify-content: flex-start;
      gap: 0.75rem;
    `}
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  
  svg {
    font-size: 1.25rem;
    transition: color 0.2s ease;
  }
`;

export const LinkText = styled.span`
  font-size: 0.95rem;
  white-space: nowrap;
  transition: color 0.2s ease;
`;