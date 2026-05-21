import React from 'react';
import ReactDOM from 'react-dom';
import { 
  FaTimes, 
  FaLightbulb, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaQuestionCircle
} from 'react-icons/fa';
import * as S from './HelpModalStyles';

const HelpModalContent = ({ 
  onClose, 
  title, 
  content, 
  type 
}) => {
  const getIconByType = () => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle />;
      case 'tip':
        return <FaLightbulb />;
      default:
        return <FaInfoCircle />;
    }
  };

  const renderContent = () => {
    if (typeof content === 'string') {
      return <p>{content}</p>;
    }
    return content;
  };

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader $type={type}>
          <S.ModalTitleWrapper>
            {getIconByType()}
            <S.ModalTitle>{title}</S.ModalTitle>
          </S.ModalTitleWrapper>
          <S.ModalClose onClick={onClose}>
            <FaTimes />
          </S.ModalClose>
        </S.ModalHeader>
        
        <S.ModalBody>
          {renderContent()}
        </S.ModalBody>
        
        <S.ModalFooter>
          <S.ModalButton onClick={onClose}>
            Entendi
          </S.ModalButton>
        </S.ModalFooter>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

const HelpModal = ({ 
  isOpen, 
  onClose, 
  title = "Guia Rápido",
  content,
  type = "info" // info, warning, tip
}) => {
  if (!isOpen) return null;

  // Renderiza o modal diretamente no body usando Portal
  return ReactDOM.createPortal(
    <HelpModalContent
      onClose={onClose}
      title={title}
      content={content}
      type={type}
    />,
    document.body
  );
};

export default HelpModal;