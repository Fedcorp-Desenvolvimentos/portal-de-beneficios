// src/components/ChangePasswordModal/ChangePasswordModalStyles.js
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

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

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
  border-radius: 24px;
  max-width: 500px;
  width: 100%;
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
  background: linear-gradient(135deg, #0F3D5D 0%, #1a5a7a 100%);
`;

export const ModalTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #FFD700;
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
  flex: 1;
`;

export const WelcomeMessage = styled.div`
  background: #f0f9ff;
  border-left: 4px solid #0F3D5D;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  
  p {
    margin: 0 0 0.5rem 0;
    color: #475569;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    strong {
      color: #0F3D5D;
    }
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0F3D5D;
  
  svg {
    font-size: 0.875rem;
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid ${props => props.$hasError ? '#dc2626' : '#e2e8f0'};
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #0F3D5D;
    box-shadow: 0 0 0 3px rgba(15, 61, 93, 0.1);
  }
  
  &::placeholder {
    color: #cbd5e1;
  }
`;

export const TogglePassword = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: #0F3D5D;
  }
`;

export const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
`;

export const SubmitError = styled.div`
  background: #fee2e2;
  border-left: 4px solid #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #991b1b;
`;

export const Hint = styled.small`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
`;

export const ModalFooter = styled.div`
  margin-top: 0.5rem;
`;

export const ModalButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #0F3D5D 0%, #1a5a7a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 61, 93, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SuccessContent = styled.div`
  padding: 2rem;
  text-align: center;
`;

export const SuccessIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  animation: ${pulse} 0.5s ease;
  
  svg {
    font-size: 2rem;
    color: white;
  }
`;

export const SuccessTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0F3D5D;
`;

export const SuccessMessage = styled.p`
  margin: 0;
  font-size: 0.9375rem;
  color: #475569;
  line-height: 1.5;
`;