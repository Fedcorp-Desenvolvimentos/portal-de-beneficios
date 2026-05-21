import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

export const GradientBg = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  background: linear-gradient(135deg, #0F3D5D 0%, #1a5a7a 50%, #D3D3D2 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%);
  }
`;

export const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 1rem;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
`;

export const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  width: 100%;
`;

export const LoginBox = styled.div`
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${fadeIn} 0.5s ease-out;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 768px) {
    padding: 2rem;
    max-width: 380px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 20px;
  }
`;

export const LogoImg = styled.img`
  width: 200px;
  height: auto;
  margin: 0 auto 1.5rem;
  display: block;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (min-width: 769px) {
    width: 220px;
  }

  @media (max-width: 480px) {
    width: 150px;
    margin-bottom: 1rem;
  }
`;

export const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #0F3D5D;
  text-align: center;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;

  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    font-size: 0.8125rem;
    margin-bottom: 1.5rem;
  }
`;

export const Form = styled.form`
  width: 100%;
`;

export const InputGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;

  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

export const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #0F3D5D;
  font-size: 0.875rem;

  @media (max-width: 480px) {
    font-size: 0.8125rem;
  }
`;

export const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: white;
  width: 100%;

  &:focus {
    border-color: #0F3D5D;
    box-shadow: 0 0 0 3px rgba(15, 61, 93, 0.1);
    outline: none;
  }

  &::placeholder {
    color: #94a3b8;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
`;

export const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

export const TogglePasswordButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 1.125rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: #0F3D5D;
  }

  &:focus {
    outline: none;
  }
`;

export const ErrorMessage = styled.p`
  color: #dc2626;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  padding: 0.875rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 1.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  animation: ${fadeIn} 0.3s ease;
`;

export const LoginButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #0F3D5D 0%, #1a5a7a 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(15, 61, 93, 0.3);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
`;

export const ForgotPassword = styled.a`
  display: block;
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.8125rem;
  color: #0F3D5D;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    color: #1a5a7a;
    text-decoration: underline;
  }
`;