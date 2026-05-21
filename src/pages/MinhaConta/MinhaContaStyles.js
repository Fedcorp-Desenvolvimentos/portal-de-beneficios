import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }
`;

export const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

// Tabs
export const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  padding: 0 1.5rem;

  @media (max-width: 640px) {
    padding: 0 1rem;
  }
`;

export const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  svg {
    font-size: 1.125rem;
  }

  &:hover {
    color: #0F3D5D;
    background: rgba(15, 61, 93, 0.05);
  }

  &.active {
    color: #0F3D5D;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #0F3D5D;
    }
  }

  @media (max-width: 480px) {
    span {
      display: none;
    }
    
    svg {
      font-size: 1.25rem;
    }
  }
`;

// Messages
export const MessagesContainer = styled.div`
  padding: 1rem 1.5rem 0 1.5rem;

  @media (max-width: 640px) {
    padding: 0.75rem 1rem 0 1rem;
  }
`;

export const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  animation: slideDown 0.3s ease-out;

  ${props => props.$type === 'success' && `
    background: #dcfce7;
    color: #166534;
    border-left: 4px solid #10b981;
  `}

  ${props => props.$type === 'error' && `
    background: #fee2e2;
    color: #991b1b;
    border-left: 4px solid #ef4444;
  `}
`;

export const AlertClose = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s ease;
  color: inherit;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 0.875rem;
  }
`;

// Content
export const Content = styled.div`
  padding: 1.5rem;

  @media (max-width: 640px) {
    padding: 1rem;
  }
`;

// Forms
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: 640px) {
    gap: 1rem;
  }
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

export const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #0F3D5D;
    box-shadow: 0 0 0 3px rgba(15, 61, 93, 0.1);
  }

  &:disabled {
    background: #f8fafc;
    color: #1e293b;
    cursor: not-allowed;
    opacity: 0.8;
  }

  ${props => props.$isEditing && `
    border-color: #0F3D5D;
    background: #eff6ff;
  `}

  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    flex: 1;
    padding-right: 2.5rem;
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: color 0.2s ease;

  &:hover {
    color: #0F3D5D;
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 42px;
  padding: 0 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: linear-gradient(135deg, #0F3D5D 0%, #1a5a7a 100%);
    color: white;
    border: none;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(15, 61, 93, 0.3);
    }
  }

  &.secondary {
    background: white;
    color: #475569;
    border: 2px solid #e2e8f0;

    &:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #0F3D5D;
      color: #0F3D5D;
    }
  }

  &.danger {
    background: #fee2e2;
    color: #dc2626;
    border: none;

    &:hover:not(:disabled) {
      background: #dc2626;
      color: white;
      transform: translateY(-2px);
    }
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    height: 38px;
    padding: 0 1rem;
    font-size: 0.8rem;
  }
`;

// Loading
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #0F3D5D;
    border-radius: 50%;
    animation: ${spin} 0.6s linear infinite;
  }

  p {
    color: #64748b;
    font-size: 0.875rem;
  }
`;