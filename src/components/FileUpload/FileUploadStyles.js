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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Modal Styles
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
`;

export const ModalCard = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: ${slideDown} 0.2s ease;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;
`;

export const GhostButton = styled.button`
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
    color: #1e293b;
  }
`;

// Main Upload Card Styles
export const UploadCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
`;

export const UploadHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

export const UploadHeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const UploadIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2463eb;
`;

export const UploadTitle = styled.h2`
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

export const UploadSubtitle = styled.p`
  margin: 0;
  font-size: 13px;
  color: #64748b;
`;

export const UploadHint = styled.p`
  margin-top: 4px;
  
  small {
    font-size: 11px;
    color: #94a3b8;
  }
`;

export const ModelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #1e293b;
  }
`;

export const UploadArea = styled.div`
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafbfc;
  
  &:hover {
    border-color: #2463eb;
    background: #f8fafc;
  }
`;

export const UploadIconLarge = styled.div`
  color: #94a3b8;
  margin-bottom: 16px;
  transition: color 0.2s;
  
  ${UploadArea}:hover & {
    color: #2463eb;
  }
`;

export const UploadText = styled.p`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
`;

export const UploadFormats = styled.p`
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
`;

export const UploadStatus = styled.div`
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  ${props => props.$status === 'sucesso' && css`
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
  `}
  
  ${props => props.$status === 'erro' && css`
    background: #fef2f2;
    border: 1px solid #fecaca;
  `}
  
  ${props => props.$status === 'processando' && css`
    background: #eff6ff;
    border: 1px solid #bfdbfe;
  `}

  ${props => props.$status === 'warning' && css`
    background: #fffbeb;
    border: 1px solid #fde68a;
  `}
`;

export const UploadStatusContent = styled.div`
  flex: 1;
`;

export const UploadStatusMessage = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  
  ${UploadStatus}[data-status="sucesso"] & {
    color: #166534;
  }
  
  ${UploadStatus}[data-status="erro"] & {
    color: #991b1b;
  }
  
  ${UploadStatus}[data-status="processando"] & {
    color: #1e40af;
  }

  ${UploadStatus}[data-status="warning"] & {
    color: #b45309;
  }
`;

export const UploadStatusFile = styled.p`
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #64748b;
`;

// Modal Modelos Styles
export const ModelosContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ModelosText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #475569;
  text-align: center;
`;

export const ModelosActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  
  button {
    flex: 1;
    justify-content: center;
    height: 44px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #2463eb, #1e4db9);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: linear-gradient(135deg, #1e4db9, #1a3d8f);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;