import React from 'react'
import StatusAdministradoraBadge from './StatusAdministradoraBadge.jsx'

export default function UsuarioAdministradoraTable({
  usuarios = [],
  onEditar,
  onAlterarStatus,
}) {
  return (
    <div className="administradoras-card">
      <table className="administradoras-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Cargo</th>
            <th>Perfil</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-table">
                Nenhum usuário cadastrado.
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>{usuario.cargo || '-'}</td>
                <td>{usuario.role}</td>
                <td>
                  <StatusAdministradoraBadge status={usuario.status} />
                </td>
                <td className="table-actions">
                  <button type="button" onClick={() => onEditar?.(usuario)}>
                    Editar
                  </button>

                  <button type="button" onClick={() => onAlterarStatus?.(usuario)}>
                    {usuario.status === 'ativo' ? 'Inativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}