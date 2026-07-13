import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

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

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  width: 100%;
  animation: ${fadeInUp} 0.4s ease-out;

  @media (min-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  @media (min-width: 992px) and (max-width: 1399px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
`;

export const Card = styled.div`
  background: var(--color-bg-card, #ffffff);
  border: 1px solid var(--color-border-light, #e2e8f0);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  height: 100%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.$color || 'var(--color-primary)'};
    transform: scaleX(0);
    transition: transform 0.3s ease;
    transform-origin: left;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-lg);
    border-color: ${props => props.$color || 'var(--color-border)'};
    
    &::before {
      transform: scaleX(1);
    }
  }

  @media (max-width: 767px) {
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

export const CardBody = styled.div`
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  min-height: 320px;

  @media (max-width: 768px) {
    padding: 1.5rem;
    min-height: auto;
  }
`;

export const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: ${props => `${props.$color}15` || 'var(--color-primary-light)'};
  color: ${props => props.$color || 'var(--color-primary)'};
  border-radius: 20px;
  margin-bottom: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  svg {
    font-size: 28px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${Card}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
    
    svg {
      transform: scale(1.05);
    }
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    margin-bottom: 1rem;

    svg {
      font-size: 24px;
    }
  }
`;

export const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.75rem;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

export const Description = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
  line-height: 1.6;
  margin: 0 0 1.5rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: 0.8125rem;
    margin-bottom: 1.25rem;
    -webkit-line-clamp: 4;
  }
`;

export const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  background: ${({ $color }) => $color || 'var(--color-primary)'};
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  min-width: 140px;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    background: white;
    color: ${({ $color }) => $color || 'var(--color-primary)'};
    border: 1px solid ${({ $color }) => $color || 'var(--color-primary)'};
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);

    svg {
      transform: translateX(2px);
    }
  }
`;

export const ExternalButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  background: ${({ $color }) => $color || 'var(--color-primary)'};
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  min-width: 140px;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    background: white;
    color: ${({ $color }) => $color || 'var(--color-primary)'};
    border: 1px solid ${({ $color }) => $color || 'var(--color-primary)'};
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);

    svg {
      transform: translateX(2px);
    }
  }
`;

export const Badge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: ${props => `${props.$color}15` || '#f1f5f9'};
  color: ${props => props.$color || '#64748b'};
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  width: auto;
  min-width: 120px;
`;

export const SmallBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${props => `${props.$color}15` || '#f1f5f9'};
  color: ${props => props.$color || '#64748b'};
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
`;