// pages/Interno/Usuarios/UsuarioTable.jsx

import React from 'react'

export default function UsuarioTable({ usuarios, onEditar, onExcluir, admNome }) {
  const getTipoLabel = (tipo) => {
    const tipos = {
      dev: 'Desenvolvedor',
      fin: 'Financeiro Fedcorp',
      fat: 'Faturista Fedcorp',
      adm: `Usuário de ${admNome || ''}`.trim(),
      cli: 'Cliente (Condomínio)'
    }
    return tipos[tipo] || tipo
  }

  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum usuário vinculado a esta administradora.</p>
        <p>Clique em "+ Novo Usuário" para adicionar.</p>
      </div>
    )
  }

  return (
    <table className="usuarios-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Tipo</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map(usuario => (
          <tr key={usuario.id}>
            <td>{usuario.username}</td>
            <td>{usuario.email}</td>
            <td>{getTipoLabel(usuario.tipo)}</td>
            <td className="acoes">
              <button 
                className="btn-edit"
                onClick={() => onEditar(usuario)}
              >
                Editar
              </button>
              <button 
                className="btn-delete"
                onClick={() => onExcluir(usuario)}
              >
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}