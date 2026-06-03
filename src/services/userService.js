// services/userService.js
import api from './api.js';

/**
 * Constantes para as chaves de armazenamento.
 */
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
};

/**
 * Serviço para gerenciamento de autenticação e usuários.
 */
export const userService = {
    /**
     * Realiza a autenticação do usuário e salva ambos os tokens.
     */
    login: async (email, password) => {
        const payload = { email, password };

        try {
            const response = await api.post('/api/auth/token/', payload);
            const data = response.data;

            const accessToken = data.access;
            const refreshToken = data.refresh;
            
            if (accessToken && refreshToken) {
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
                return data;
            } else {
                throw new Error('Tokens de autenticação não recebidos.');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    },

    /**
     * Usa o refresh token para obter um novo access token.
     */
    refreshToken: async () => {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
            throw new Error("Refresh token não encontrado. Necessário novo login.");
        }

        try {
            const response = await api.post('/api/auth/token/refresh/', { refresh: refreshToken });
            const data = response.data;

            const newAccessToken = data.access;

            if (newAccessToken) {
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
                return newAccessToken;
            } else {
                throw new Error('Novo access token não recebido.');
            }

        } catch (error) {
            console.error('Erro ao tentar atualizar o token:', error);
            userService.logout(); 
            throw new Error('Sessão expirada ou refresh token inválido. Usuário deslogado.');
        }
    },
    
    /**
     * Busca os dados do usuário logado.
     */
    getUserData: async () => {
        try {
            const response = await api.get('/api/users/me/');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            throw error;
        }
    },

    /**
     * Lista todos os usuários (com opção de filtro por administradora)
     */
    listarUsuarios: async (params = {}) => {
        try {
            const response = await api.get('/api/users/list/', { params });
            const data = response.data;
            // console.log('✅ Usuários carregados:', data?.length || 0);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('❌ Erro ao listar usuários:', error);
            return [];
        }
    },

    /**
     * Busca usuário por ID
     */
    buscarUsuarioPorId: async (id) => {
        try {
            const response = await api.get(`/api/users/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erro ao buscar usuário ${id}:`, error);
            throw error;
        }
    },

    /**
     * Criar novo usuário
     */
    criarUsuario: async (dados) => {
        try {
            const payload = {
                username: dados.username,
                email: dados.email,
                password: dados.password,
                tipo: dados.tipo,
                administradora: dados.administradora || null
            };
            // console.log('📝 Criando usuário com payload:', payload);
            const response = await api.post('/api/users/register/', payload);
            // console.log('✅ Usuário criado:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            throw error;
        }
    },

    /**
     * Atualizar usuário
     */
    atualizarUsuario: async (id, dados) => {
        try {
            // Primeiro, buscar os dados atuais do usuário
            const usuarioAtual = await userService.buscarUsuarioPorId(id);
            
            // Mesclar os dados atuais com as alterações
            const payload = {
                username: dados.username !== undefined ? dados.username : usuarioAtual.username,
                email: dados.email !== undefined ? dados.email : usuarioAtual.email,
                tipo: dados.tipo !== undefined ? dados.tipo : usuarioAtual.tipo,
                administradora: dados.administradora !== undefined ? dados.administradora : usuarioAtual.administradora_id,
            };
            
            // Só incluir senha se foi fornecida
            if (dados.password && dados.password.trim() !== '') {
                payload.password = dados.password;
            }
            
            // console.log(`✏️ Atualizando usuário ${id} com payload:`, payload);
            const response = await api.put(`/api/users/${id}/`, payload);
            // console.log('✅ Usuário atualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ Erro ao atualizar usuário ${id}:`, error);
            throw error;
        }
    },

    /**
     * Excluir usuário
     */
    excluirUsuario: async (id) => {
        try {
            const response = await api.delete(`/api/users/${id}/`);
            // console.log(`✅ Usuário ${id} excluído`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erro ao excluir usuário ${id}:`, error);
            throw error;
        }
    },

    /**
     * Desvincular administradora
     */
    desvincularAdministradora: async (userId) => {
        try {
            const response = await api.post(`/api/users/${userId}/desvincular-adm/`);
            // console.log(`✅ Usuário ${userId} desvinculado`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erro ao desvincular usuário ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Remove ambos os tokens de autenticação (logout).
     */
    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    },

    /**
     * Verifica se o usuário está autenticado.
     */
    isAuthenticated: () => {
        return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    /**
     * Lista todas as administradoras
     */
    listarAdministradoras: async () => {
        try {
            const response = await api.get('/api/entidades/administradoras/');
            const data = response.data;
            // console.log('✅ Administradoras carregadas:', data?.length || 0);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('❌ Erro ao listar administradoras:', error);
            return [];
        }
    },

    /**
     * Busca os dados do usuário logado.
     */
    getMe: async () => {
        const response = await api.get("/api/users/me/");
        return response.data;
    },

    /**
     * Alterar senha do usuário logado.
     */
    changePassword: async (payload) => {
        const response = await api.post(`/api/users/password/`, payload);
        return response.data;
    },

    /**
     * Vincular usuário a uma administradora
     */
    vincularAdministradora: async (userId, administradoraId) => {
        try {
            const response = await api.post(`/api/users/${userId}/vincular-adm/`, {
                administradora_id: administradoraId
            });
            // console.log(`✅ Usuário ${userId} vinculado à administradora ${administradoraId}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erro ao vincular usuário ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Altera a senha do usuário logado
     * Para primeiro acesso, não precisa enviar old_password
     */
    changePassword: async (newPassword, oldPassword = null) => {
        try {
            const payload = {
                new_password: newPassword
            };
            
            // Só envia a senha antiga se for fornecida
            if (oldPassword !== null) {
                payload.old_password = oldPassword;
            }
            
            const response = await api.post('/api/users/password/', payload);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Erro ao alterar senha. Tente novamente.'
            };
        }
    },
};

// Exportações únicas (sem duplicação)
export const getUsuarios = userService.listarUsuarios;
export const getUsuario = userService.buscarUsuarioPorId;
export const createUsuario = userService.criarUsuario;
export const updateUsuario = userService.atualizarUsuario;
export const deleteUsuario = userService.excluirUsuario;
export const desvincularAdministradora = userService.desvincularAdministradora;
export const listarAdministradoras = userService.listarAdministradoras;
export const vincularAdministradora = userService.vincularAdministradora;
export const changePassword = userService.changePassword;