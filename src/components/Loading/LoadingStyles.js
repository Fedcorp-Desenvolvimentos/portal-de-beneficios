import styled, { keyframes } from 'styled-components';

// Animações
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Overlay do loading
export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.432);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

// Container principal
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 32px;
  background: transparent;
`;

// Wrapper da logo
export const LogoWrapper = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 640px) {
    width: 150px;
    height: 150px;
  }
`;

// Logo
export const LogoImg = styled.img`
  width: 160px;
  height: 160px;
  object-fit: contain;
  z-index: 2;
  display: block;

  @media (max-width: 640px) {
    width: 120px;
    height: 120px;
  }
`;

// SVG do progresso circular
export const ProgressSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);

  circle {
    transition: stroke-dashoffset 0.2s linear;
  }
`;

// Container da mensagem
export const MessageContainer = styled.div`
  text-align: center;
`;

// Texto da mensagem
export const MessageText = styled.p`
  color: #1e293b;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  margin-bottom: 8px;

  @media (max-width: 640px) {
    font-size: 0.875rem;
  }
`;

// Porcentagem (comentada mas mantida)
export const PercentageText = styled.p`
  color: #2463eb;
  font-size: 20px;
  font-weight: 600;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

// Adicione isso no seu LoadingStyles.js
export const PercentageBadge = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
  color: #2463eb;
  background: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-family: monospace;
  z-index: 3;

  @media (max-width: 640px) {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
`;

export const ProgressBarContainer = styled.div`
  width: 280px;
  max-width: 80vw;
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 12px;
`;

export const ProgressBarFill = styled.div`
  width: ${props => props.$progress || 0}%;
  height: 100%;
  background-color: #2463eb;
  border-radius: 3px;
  transition: width 0.3s ease;
`;