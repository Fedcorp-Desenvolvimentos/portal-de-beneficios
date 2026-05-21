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
    const { loading, setLoading, setLoadingMessage } = useGlobal();
    const navigate = useNavigate();

    // console.log("user", user)

    const login = useCallback(async (credentials) => {
        setLoadingMessage("Fazendo login...");
        setLoading(true);
        try {
            // 1. Faz a requisição de login
            const response = await api.post('/api/users/login/', credentials);
            // console.log('Login response:', response.data);
            localStorage.setItem('accessToken', response.data.access);
            const userResponse = await api.get('/api/users/me/');
            setUser(userResponse.data);
            setIsAuthenticated(true);

            return { success: true };
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

    const logout = useCallback(() => {
        setLoadingMessage("Fazendo logout...");
        setLoading(true);
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
        setLoading(false);
    }, [navigate]);

    useEffect(() => {
        const checkAuthStatus = async () => {
            // Tenta obter o token do localStorage
            const token = localStorage.getItem('accessToken');
            const publicRoutes = ["/", "/login", "/recuperar-senha", "/resetar-senha", "/404"];

            // Se não houver token, o usuário não está autenticado
           if (!token) {
                setLoading(false);
                setIsAuthenticated(false);

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
            } catch (error) {
                // Se a requisição falhar, o token é inválido/expirado
               
                // Remove o token inválido para evitar futuras requisições
                localStorage.removeItem('accessToken');
                setUser(null);
                setIsAuthenticated(false);

                const isPublicRoute = publicRoutes.includes(window.location.pathname);

                if (!isPublicRoute) {
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, [navigate]);

    const isAuthenticatedCheck = () => isAuthenticated;

    const authContextValue = useMemo(() => ({
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        isAuthenticatedCheck
    }), [user, isAuthenticated, loading, login, logout]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;