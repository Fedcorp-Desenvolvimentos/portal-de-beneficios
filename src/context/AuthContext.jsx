// src/contexts/AuthContext.js

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from './GlobalContext.jsx';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const { loading, setLoading, setLoadingMessage } = useGlobal();
    const navigate = useNavigate();

    const login = useCallback(async (credentials) => {
        setLoadingMessage("Fazendo login...");
        setLoading(true);
        try {
            const response = await api.post('/api/users/login/', credentials);
            localStorage.setItem('accessToken', response.data.access);
            if (response.data.refresh) {
                localStorage.setItem('refreshToken', response.data.refresh);
            }
            const userResponse = await api.get('/api/users/me/');
            setUser(userResponse.data);
            setIsAuthenticated(true);

            if (userResponse.data?.administradora_ativa) {
                localStorage.setItem('administradora_ativa_id', userResponse.data.administradora_ativa);
            }

            return { success: true, user: userResponse.data };
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            localStorage.removeItem('accessToken');
            setIsAuthenticated(false);
            setUser(null);

            return {
                success: false,
                error:
                    typeof error.response?.data?.detail === 'string'
                        ? error.response.data.detail
                        : JSON.stringify(error.response?.data?.detail) || "Falha ao tentar fazer login."
            };
        } finally {
            setLoading(false);
        }
    }, []);

    const loginGoogle = useCallback(async (credential) => {
        try {
            setLoading(true);

            const response = await api.post('/api/users/google-login/', { credential });
            localStorage.setItem('accessToken', response.data.access);
            if (response.data.refresh) {
                localStorage.setItem('refreshToken', response.data.refresh);
            }

            const userResponse = await api.get('/api/users/me/');
            setUser(userResponse.data);
            setIsAuthenticated(true);

            if (userResponse.data?.administradora_ativa) {
                localStorage.setItem('administradora_ativa_id', userResponse.data.administradora_ativa);
            }

            return { success: true, user: userResponse.data };
        } catch (error) {
            console.error(error);
            localStorage.removeItem('accessToken');
            setIsAuthenticated(false);
            setUser(null);

            return {
                success: false,
                error: error.response?.data?.detail || 'Erro login Google'
            };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setLoadingMessage("Fazendo logout...");
        setLoading(true);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('administradora_ativa_id');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
        setLoading(false);
    }, [navigate]);

    const setAdministradoraAtiva = useCallback(async (administradora) => {
        if (!administradora?.id) return;

        try {
            await api.post('/api/users/set-administradora-ativa/', {
                administradora_id: administradora.id,
            });

            localStorage.setItem('administradora_ativa_id', administradora.id);

            const userResponse = await api.get('/api/users/me/');
            setUser(userResponse.data);

            return { success: true };
        } catch (error) {
            console.error('Erro ao alterar administradora ativa:', error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Erro ao alterar administradora'
            };
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const userResponse = await api.get('/api/users/me/');
            setUser(userResponse.data);
            if (userResponse.data?.administradora_ativa) {
                localStorage.setItem('administradora_ativa_id', userResponse.data.administradora_ativa);
            }
        } catch (error) {
            console.error('Erro ao atualizar dados do usuario:', error);
        }
    }, []);

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('accessToken');
            const publicRoutes = ["/", "/login", "/recuperar-senha", "/resetar-senha", "/404"];

            if (!token) {
                setLoading(false);
                setIsAuthenticated(false);
                setIsCheckingAuth(false);

                const isPublicRoute = publicRoutes.some((route) =>
                    window.location.pathname.startsWith(route)
                );

                if (!isPublicRoute) {
                    navigate("/login");
                }

                return;
            }
            try {
                const response = await api.get('/api/users/me/');
                setUser(response.data);
                setIsAuthenticated(true);
                if (response.data?.administradora_ativa) {
                    localStorage.setItem('administradora_ativa_id', response.data.administradora_ativa);
                }
            } catch (error) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setUser(null);
                setIsAuthenticated(false);

                const isPublicRoute = publicRoutes.includes(window.location.pathname);

                if (!isPublicRoute) {
                    navigate("/login");
                }
            } finally {
                setLoading(false);
                setIsCheckingAuth(false);
            }
        };
        checkAuthStatus();
    }, [navigate]);

    const isAuthenticatedCheck = () => isAuthenticated;

    const administradoraAtiva = useMemo(() => {
        if (!user) return null;
        const activeId = user.administradora_ativa;
        if (!activeId) return null;
        const admins = user.administradoras_data || [];
        return admins.find((a) => a.id === activeId) || null;
    }, [user]);

    const authContextValue = useMemo(() => ({
        user,
        isAuthenticated,
        isCheckingAuth,
        loading,
        login,
        loginGoogle,
        logout,
        isAuthenticatedCheck,
        administradoraAtiva,
        setAdministradoraAtiva,
        refreshUser,
    }), [
        user,
        isAuthenticated,
        isCheckingAuth,
        loading,
        login,
        loginGoogle,
        logout,
        administradoraAtiva,
        setAdministradoraAtiva,
        refreshUser,
    ]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
