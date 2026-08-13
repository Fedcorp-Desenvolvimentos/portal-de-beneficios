import styled, { css } from 'styled-components';

export const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
`;

export const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
`;

export const Content = styled.div`
  flex: 1;
  padding: 0 1.5rem 1.5rem;
  width: 100%;
  position: relative;
  z-index: 1;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Desktop: Sidebar aberta */
  ${props => props.$withSidebar && props.$isDesktop && css`
    padding-left: calc(240px + 1.5rem);
  `}
  
  /* Desktop: Sidebar fechada */
  ${props => !props.$withSidebar && props.$isDesktop && css`
    padding-left: calc(62px + 1.5rem);
  `}
  
  /* A sidebar tem largura fixa de 240px (aberta) / 62px (recolhida) em
     qualquer largura de desktop — o padding precisa acompanhar, senão o
     menu cobre o conteúdo entre 768px e 1200px. */

  @media (max-width: 768px) {
    padding: 0 1rem 1rem;
    padding-left: 1rem !important;
  }
  
  @media (max-width: 576px) {
    padding: 0 0.75rem 0.75rem;
  }
`;

export const PageContainer = styled.div`
  width: 100%;
`;

export const ContentWrapper = styled.div`
  width: 100%;
`;