import React from 'react'
import StatusAdministradoraBadge from './StatusAdministradoraBadge.jsx'

export default function AdministradorasTable({
  administradoras = [],
  onEditar,
  onDetalhes,
  onUsuarios,
  onAlterarStatus,
}) {
  return (
    <div className="administradoras-card">
      <table className="administradoras-table">
        <thead>
          <tr>
            <th>Nome Fantasia</th>
            <th>CNPJ</th>
            <th>Email</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {administradoras.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-table">
                Nenhuma administradora cadastrada.
              </td>
            </tr>
          ) : (
            administradoras.map((adm) => (
              <tr key={adm.id}>
                <td>{adm.nomeFantasia}</td>
                <td>{adm.cnpj}</td>
                <td>{adm.email}</td>
                <td>
                  <StatusAdministradoraBadge status={adm.status} />
                </td>
                <td className="table-actions">
                  <button type="button" onClick={() => onDetalhes?.(adm)}>
                    Detalhes
                  </button>

                  <button type="button" onClick={() => onEditar?.(adm)}>
                    Editar
                  </button>

                  <button type="button" onClick={() => onUsuarios?.(adm)}>
                    Usuários
                  </button>

                  <button type="button" onClick={() => onAlterarStatus?.(adm)}>
                    {adm.status === 'ativa' ? 'Inativar' : 'Ativar'}
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