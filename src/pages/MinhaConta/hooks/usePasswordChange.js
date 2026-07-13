// hooks/usePasswordChange.js
import { useState } from 'react';
import { userService } from '../../../services/userService';
import { useSnackbar } from 'notistack';

export const usePasswordChange = () => {
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const updatePasswordField = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError(null);
    }
  };

  const changePassword = async (senhaAtual, novaSenha, confirmarSenha) => {
    // Validações
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      enqueueSnackbar('As senhas não coincidem', { variant: 'error' });
      return false;
    }

    if (novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      enqueueSnackbar('A nova senha deve ter pelo menos 6 caracteres', { variant: 'error' });
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await userService.changePassword(senhaAtual, novaSenha);
      
      if (result.success) {
        setPasswordData({
          senhaAtual: '',
          novaSenha: '',
          confirmarSenha: ''
        });
        return true;
      } else {
        setError(result.error);
        enqueueSnackbar(result.error, { variant: 'error' });
        return false;
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Erro ao alterar senha';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    passwordData,
    updatePasswordField,
    changePassword,
    loading,
    error,
    setError
  };
};