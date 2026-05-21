import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 99999; /* Z-index altíssimo para garantir que fique acima de tudo */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${slideIn} 0.2s ease;

  @media (max-width: 640px) {
    max-width: 95%;
    border-radius: 20px;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  
  ${props => props.$type === 'warning' && css`
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  `}
  
  ${props => props.$type === 'tip' && css`
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  `}
  
  ${props => (props.$type === 'info' || !props.$type) && css`
    background: linear-gradient(135deg, #0F3D5D 0%, #1a5a7a 100%);
  `}
`;

export const ModalTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: white;
    font-size: 1.25rem;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
`;

export const ModalClose = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  cursor: pointer;
  color: white;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  color: #475569;
  line-height: 1.6;
  font-size: 0.9375rem;
  overflow-y: auto;
  flex: 1;

  /* Estilos para o conteúdo HTML que vem do help */
  h1, h2, h3, h4, h5, h6 {
    color: #0F3D5D;
    margin: 0 0 0.75rem 0;
  }

  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }
  h3 { font-size: 1.125rem; }
  h4 { font-size: 1rem; }

  p {
    margin: 0 0 1rem 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0.5rem 0;
  }

  strong {
    color: #0F3D5D;
  }

  code {
    background: #f1f5f9;
    padding: 0.125rem 0.375rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-family: monospace;
  }

  hr {
    margin: 1rem 0;
    border: none;
    border-top: 1px solid #e2e8f0;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
`;

export const ModalButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #0F3D5D 0%, #1a5a7a 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(15, 61, 93, 0.3);
  }
`;