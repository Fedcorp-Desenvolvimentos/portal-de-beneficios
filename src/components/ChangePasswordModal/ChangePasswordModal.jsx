// src/components/ChangePasswordModal/ChangePasswordModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes, FaLock, FaEye, FaEyeSlash, FaKey, FaCheckCircle } from 'react-icons/fa';
import * as S from './ChangePasswordModalStyles';
import api from '../../services/api';

const ChangePasswordModalContent = ({ onClose, onSuccess, userName }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'A nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua nova senha';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const payload = {
        old_password: null, // Para primeiro acesso, não tem senha antiga
        new_password: formData.newPassword
      };
      
      await api.post('/api/users/password/', payload);
      
      setSuccess(true);
      
      // Aguarda 2 segundos para mostrar o sucesso, depois fecha e desloga
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setErrors({
        submit: error.response?.data?.detail || 'Erro ao alterar senha. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (success) {
    return (
      <S.ModalOverlay>
        <S.ModalContent onClick={(e) => e.stopPropagation()}>
          <S.SuccessContent>
            <S.SuccessIcon>
              <FaCheckCircle />
            </S.SuccessIcon>
            <S.SuccessTitle>Senha alterada com sucesso!</S.SuccessTitle>
            <S.SuccessMessage>
              Sua senha foi atualizada. Você será redirecionado para o login em instantes.
            </S.SuccessMessage>
          </S.SuccessContent>
        </S.ModalContent>
      </S.ModalOverlay>
    );
  }

  return (
    <S.ModalOverlay>
      <S.ModalContent onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <S.ModalTitleWrapper>
            <FaKey />
            <S.ModalTitle>Primeiro Acesso - Definir Senha</S.ModalTitle>
          </S.ModalTitleWrapper>
          <S.ModalClose onClick={onClose}>
            <FaTimes />
          </S.ModalClose>
        </S.ModalHeader>
        
        <S.ModalBody>
          <S.WelcomeMessage>
            <p>Olá, <strong>{userName}</strong>!</p>
            <p>Este é seu primeiro acesso. Por favor, defina uma senha segura para continuar.</p>
          </S.WelcomeMessage>
          
          <S.Form onSubmit={handleSubmit}>
            <S.FormGroup>
              <S.Label htmlFor="newPassword">
                <FaLock />
                Nova Senha
              </S.Label>
              <S.InputWrapper>
                <S.Input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Digite sua nova senha"
                  $hasError={!!errors.newPassword}
                />
                <S.TogglePassword
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </S.TogglePassword>
              </S.InputWrapper>
              {errors.newPassword && <S.ErrorMessage>{errors.newPassword}</S.ErrorMessage>}
              <S.Hint>A senha deve ter pelo menos 6 caracteres</S.Hint>
            </S.FormGroup>
            
            <S.FormGroup>
              <S.Label htmlFor="confirmPassword">
                <FaLock />
                Confirmar Senha
              </S.Label>
              <S.InputWrapper>
                <S.Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirme sua nova senha"
                  $hasError={!!errors.confirmPassword}
                />
                <S.TogglePassword
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </S.TogglePassword>
              </S.InputWrapper>
              {errors.confirmPassword && <S.ErrorMessage>{errors.confirmPassword}</S.ErrorMessage>}
            </S.FormGroup>
            
            {errors.submit && <S.SubmitError>{errors.submit}</S.SubmitError>}
            
            <S.ModalFooter>
              <S.ModalButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Alterando...' : 'Definir Senha'}
              </S.ModalButton>
            </S.ModalFooter>
          </S.Form>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

const ChangePasswordModal = ({ isOpen, onClose, onSuccess, userName }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <ChangePasswordModalContent
      onClose={onClose}
      onSuccess={onSuccess}
      userName={userName}
    />,
    document.body
  );
};

export default ChangePasswordModal;