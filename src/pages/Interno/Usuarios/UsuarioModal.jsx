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
    from { opacity: 0; }
    to { opacity: 1; }
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

  input, select {
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

  ${props => props.$variant === 'secondary' && `
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border);

    &:hover:not(:disabled) {
      background: var(--color-border-light);
    }
  `}

  ${props => props.$variant === 'primary' && `
    background: var(--color-primary);
    color: white;

    &:hover:not(:disabled) {
      background: var(--color-primary-dark);
      transform: translateY(-1px);
    }
  `}
`;

export default function UsuarioModal({
  isOpen,
  onClose,
  onSave,
  usuario,
  administradoraId,
  administradoras = [],
  title
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    tipo: 'adm',
    administradora: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (usuario) {
        setFormData({
          username: usuario.username || '',
          email: usuario.email || '',
          tipo: usuario.tipo || 'adm',
          administradora: usuario.administradora_id || administradoraId || null,
        });
      } else {
        setFormData({
          username: '',
          email: '',
          tipo: 'adm',
          administradora: administradoraId || null,
        });
      }
      setError('');
    }
  }, [usuario, administradoraId, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const dadosParaEnvio = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        tipo: formData.tipo,
      };

      if (!usuario) {
        dadosParaEnvio.administradora = formData.administradora;
      } else if (formData.administradora !== (usuario.administradora_id || null)) {
        dadosParaEnvio.administradora = formData.administradora;
      }

      if (!dadosParaEnvio.username) throw new Error('Nome de usuário é obrigatório');
      if (!dadosParaEnvio.email) throw new Error('Email é obrigatório');
      if (!dadosParaEnvio.email.includes('@')) throw new Error('Email inválido');

      await onSave(dadosParaEnvio);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      const errorMsg = error.message || 'Erro ao salvar usuário';
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
          <CloseButton onClick={onClose}>×</CloseButton>
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
            <label>Tipo de usuário *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >

              <option value="adm">Usuário da Administradora</option>

            </select>
          </FormGroup>

          <FormGroup>
            <label>Administradora</label>
            <select
              name="administradora"
              value={formData.administradora || ''}
              onChange={handleChange}
            >
              <option value="">Nenhuma</option>
              {administradoras.map(adm => (
                <option key={adm.id} value={adm.id}>
                  {adm.razao_social || adm.nome_fantasia || adm.nome || `ADM ${adm.id}`}
                </option>
              ))}
            </select>
          </FormGroup>

          <ModalFooter>
            <Button type="button" $variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={loading}>
              {loading ? 'Salvando...' : (usuario ? 'Atualizar' : 'Criar')}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
}