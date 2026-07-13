import React from 'react';
import { FaPencilAlt, FaTimes, FaCheck } from 'react-icons/fa';
import * as S from '../MinhaContaStyles';
import PasswordField from './PasswordField';

const PasswordForm = ({ 
  senhaAtual, 
  setSenhaAtual, 
  novaSenha, 
  setNovaSenha, 
  confirmarSenha, 
  setConfirmarSenha, 
  editandoSenha,
  onEditClick,
  onCancelClick,
  onSubmit 
}) => {
  return (
    <S.Form onSubmit={onSubmit}>
      <PasswordField
        id="senhaAtual"
        label="Senha Atual"
        value={senhaAtual}
        onChange={(e) => setSenhaAtual(e.target.value)}
        disabled={!editandoSenha}
        placeholder="Digite sua senha atual"
      />

      <PasswordField
        id="novaSenha"
        label="Nova Senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        disabled={!editandoSenha}
        placeholder="Digite sua nova senha"
      />

      <PasswordField
        id="confirmarSenha"
        label="Confirmar Nova Senha"
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
        disabled={!editandoSenha}
        placeholder="Confirme sua nova senha"
      />

      <S.FormActions>
        {!editandoSenha ? (
          <S.Button type="button" className="secondary" onClick={onEditClick}>
            <FaPencilAlt /> Editar
          </S.Button>
        ) : (
          <>
            <S.Button type="button" className="danger" onClick={onCancelClick}>
              <FaTimes /> Cancelar
            </S.Button>
            <S.Button type="submit" className="primary">
              <FaCheck /> Alterar Senha
            </S.Button>
          </>
        )}
      </S.FormActions>
    </S.Form>
  );
};

export default PasswordForm;