import styled from 'styled-components';

const primary = '#164274';
const accent = '#0093d2';
const ring = '0 0 0 3px rgba(0, 147, 210, 0.22)';

export const Page = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: ${primary};
  color: #111827;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const BrandSide = styled.section`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 5vw, 64px);
  overflow: hidden;
  background-image:
    linear-gradient(
      160deg,
      rgba(8, 20, 42, 0.94) 0%,
      rgba(18, 50, 100, 0.85) 55%,
      rgba(0, 100, 180, 0.8) 100%
    ),
    url('/assets/BG-Login.png');
  background-size: cover;
  background-position: 40% 50%;

  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      rgba(0, 147, 210, 0.18) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 320px;
    height: 320px;
    background: radial-gradient(
      circle,
      rgba(0, 147, 210, 0.12) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  @media (max-width: 980px) {
    order: 2;
    min-height: 300px;
    padding: 40px 24px;
  }
`;

export const BrandInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 36px;

  @media (max-width: 980px) {
    gap: 24px;
  }
`;

export const BrandLogoWrap = styled.div`
  display: flex;
`;

export const BrandLogo = styled.img`
  max-width: 150px;
  height: auto;
  display: block;
`;

export const BrandCopy = styled.div`
  h1 {
    margin: 0;
    font-size: clamp(1.7rem, 2.8vw, 2.2rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  p {
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

export const Features = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;

  @media (max-width: 980px) {
    gap: 10px;
  }
`;

export const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  backdrop-filter: blur(4px);
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  strong {
    display: block;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 2px;
  }

  span {
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.78rem;
    line-height: 1.4;
  }
`;

export const FeatureIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(0, 147, 210, 0.25);
  color: #5bcfff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  margin-top: 1px;
`;

export const FormSide = styled.section`
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px, 4vw, 48px);

  @media (max-width: 980px) {
    order: 1;
    min-height: 100vh;
    padding: 40px 24px;
  }
`;

export const FormInner = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const FormHeader = styled.header`
  margin-bottom: 32px;

  h2 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.025em;
  }

  p {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 6px 0 0;
  }
`;

export const Form = styled.form`
  width: 100%;
`;

export const Field = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: 0.82rem;
  color: #374151;
  margin-bottom: 7px;
  letter-spacing: 0.01em;
`;

export const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const InputIcon = styled.span`
  position: absolute;
  left: 14px;
  color: #9ca3af;
  font-size: 0.85rem;
  pointer-events: none;
  z-index: 1;
  display: inline-flex;
`;

export const Input = styled.input`
  width: 100%;
  padding: 11px 42px 11px 40px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  font-family: inherit;
  font-size: 0.9rem;
  color: #111827;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: ${accent};
    box-shadow: ${ring};
  }

  &:disabled {
    color: #6b7280;
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

export const PeekButton = styled.button`
  position: absolute;
  right: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  font-size: 0.95rem;
  padding: 4px;
  transition: color 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    color: ${primary};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 0.82rem;
  gap: 16px;
`;

export const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 7px;
  color: #374151;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  input[type='checkbox'] {
    width: 15px;
    height: 15px;
    accent-color: ${accent};
    cursor: pointer;
  }
`;

export const MutedLink = styled.a`
  color: ${accent};
  text-decoration: none;
  font-weight: 500;
  font-size: 0.82rem;
  transition: opacity 0.15s;
  white-space: nowrap;

  &:hover {
    opacity: 0.75;
  }
`;

export const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, ${primary} 0%, ${accent} 100%);
  color: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 16px rgba(22, 66, 116, 0.3);
  transition:
    opacity 0.15s,
    transform 0.1s,
    box-shadow 0.15s;

  svg {
    font-size: 0.85rem;
    transition: transform 0.2s;
  }

  &:hover:not(:disabled) {
    opacity: 0.93;
    transform: translateY(-1px);
    box-shadow: 0 6px 22px rgba(22, 66, 116, 0.38);

    svg {
      transform: translateX(3px);
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const Feedback = styled.div`
  margin-top: 14px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  min-height: 20px;
  color: #ef4444;
  visibility: ${(props) => (props.$visible ? 'visible' : 'hidden')};
`;

export const FormFooter = styled.footer`
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;

  small {
    color: #9ca3af;
    font-size: 0.75rem;
    line-height: 1.5;
  }
`;
