// pages/Interno/Usuarios/UsuarioTable.jsx
import React from 'react';
import styled from 'styled-components';
import { FiEdit, FiTrash2, FiUser, FiMail, FiTag, FiBriefcase } from 'react-icons/fi';

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--color-bg-primary);
  border-radius: 12px;
  overflow: hidden;

  th,
  td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid var(--color-border-light);
  }

  th {
    background: var(--color-bg-tertiary);
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  tbody tr:hover td {
    background: var(--color-bg-tertiary);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  ${(props) =>
    props.$variant === 'edit' &&
    `
    background: var(--color-primary);
    color: white;

    &:hover {
      background: var(--color-primary-dark);
    }
  `}

  ${(props) =>
    props.$variant === 'delete' &&
    `
    background: var(--color-danger);
    color: white;

    &:hover {
      background: #d32f2f;
    }
  `}
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  background: var(--color-bg-primary);
  border-radius: 12px;
  border: 1px dashed var(--color-border);

  p {
    margin: 0;
    color: var(--color-text-tertiary);
    font-size: 14px;

    &:first-child {
      font-weight: 500;
      margin-bottom: 8px;
    }
  }
`;

const TipoBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  ${(props) => {
    switch (props.$tipo) {
      case 'dev':
        return `
          background: #f3e8ff;
          color: #9333ea;
        `;
      case 'fin':
        return `
          background: #dbeafe;
          color: #2563eb;
        `;
      case 'fat':
        return `
          background: #fef3c7;
          color: #d97706;
        `;
      case 'adm':
        return `
          background: #dcfce7;
          color: #16a34a;
        `;
      case 'cli':
        return `
          background: #e0f2fe;
          color: #0284c7;
        `;
      default:
        return `
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
        `;
    }
  }}
`;

const AdministradoraText = styled.div`
  max-width: 260px;
  color: var(--color-text-secondary);
  font-weight: 500;
  line-height: 1.4;
`;

const AdministradoraFallback = styled.span`
  color: var(--color-text-tertiary);
`;

export default function UsuarioTable({ usuarios, onEditar, onExcluir, admNome }) {
  const getTipoLabel = (tipo) => {
    const tipos = {
      dev: 'Desenvolvedor',
      fin: 'Financeiro Fedcorp',
      fat: 'Faturista Fedcorp',
      adm: 'Usuário Administradora',
      cli: 'Cliente (Condomínio)',
    };

    return tipos[tipo] || tipo || '—';
  };

  const getAdministradoraNome = (usuario) => {
    return (
      usuario?.administradora_nome ||
      usuario?.nome_administradora ||
      usuario?.administradora?.nome ||
      usuario?.administradora?.razao_social ||
      usuario?.administradora?.nome_fantasia ||
      admNome ||
      ''
    );
  };

  if (!usuarios || usuarios.length === 0) {
    return (
      <EmptyState>
        <p>Nenhum usuário vinculado a esta administradora.</p>
        <p>Clique em "+ Novo Usuário" para adicionar.</p>
      </EmptyState>
    );
  }

  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <th>
              <FiUser size={12} style={{ marginRight: 6 }} />
              Nome
            </th>
            <th>
              <FiMail size={12} style={{ marginRight: 6 }} />
              Email
            </th>
            <th>
              <FiTag size={12} style={{ marginRight: 6 }} />
              Tipo
            </th>
            <th>
              <FiBriefcase size={12} style={{ marginRight: 6 }} />
              Administradora
            </th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((usuario) => {
            const administradoraNome = getAdministradoraNome(usuario);

            return (
              <tr key={usuario.id}>
                <td style={{ fontWeight: 500 }}>
                  {usuario.username || usuario.nome || '—'}
                </td>

                <td>{usuario.email || '—'}</td>

                <td>
                  <TipoBadge $tipo={usuario.tipo}>
                    {getTipoLabel(usuario.tipo)}
                  </TipoBadge>
                </td>

                <td>
                  {administradoraNome ? (
                    <AdministradoraText>{administradoraNome}</AdministradoraText>
                  ) : (
                    <AdministradoraFallback>—</AdministradoraFallback>
                  )}
                </td>

                <td>
                  <Actions>
                    <Button
                      $variant="edit"
                      onClick={() => onEditar(usuario)}
                      title="Editar usuário"
                    >
                      <FiEdit size={14} />
                      Editar
                    </Button>

                    <Button
                      $variant="delete"
                      onClick={() => onExcluir(usuario)}
                      title="Excluir usuário"
                    >
                      <FiTrash2 size={14} />
                      Excluir
                    </Button>
                  </Actions>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableWrapper>
  );
}