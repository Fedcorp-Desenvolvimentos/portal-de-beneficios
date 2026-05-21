// components/UsuarioModalUniversal.jsx
import React, { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack';

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
    password: '',
    confirmPassword: '',
    tipo: 'adm',
    administradora: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (usuario) {
        setFormData({
          username: usuario.username || '',
          email: usuario.email || '',
          tipo: usuario.tipo || 'adm',
          administradora: usuario.administradora_id || administradoraId || null,
          password: '',
          confirmPassword: ''
        })
      } else {
        setFormData({
          username: '',
          email: '',
          tipo: 'adm',
          administradora: administradoraId || null,
          password: '',
          confirmPassword: ''
        })
      }
      setError('')
      setPasswordError('')
    }
  }, [usuario, administradoraId, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const password = formData.password.trim()
    const confirmPassword = formData.confirmPassword.trim()
    
    if (!usuario && !password) {
      setError('Senha é obrigatória')
      enqueueSnackbar('Senha é obrigatória', { variant: 'error' });
      return
    }
    
    if (password || !usuario) {
      if (password && password.length < 6) {
        setPasswordError('A senha deve ter no mínimo 6 caracteres')
        enqueueSnackbar('A senha deve ter no mínimo 6 caracteres', { variant: 'error' });
        return
      }
      
      if (password !== confirmPassword) {
        setPasswordError('As senhas não coincidem')
        enqueueSnackbar('As senhas não coincidem', { variant: 'error' });
        return
      }
    }
    
    setLoading(true)
    setError('')
    setPasswordError('')
    
    try {
      const dadosParaEnvio = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        tipo: formData.tipo,
        password: password
      }
      
      if (!usuario) {
        dadosParaEnvio.administradora = formData.administradora
      } else if (formData.administradora !== (usuario.administradora_id || null)) {
        dadosParaEnvio.administradora = formData.administradora
      }
      
      if (!dadosParaEnvio.username) throw new Error('Nome de usuário é obrigatório')
      if (!dadosParaEnvio.email) throw new Error('Email é obrigatório')
      if (!dadosParaEnvio.email.includes('@')) throw new Error('Email inválido')
      
      await onSave(dadosParaEnvio)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      const errorMsg = error.message || 'Erro ao salvar usuário'
      setError(errorMsg)
      enqueueSnackbar(errorMsg, { variant: 'error' });
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
            <label>Senha {usuario ? '(deixe em branco para manter a senha atual)' : '*'}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={usuario ? 'Deixe em branco para manter a senha atual' : 'Mínimo 6 caracteres'}
              required={!usuario}
            />
          </div>

          {((!usuario && formData.password) || (usuario && formData.password)) && (
            <div className="form-group">
              <label>Confirmar Senha *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Digite a senha novamente"
                required={!usuario || (usuario && formData.password)}
              />
              {passwordError && (
                <div style={{color: '#d32f2f', fontSize: '12px', marginTop: '5px'}}>
                  {passwordError}
                </div>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label>Tipo de usuário *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="dev">Desenvolvedor</option>
              <option value="fin">Financeiro</option>
              <option value="fat">Faturista</option>
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