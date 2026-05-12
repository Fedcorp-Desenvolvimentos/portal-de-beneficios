import React, { useState, useEffect } from 'react'
import '../pages/Interno/Administradoras/Administradoras.css'

const TIPO_USUARIO = {
    DEV: 'dev',
    FIN: 'fin',
    FAT: 'fat',
    ADM: 'adm',
    CLI: 'cli'
}

const TIPO_LABELS = {
    [TIPO_USUARIO.DEV]: 'Desenvolvedor',
    [TIPO_USUARIO.FIN]: 'Financeiro Fedcorp',
    [TIPO_USUARIO.FAT]: 'Faturista Fedcorp',
    [TIPO_USUARIO.ADM]: 'Usuário da Administradora',
    [TIPO_USUARIO.CLI]: 'Cliente (Condomínio)'
}

export default function UsuarioModal({ isOpen, onClose, onSave, usuario, administradoraId }) {
    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        password2: '',
        tipo: TIPO_USUARIO.ADM,
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (usuario) {
            // Modo edição
            setForm({
                email: usuario.email || '',
                username: usuario.username || '',
                password: '',
                password2: '',
                tipo: usuario.tipo || TIPO_USUARIO.ADM,
            })
        } else {
            // Modo criação
            setForm({
                email: '',
                username: '',
                password: '',
                password2: '',
                tipo: TIPO_USUARIO.ADM,
            })
        }
        setErrors({})
    }, [usuario, isOpen])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        // Limpa erro do campo ao digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!form.email) {
            newErrors.email = 'Email é obrigatório'
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = 'Email inválido'
        }

        if (!form.username) {
            newErrors.username = 'Username é obrigatório'
        }

        if (!usuario) {
            // Só valida senha na criação
            if (!form.password) {
                newErrors.password = 'Senha é obrigatória'
            } else if (form.password.length < 6) {
                newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
            }

            if (form.password !== form.password2) {
                newErrors.password2 = 'As senhas não coincidem'
            }
        } else if (form.password && form.password !== form.password2) {
            // Se estiver editando e digitou senha, valida
            newErrors.password2 = 'As senhas não coincidem'
        }

        if (!form.tipo) {
            newErrors.tipo = 'Tipo de usuário é obrigatório'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setLoading(true)

        try {
            const dados = {
                email: form.email,
                username: form.username,
                tipo: form.tipo,
            }

            // Adiciona administradora_id se for do tipo ADM
            if (form.tipo === TIPO_USUARIO.ADM && administradoraId) {
                dados.administradora_id = administradoraId
            }

            // Adiciona senha apenas se fornecida
            if (form.password) {
                dados.password = form.password
                dados.password2 = form.password2
            }

            await onSave(dados)
            onClose()
        } catch (error) {
            console.error('Erro ao salvar usuário:', error)
            if (error.response?.data) {
                setErrors(error.response.data)
            } else {
                setErrors({ general: 'Erro ao salvar usuário. Tente novamente.' })
            }
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{usuario ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                
                {errors.general && (
                    <div className="error-banner" style={{background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '20px'}}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <label>
                            Email *
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.email && <small className="error-message">{errors.email}</small>}
                        </label>

                        <label>
                            Username *
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {errors.username && <small className="error-message">{errors.username}</small>}
                        </label>

                        <label>
                            Senha {!usuario && '*'}
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={usuario ? 'Deixe em branco para manter a mesma' : ''}
                                disabled={loading}
                            />
                            {errors.password && <small className="error-message">{errors.password}</small>}
                        </label>

                        <label>
                            Confirmar Senha {!usuario && '*'}
                            <input
                                type="password"
                                name="password2"
                                value={form.password2}
                                onChange={handleChange}
                                placeholder={usuario ? 'Deixe em branco para manter a mesma' : ''}
                                disabled={loading}
                            />
                            {errors.password2 && <small className="error-message">{errors.password2}</small>}
                        </label>

                        <label>
                            Tipo de Usuário *
                            <select
                                name="tipo"
                                value={form.tipo}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                {Object.entries(TIPO_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                            {errors.tipo && <small className="error-message">{errors.tipo}</small>}
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : (usuario ? 'Atualizar' : 'Criar Usuário')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}