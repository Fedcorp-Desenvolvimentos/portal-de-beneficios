// hooks/usePasswordChange.js
import { useState } from 'react';
import { userService } from '../../../services/userService';

export const usePasswordChange = () => {
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatePasswordField = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const changePassword = async (senhaAtual, novaSenha, confirmarSenha) => {
    // Validações
    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return false;
    }

    if (novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      // ✅ Agora chama a função CORRETA
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
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao alterar senha');
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