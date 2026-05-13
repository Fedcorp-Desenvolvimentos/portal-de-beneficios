// services/userService.js
import { apiFetch } from './api.js';

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
            const data = await apiFetch('/auth/token/', {
                method: 'POST',
                body: payload,
                headers: { 'Authorization': '' } 
            });

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
            const data = await apiFetch('/auth/token/refresh/', {
                method: 'POST',
                body: { refresh: refreshToken },
                headers: { 'Authorization': '' } 
            });

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
            const userData = await apiFetch('/users/me/', { method: 'GET' }); 
            return userData;
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
            const queryString = new URLSearchParams(params).toString();
            const url = `/users/list/${queryString ? `?${queryString}` : ''}`;
            const data = await apiFetch(url, { method: 'GET' });
            console.log('✅ Usuários carregados:', data?.length || 0);
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
            const data = await apiFetch(`/users/${id}/`, { method: 'GET' });
            return data;
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
            console.log('📝 Criando usuário com payload:', payload);
            const data = await apiFetch('/users/register/', { 
                method: 'POST', 
                body: payload 
            });
            console.log('✅ Usuário criado:', data);
            return data;
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
            
            console.log(`✏️ Atualizando usuário ${id} com payload:`, payload);
            const data = await apiFetch(`/users/${id}/`, { 
                method: 'PUT', 
                body: payload 
            });
            console.log('✅ Usuário atualizado:', data);
            return data;
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
            const data = await apiFetch(`/users/${id}/`, { method: 'DELETE' });
            console.log(`✅ Usuário ${id} excluído`);
            return data;
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
            const data = await apiFetch(`/users/${userId}/desvincular-adm/`, { method: 'POST' });
            console.log(`✅ Usuário ${userId} desvinculado`);
            return data;
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
            const data = await apiFetch('/entidades/administradoras/', { method: 'GET' });
            console.log('✅ Administradoras carregadas:', data?.length || 0);
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('❌ Erro ao listar administradoras:', error);
            return [];
        }
    },

    /**
     * Vincular usuário a uma administradora
     */
    vincularAdministradora: async (userId, administradoraId) => {
        try {
            const data = await apiFetch(`/users/${userId}/vincular-adm/`, {
                method: 'POST',
                body: { administradora_id: administradoraId }
            });
            console.log(`✅ Usuário ${userId} vinculado à administradora ${administradoraId}`);
            return data;
        } catch (error) {
            console.error(`❌ Erro ao vincular usuário ${userId}:`, error);
            throw error;
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