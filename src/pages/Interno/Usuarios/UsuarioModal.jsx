// components/UsuarioModalUniversal.jsx
import React, { useState, useEffect } from 'react'

export default function UsuarioModal({ 
  isOpen, 
  onClose, 
  onSave, 
  usuario, 
  administradoraId, 
  administradoras = [],
  title 
}) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    tipo: 'adm',
    administradora: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset quando o modal abre ou o usuário muda
  useEffect(() => {
    if (isOpen) {
      if (usuario) {
        console.log('📝 Modal Universal - Editando usuário:', usuario)
        setFormData({
          username: usuario.username || '',
          email: usuario.email || '',
          tipo: usuario.tipo || 'adm',
          administradora: usuario.administradora_id || administradoraId || null
        })
      } else {
        console.log('📝 Modal Universal - Criando novo usuário')
        setFormData({
          username: '',
          email: '',
          tipo: 'adm',
          administradora: administradoraId || null
        })
      }
      setError('')
    }
  }, [usuario, administradoraId, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const dadosParaEnvio = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        tipo: formData.tipo,
      }
      
      if (!usuario) {
        dadosParaEnvio.administradora = formData.administradora
      } else if (formData.administradora !== (usuario.administradora_id || null)) {
        dadosParaEnvio.administradora = formData.administradora
      }
      
      if (!dadosParaEnvio.username) throw new Error('Nome de usuário é obrigatório')
      if (!dadosParaEnvio.email) throw new Error('Email é obrigatório')
      if (!dadosParaEnvio.email.includes('@')) throw new Error('Email inválido')
      
      console.log('📤 Enviando dados para API:', dadosParaEnvio)
      await onSave(dadosParaEnvio)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setError(error.message || 'Erro ao salvar usuário')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title || (usuario ? 'Editar Usuário' : 'Novo Usuário')}</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        {error && (
          <div className="error-message" style={{color: 'red', marginBottom: '15px', padding: '10px', background: '#ffebee', borderRadius: '4px'}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome de usuário *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Tipo de usuário *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="dev">Desenvolvedor</option>
              <option value="fin">Financeiro Fedcorp</option>
              <option value="fat">Faturista Fedcorp</option>
              <option value="adm">Usuário da Administradora</option>
              <option value="cli">Cliente (Condomínio)</option>
            </select>
          </div>
          
          <div className="form-group">
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
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : (usuario ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}