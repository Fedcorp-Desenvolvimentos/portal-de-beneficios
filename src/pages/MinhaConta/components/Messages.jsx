import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import * as S from '../MinhaContaStyles';

const Messages = ({ success, error, onClose }) => {
  if (!success && !error) return null;

  return (
    <S.MessagesContainer>
      {success && (
        <S.Alert $type="success" role="alert">
          <FaCheckCircle />
          <span>{success}</span>
          <S.AlertClose onClick={onClose} aria-label="Fechar mensagem">
            <FaTimes />
          </S.AlertClose>
        </S.Alert>
      )}
      
      {error && (
        <S.Alert $type="error" role="alert">
          <FaExclamationTriangle />
          <span>{error}</span>
          <S.AlertClose onClick={onClose} aria-label="Fechar mensagem">
            <FaTimes />
          </S.AlertClose>
        </S.Alert>
      )}
    </S.MessagesContainer>
  );
};

export default Messages;