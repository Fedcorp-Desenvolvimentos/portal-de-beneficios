import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

export const Container = styled.div`
  padding: 1.5rem;
  animation: ${fadeIn} 0.3s ease;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

// ============================================
// HEADER
// ============================================
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
  gap: 1rem;
  flex-wrap: wrap;

  /* Em telas menores que 900px, empilha */
  @media (max-width: 450px) {
    font-size: 0.3rem;
  }
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  flex: 1;

  /* Em telas médias, centraliza dentro do container pai */
  @media (max-width: 900px) {
    justify-content: center;
  }

  /* Em mobile, mantém alinhamento à esquerda com wrap */
  @media (max-width: 560px) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;

  /* Quando empilhado, alinha à direita do container */
  @media (max-width: 900px) {
    justify-content: flex-end;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%);
  border-radius: 18px;
  color: #2463eb;
  flex-shrink: 0;
  transition: all 0.2s ease;

  svg {
    font-size: 28px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const TitlesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0; /* Permite que o texto quebre corretamente */

  /* Em telas médias, centraliza */
  @media (max-width: 900px) {
    align-items: center;
    text-align: center;
  }

  /* Em mobile, alinha à esquerda */
  @media (max-width: 560px) {
    align-items: flex-start;
    text-align: left;
  }
`;

export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0F3D5D 0%, #2463eb 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
  word-break: break-word;

  /* Esconde em telas muito pequenas para economizar espaço */
  @media (max-width: 480px) {
    display: none;
  }
`;

export const ActionsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// ============================================
// BOTÃO DE AJUDA
// ============================================
export const HelpButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  svg {
    color: #2463eb;
    transition: transform 0.2s ease;
  }

  &:hover {
    background: linear-gradient(135deg, #e8f0fe 0%, #dbeafe 100%);
    border-color: #2463eb;
    color: #2463eb;
    transform: translateY(-1px);
    
    svg {
      transform: scale(1.05);
    }
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    padding: 0.5rem 0.75rem;
    
    span {
      display: none;
    }
  }
`;

// ============================================
// CONTENT
// ============================================
export const Content = styled.div`
  width: 100%;
`;

// ============================================
// STATES (Loading, Error, Empty)
// ============================================
export const StateContainer = styled.div`
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    min-height: 300px;
    padding: 2rem;
  }
`;

export const SpinnerWrapper = styled.div`
  margin-bottom: 1rem;
  
  svg {
    width: 48px;
    height: 48px;
    color: #2463eb;
    animation: ${spin} 0.8s linear infinite;
  }
`;

export const ErrorIcon = styled.div`
  margin-bottom: 1rem;
  
  svg {
    width: 48px;
    height: 48px;
    color: #ef4444;
  }
`;

export const EmptyIcon = styled.div`
  margin-bottom: 1rem;
  
  svg {
    width: 48px;
    height: 48px;
    color: #64748b;
  }
`;

export const StateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

export const StateMessage = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  max-width: 400px;
`;

// ============================================
// MODAL DE AJUDA
// ============================================
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${slideIn} 0.2s ease;

  @media (max-width: 640px) {
    max-width: 95%;
    border-radius: 16px;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

export const ModalTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #f59e0b;
  }
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0F3D5D;
`;

export const ModalClose = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #ef4444;
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  color: #475569;
  line-height: 1.6;
  font-size: 0.9375rem;
  max-height: 60vh;
  overflow-y: auto;

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
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(15, 61, 93, 0.3);
  }
`;