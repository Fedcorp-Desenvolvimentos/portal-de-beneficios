// src/services/api.js
import axios from "axios";

export const API_BASE_URL = 'https://vr-beneficios-backend-fedcorp-ju482.ondigitalocean.app'
// export const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepta todas as requisições Axios
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    // Se o token existir, adicione-o ao cabeçalho Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const publicRoutes = ["/", "/login", "/esqueci-senha", "/resetar-senha", "/404"];

const isPublic = publicRoutes.some((route) =>
  window.location.pathname.startsWith(route)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const response = await axios.post(
          `${API_BASE_URL}/api/auth/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = response.data.access;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
