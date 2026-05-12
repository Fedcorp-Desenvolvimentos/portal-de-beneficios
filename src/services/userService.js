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
     * Lista todos os usuários (apenas admin).
     */
    listarUsuarios: async () => {
        try {
            const usuarios = await apiFetch('/users/list/', { method: 'GET' });
            return usuarios;
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            throw error;
        }
    },

    /**
     * Busca um usuário por ID.
     */
    buscarUsuarioPorId: async (id) => {
        try {
            const usuario = await apiFetch(`/users/${id}/`, { method: 'GET' });
            return usuario;
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            throw error;
        }
    },

    /**
     * Cria um novo usuário vinculado a uma administradora.
     */
    criarUsuario: async (dados) => {
        try {
            const usuario = await apiFetch('/users/register/', {
                method: 'POST',
                body: JSON.stringify(dados),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return usuario;
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    },

    /**
     * Atualiza um usuário existente.
     */
    atualizarUsuario: async (id, dados) => {
        try {
            const usuario = await apiFetch(`/users/${id}/`, {
                method: 'PUT',
                body: JSON.stringify(dados),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return usuario;
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    },

    /**
     * Remove um usuário.
     */
    excluirUsuario: async (id) => {
        try {
            await apiFetch(`/users/${id}/`, { method: 'DELETE' });
            return true;
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
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
    }
};