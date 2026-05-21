import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
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

export const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${fadeInUp} 0.5s ease;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 20px;
  }
`;

export const LogoWrapper = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

export const LogoImg = styled.img`
  max-width: 180px;
  height: auto;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 480px) {
    max-width: 150px;
  }
`;

export const Title = styled.h1`
  text-align: center;
  color: #0F3D5D;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

export const Subtitle = styled.p`
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 2rem;
`;

export const InfoBox = styled.div`
  background: #e0f2fe;
  border-left: 4px solid #0ea5e9;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;

  svg {
    color: #0ea5e9;
    font-size: 1.25rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    color: #0369a1;
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

export const Form = styled.form`
  margin-bottom: 1.5rem;
`;

export const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #0F3D5D;
  font-weight: 600;
  font-size: 0.875rem;

  svg {
    color: #64748b;
    font-size: 0.875rem;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #0F3D5D;
    box-shadow: 0 0 0 3px rgba(15, 61, 93, 0.1);
  }

  &:disabled {
    background-color: #f8fafc;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #94a3b8;
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #0F3D5D 0%, #1a5a7a 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9375rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  line-height: 1;
  text-align: center;

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

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(15, 61, 93, 0.3);
    
    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .spinner {
    animation: ${spin} 0.8s linear infinite;
    display: inline-block;
  }
`;

export const BackButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: white;
  color: #0F3D5D;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  line-height: 1;

  &:hover {
    background: #f8fafc;
    border-color: #0F3D5D;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 0.875rem;
    flex-shrink: 0;
  }
`;