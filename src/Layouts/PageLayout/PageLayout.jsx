import React, { useState } from 'react';
import * as S from './PageLayoutStyles';
import HelpModal from '../../components/Help/HelpModal';
import { 
  FaExclamationTriangle, 
  FaInbox, 
  FaSpinner,
  FaQuestionCircle
} from 'react-icons/fa';

const PageLayout = ({ 
  children, 
  title, 
  subtitle,
  icon,
  actions,
  helpContent,
  helpTitle = "Guia Rápido",
  helpType = "info",
  loading = false,
  error = null,
  empty = false,
  emptyMessage = "Nenhum dado encontrado",
  className = "",
  ...props 
}) => {
  const [showHelp, setShowHelp] = useState(false);

  if (loading) {
    return (
      <S.Container className={className} {...props}>
        <S.StateContainer>
          <S.SpinnerWrapper>
            <FaSpinner />
          </S.SpinnerWrapper>
          <S.StateTitle>Carregando...</S.StateTitle>
        </S.StateContainer>
      </S.Container>
    );
  }

  if (error) {
    return (
      <S.Container className={className} {...props}>
        <S.StateContainer>
          <S.ErrorIcon>
            <FaExclamationTriangle />
          </S.ErrorIcon>
          <S.StateTitle>Ops! Algo deu errado</S.StateTitle>
          <S.StateMessage>{error}</S.StateMessage>
        </S.StateContainer>
      </S.Container>
    );
  }

  if (empty) {
    return (
      <S.Container className={className} {...props}>
        <S.StateContainer>
          <S.EmptyIcon>
            <FaInbox />
          </S.EmptyIcon>
          <S.StateTitle>{emptyMessage}</S.StateTitle>
        </S.StateContainer>
      </S.Container>
    );
  }

  const hasHelp = Boolean(helpContent);

  return (
    <>
      <S.Container className={className} {...props}>
        <S.Header>
          <S.HeaderLeft>
            {icon && <S.IconWrapper>{icon}</S.IconWrapper>}
            <S.TitlesWrapper>
              {title && <S.Title>{title}</S.Title>}
              {subtitle && <S.Subtitle>{subtitle}</S.Subtitle>}
            </S.TitlesWrapper>
          </S.HeaderLeft>
          
          <S.HeaderRight>
            {hasHelp && (
              <S.HelpButton onClick={() => setShowHelp(true)}>
                <FaQuestionCircle />
                <span>Guia Rápido</span>
              </S.HelpButton>
            )}
            {actions && <S.ActionsWrapper>{actions}</S.ActionsWrapper>}
          </S.HeaderRight>
        </S.Header>

        <S.Content>
          {children}
        </S.Content>
      </S.Container>

      <HelpModal 
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title={helpTitle}
        content={helpContent}
        type={helpType}
      />
    </>
  );
};

export default PageLayout;