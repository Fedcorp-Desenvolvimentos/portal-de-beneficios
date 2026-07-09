// src/components/FirstAccessModal/FirstAccessModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle,
  FaUserCheck 
} from 'react-icons/fa';
import * as S from './FirstAccessModalStyles';
import { userService } from '../../services/userService';

const FirstAccessModalContent = ({ onSuccess, user }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const userName = user?.nome || user?.username || user?.email?.split('@')[0] || 'Usuário';

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'A senha antiga é obrigatória';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'A nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
    } else if (formData.newPassword.length > 128) {
      newErrors.newPassword = 'A senha deve ter no máximo 128 caracteres';
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
      // Envia old_password e new_password
      const result = await userService.changePassword(formData.oldPassword, formData.newPassword);
      
      if (result.success) {
        setSuccess(true);
        
        // Aguarda 2 segundos e chama o onSuccess
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setErrors({
          submit: result.error
        });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setErrors({
        submit: 'Erro ao alterar senha. Tente novamente.'
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
            <FaUserCheck />
            <S.ModalTitle>Primeiro Acesso - Alterar Senha</S.ModalTitle>
          </S.ModalTitleWrapper>
        </S.ModalHeader>
        
        <S.ModalBody>
          <S.WelcomeMessage>
            <S.WelcomeText>
              Olá, <strong>{userName}</strong>!
            </S.WelcomeText>
            <S.InfoText>
              Este é seu primeiro acesso. <strong>Você precisa alterar sua senha para continuar.</strong>
            </S.InfoText>
          </S.WelcomeMessage>
          
          <S.Form onSubmit={handleSubmit}>
            <S.FormGroup>
              <S.Label htmlFor="oldPassword">
                <FaLock />
                Senha Antiga
              </S.Label>
              <S.InputWrapper>
                <S.Input
                  type={showOldPassword ? 'text' : 'password'}
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  placeholder="Digite sua senha atual"
                  $hasError={!!errors.oldPassword}
                  autoFocus
                />
                <S.TogglePassword
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                </S.TogglePassword>
              </S.InputWrapper>
              {errors.oldPassword && <S.ErrorMessage>{errors.oldPassword}</S.ErrorMessage>}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label htmlFor="newPassword">
                <FaLock />
                Nova Senha
              </S.Label>
              <S.InputWrapper>
                <S.Input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Digite sua nova senha"
                  $hasError={!!errors.newPassword}
                />
                <S.TogglePassword
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </S.TogglePassword>
              </S.InputWrapper>
              {errors.newPassword && <S.ErrorMessage>{errors.newPassword}</S.ErrorMessage>}
              <S.Hint>A senha deve ter pelo menos 6 caracteres</S.Hint>
            </S.FormGroup>
            
            <S.FormGroup>
              <S.Label htmlFor="confirmPassword">
                <FaLock />
                Confirmar Nova Senha
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
                {isSubmitting ? 'Alterando senha...' : 'Alterar Senha e Acessar'}
              </S.ModalButton>
            </S.ModalFooter>
          </S.Form>
        </S.ModalBody>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

const FirstAccessModal = ({ isOpen, onClose, onSuccess, user }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <FirstAccessModalContent
      onSuccess={onSuccess}
      user={user}
    />,
    document.body
  );
};

export default FirstAccessModal;