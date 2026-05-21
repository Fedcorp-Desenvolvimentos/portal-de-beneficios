import { useState, useCallback, useEffect } from 'react';
import { FaUserCircle, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import { IoIosBusiness } from 'react-icons/io';
import { useSnackbar } from 'notistack';
import * as S from './MinhaContaStyles';
import PageLayout from '../../Layouts/PageLayout/PageLayout';
import Tabs from './components/Tabs';
import ProfileForm from './components/ProfileForm';
import PasswordForm from './components/PasswordForm';
import { usePasswordChange } from './hooks/usePasswordChange';
import { useEditMode } from './hooks/useEditMode';
import { useLoading } from '../../hooks/useLoading';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const MinhaConta = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { withLoading } = useLoading();
  const [activeTab, setActiveTab] = useState('perfil');
  
  // Use o contexto de autenticação
  const { user, updateUser } = useAuth();
  
  // Dados do usuário a partir do contexto
  const userData = {
    userId: user?.id,
    username: user?.username || '',
    email: user?.email || '',
    nome: user?.nome || '', 
    tipo: user?.tipo || '',
    administradora_nome: user?.administradora_nome || ''
  };
  
  // console.log("userData do contexto:", userData);

  const { 
    passwordData, 
    updatePasswordField, 
    changePassword, 
    loading: passwordLoading,
    error: passwordError,
    setError: setPasswordError
  } = usePasswordChange();

  // Reset dos campos de senha
  const resetPasswordFields = useCallback(() => {
    updatePasswordField('senhaAtual', '');
    updatePasswordField('novaSenha', '');
    updatePasswordField('confirmarSenha', '');
    setPasswordError(null);
  }, [updatePasswordField, setPasswordError]);

  // Função de save para perfil
  const handleSavePerfil = useCallback(async (data) => {
    try {
      await withLoading(
        async () => {
          const updateData = {
            username: data.username,
            email: data.email,
            nome: data.nome
          };
          
          await userService.updateUser(userData.userId, updateData);
        },
        'Atualizando perfil...'
      );
      
      enqueueSnackbar('Perfil atualizado com sucesso!', { variant: 'success' });
      
      // Atualiza os dados do usuário no contexto se a função existir
      if (updateUser) {
        await updateUser();
      } else {
        // Fallback: recarregar a página
        window.location.reload();
      }
      
      return true;
    } catch (err) {
      enqueueSnackbar(err.response?.data?.detail || 'Erro ao atualizar perfil', { variant: 'error' });
      return false;
    }
  }, [userData.userId, updateUser, enqueueSnackbar, withLoading]);

  // Função de save para senha
  const handleSaveSenha = useCallback(async (data) => {
    try {
      console.log("data", data)
      const success = await withLoading(
        async () => {
          return await changePassword(
            data.senhaAtual,
            data.novaSenha,
            data.confirmarSenha
          );
        },
        'Alterando senha...'
      );
      
      if (success) {
        enqueueSnackbar('Senha alterada com sucesso!', { variant: 'success' });
        resetPasswordFields();
        return true;
      } else if (passwordError) {
        enqueueSnackbar(passwordError, { variant: 'error' });
        return false;
      }
      return false;
    } catch (err) {
      enqueueSnackbar('Erro ao alterar senha', { variant: 'error' });
      return false;
    }
  }, [changePassword, passwordError, enqueueSnackbar, resetPasswordFields, withLoading]);

  // Configurar modo de edição para perfil
  const profileEdit = useEditMode(
    {
      username: userData.username || '',
      email: userData.email || '',
      nome: userData.nome || '',
    },
    handleSavePerfil
  );

  // Configurar modo de edição para senha
  const passwordEdit = useEditMode(
    {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    },
    handleSaveSenha,
    resetPasswordFields
  );

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    await profileEdit.saveEditing();
  };

  const handleSalvarSenha = async (e) => {
    e.preventDefault();
    await passwordEdit.saveEditing();
  };

  // Se não tiver usuário, mostra loading
  if (!user) {
    return (
      <PageLayout
        title="Minha Conta"
        subtitle="Carregando..."
        icon={<IoIosBusiness />}
      >
        <S.Container>
          <S.Card>
            <S.LoadingContainer>
              <FaSpinner className="spinner" />
              <p>Carregando dados do usuário...</p>
            </S.LoadingContainer>
          </S.Card>
        </S.Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Minha Conta"
      subtitle="Gerencie suas informações pessoais e segurança"
      icon={<IoIosBusiness />}
    >
      <S.Container>
        <S.Card>
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

          <S.Content>
            {activeTab === 'perfil' ? (
              <ProfileForm
                nome={profileEdit.editedData.nome}
                setNome={(value) => profileEdit.updateField('nome', value)}
                email={profileEdit.editedData.email}
                setEmail={(value) => profileEdit.updateField('email', value)}
                editandoPerfil={profileEdit.isEditing}
                onEditClick={profileEdit.startEditing}
                onCancelClick={profileEdit.cancelEditing}
                onSubmit={handleSalvarPerfil}
              />
            ) : (
              <PasswordForm
                senhaAtual={passwordEdit.editedData.senhaAtual}
                setSenhaAtual={(value) => passwordEdit.updateField('senhaAtual', value)}
                novaSenha={passwordEdit.editedData.novaSenha}
                setNovaSenha={(value) => passwordEdit.updateField('novaSenha', value)}
                confirmarSenha={passwordEdit.editedData.confirmarSenha}
                setConfirmarSenha={(value) => passwordEdit.updateField('confirmarSenha', value)}
                editandoSenha={passwordEdit.isEditing}
                onEditClick={passwordEdit.startEditing}
                onCancelClick={passwordEdit.cancelEditing}
                onSubmit={handleSalvarSenha}
              />
            )}
          </S.Content>
        </S.Card>
      </S.Container>
    </PageLayout>
  );
};

export default MinhaConta;