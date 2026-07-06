// pages/Interno/Usuarios/UsuarioModal.jsx
import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 9999;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  width: min(500px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  animation: slideIn 0.2s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-tertiary);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-tertiary);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-border-light);
    color: var(--color-text-primary);
  }
`;

const Form = styled.form`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  input,
  select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 14px;
    font-family: var(--font-family);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    &:disabled {
      background: var(--color-bg-tertiary);
      cursor: not-allowed;
    }
  }

  select {
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }
  }
`;

const ErrorMessage = styled.div`
  background: var(--color-danger-bg);
  color: var(--color-danger);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  border: 1px solid #fca5a5;
`;

const PasswordHint = styled.div`
  color: var(--color-text-tertiary);
  font-size: 11px;
  margin-top: 4px;
`;

const FieldError = styled.div`
  color: var(--color-danger);
  font-size: 12px;
  margin-top: 4px;
`;

const HelpText = styled.div`
  color: var(--color-text-tertiary);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 6px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-light);
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${(props) =>
    props.$variant === 'secondary' &&
    `
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);

    &:hover:not(:disabled) {
      background: var(--color-border-light);
    }
  `}

  ${(props) =>
    props.$variant === 'primary' &&
    `
    background: var(--color-primary);
    color: white;

    &:hover:not(:disabled) {
      background: var(--color-primary-dark);
      transform: translateY(-1px);
    }
  `}
`;

const TIPOS_USUARIO = [
  {
    value: 'adm',
    label: 'Usuário da Administradora / Imobiliária',
  },
  {
    value: 'dep',
    label: 'Departamento Pessoal',
  },
];

export default function UsuarioModal({
  isOpen,
  onClose,
  onSave,
  usuario,
  administradoraId,
  administradoras = [],
  title,
  tiposPermitidos = ['adm', 'dep'],
  bloquearTipoUsuario = false,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const tiposPermitidosNormalizados = Array.isArray(tiposPermitidos)
    ? tiposPermitidos.filter(Boolean)
    : ['adm', 'dep'];

  const tiposDisponiveis = TIPOS_USUARIO.filter((tipo) =>
    tiposPermitidosNormalizados.includes(tipo.value)
  );

  const tipoPadrao = tiposDisponiveis[0]?.value || 'adm';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipo: tipoPadrao,
    administradora: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (usuario) {
      const tipoUsuario = usuario.tipo || tipoPadrao;
      const tipoPermitido = tiposPermitidosNormalizados.includes(tipoUsuario)
        ? tipoUsuario
        : tipoPadrao;

      setFormData({
        username: usuario.username || '',
        email: usuario.email || '',
        tipo: bloquearTipoUsuario ? tipoPermitido : tipoUsuario,
        administradora:
          usuario.administradora_id ||
          usuario.administradora?.id ||
          usuario.administradora ||
          administradoraId ||
          null,
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        tipo: tipoPadrao,
        administradora: administradoraId || null,
        password: '',
        confirmPassword: '',
      });
    }

    setError('');
    setPasswordError('');
  }, [
    usuario,
    administradoraId,
    isOpen,
    tipoPadrao,
    bloquearTipoUsuario,
    tiposPermitidosNormalizados.join('|'),
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tipo' && bloquearTipoUsuario) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }

    if (error) {
      setError('');
    }
  };

  const getTipoDescricao = (tipo) => {
    if (tipo === 'adm') {
      return 'Usuário da Administradora: acessa os dados dos condomínios permitidos pela regra do backend.';
    }

    if (tipo === 'dep') {
      return 'Departamento Pessoal: acessa apenas as informações internas da administradora.';
    }

    return '';
  };

  const getTipoLabel = (tipo) => {
    return TIPOS_USUARIO.find((item) => item.value === tipo)?.label || tipo || '—';
  };

  const validarFormulario = () => {
    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    if (!username) {
      throw new Error('Nome de usuário é obrigatório');
    }

    if (!email) {
      throw new Error('Email é obrigatório');
    }

    if (!email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!formData.tipo) {
      throw new Error('Tipo de usuário é obrigatório');
    }

    if (!['adm', 'dep'].includes(formData.tipo)) {
      throw new Error('Tipo de usuário inválido');
    }

    if (!tiposPermitidosNormalizados.includes(formData.tipo)) {
      throw new Error('Você não tem permissão para salvar este tipo de usuário');
    }

    if (!formData.administradora) {
      throw new Error('Administradora é obrigatória');
    }

    if (!usuario && !password) {
      throw new Error('Senha é obrigatória');
    }

    if (password || !usuario) {
      if (password.length < 6) {
        setPasswordError('A senha deve ter no mínimo 6 caracteres');
        throw new Error('A senha deve ter no mínimo 6 caracteres');
      }

      if (password !== confirmPassword) {
        setPasswordError('As senhas não coincidem');
        throw new Error('As senhas não coincidem');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setPasswordError('');

    try {
      validarFormulario();

      const password = formData.password.trim();

      const dadosParaEnvio = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        tipo: formData.tipo,
        administradora: formData.administradora
          ? Number(formData.administradora)
          : null,
      };

      if (password) {
        dadosParaEnvio.password = password;
      }

      await onSave(dadosParaEnvio);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);

      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        'Erro ao salvar usuário';

      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{title || (usuario ? 'Editar Usuário' : 'Novo Usuário')}</h3>

          <CloseButton type="button" onClick={onClose}>
            ×
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <label>Nome de usuário *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </FormGroup>

          <FormGroup>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </FormGroup>

          <FormGroup>
            <label>
              Senha {usuario ? '(deixe em branco para manter a senha atual)' : '*'}
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                usuario
                  ? 'Deixe em branco para manter a senha atual'
                  : 'Mínimo 6 caracteres'
              }
              required={!usuario}
              autoComplete={usuario ? 'off' : 'new-password'}
            />

            <PasswordHint>
              {usuario
                ? 'Altere a senha apenas se necessário'
                : 'Use pelo menos 6 caracteres'}
            </PasswordHint>
          </FormGroup>

          {formData.password && (
            <FormGroup>
              <label>Confirmar Senha *</label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Digite a senha novamente"
                required
                autoComplete="off"
              />

              {passwordError && <FieldError>{passwordError}</FieldError>}
            </FormGroup>
          )}

          <FormGroup>
            <label>Tipo de usuário *</label>

            {bloquearTipoUsuario ? (
              <>
                <input
                  type="text"
                  value={getTipoLabel(formData.tipo)}
                  disabled
                  readOnly
                />

                <input type="hidden" name="tipo" value={formData.tipo} />
              </>
            ) : (
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                {tiposDisponiveis.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            )}

            {getTipoDescricao(formData.tipo) && (
              <HelpText>{getTipoDescricao(formData.tipo)}</HelpText>
            )}
          </FormGroup>

          <FormGroup>
            <label>Administradora *</label>

            <select
              name="administradora"
              value={formData.administradora || ''}
              onChange={handleChange}
              required
            >
              <option value="">Selecione uma administradora</option>

              {administradoras.map((adm) => (
                <option key={adm.id} value={adm.id}>
                  {adm.razao_social ||
                    adm.nome_fantasia ||
                    adm.nome ||
                    `ADM ${adm.id}`}
                </option>
              ))}
            </select>
          </FormGroup>

          <ModalFooter>
            <Button
              type="button"
              $variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button type="submit" $variant="primary" disabled={loading}>
              {loading ? 'Salvando...' : usuario ? 'Atualizar' : 'Criar'}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}