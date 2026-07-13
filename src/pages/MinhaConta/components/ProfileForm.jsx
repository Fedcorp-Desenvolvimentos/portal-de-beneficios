import React from 'react';
import { FaPencilAlt, FaTimes, FaCheck, FaUser, FaEnvelope } from 'react-icons/fa';
import * as S from '../MinhaContaStyles';

const ProfileForm = ({
  nome,
  setNome,
  email,
  setEmail,
  editandoPerfil,
  onEditClick,
  onCancelClick,
  onSubmit,
}) => {
  return (
    <S.Form onSubmit={onSubmit}>
      <S.FormField>
        <S.Label>
          <FaUser size={14} /> Nome Completo
        </S.Label>

        <S.Input
          type="text"
          value={nome || ''}
          onChange={(e) => setNome(e.target.value)}
          disabled={!editandoPerfil}
          $isEditing={editandoPerfil}
          placeholder="Seu nome completo"
        />
      </S.FormField>

      <S.FormField>
        <S.Label>
          <FaEnvelope size={14} /> E-mail
        </S.Label>

        <S.Input
          type="email"
          value={email || ''}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!editandoPerfil}
          $isEditing={editandoPerfil}
          placeholder="seu@email.com"
        />
      </S.FormField>

      <S.FormActions>
        {!editandoPerfil ? (
          <S.Button type="button" className="secondary" onClick={onEditClick}>
            <FaPencilAlt /> Editar
          </S.Button>
        ) : (
          <>
            <S.Button type="button" className="danger" onClick={onCancelClick}>
              <FaTimes /> Cancelar
            </S.Button>

            <S.Button type="submit" className="primary">
              <FaCheck /> Salvar Alterações
            </S.Button>
          </>
        )}
      </S.FormActions>
    </S.Form>
  );
};

export default ProfileForm;