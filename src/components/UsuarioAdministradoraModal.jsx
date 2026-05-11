import React, { useEffect, useState } from 'react'

const initialForm = {
  nome: '',
  email: '',
  telefone: '',
  cargo: '',
  role: 'adm_operador',
  status: 'ativo',
}

export default function UsuarioAdministradoraModal({
  isOpen,
  usuario,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    if (usuario) {
      setForm(usuario)
    } else {
      setForm(initialForm)
    }
  }, [usuario, isOpen])

  if (!isOpen) return null

  function handleChange(event) {
    const { name, value } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <h2>{usuario ? 'Editar Usuário' : 'Novo Usuário'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Nome
              <input name="nome" value={form.nome} onChange={handleChange} required />
            </label>

            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>

            <label>
              Telefone
              <input name="telefone" value={form.telefone} onChange={handleChange} />
            </label>

            <label>
              Cargo
              <input name="cargo" value={form.cargo} onChange={handleChange} />
            </label>

            <label>
              Perfil
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="adm_admin">Admin da Administradora</option>
                <option value="adm_operador">Operador</option>
                <option value="viewer">Visualização</option>
              </select>
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>

            <button type="submit" className="btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}