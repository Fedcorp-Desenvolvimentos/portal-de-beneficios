// src/services/api.js
import axios from "axios";

// Para apontar o front a um backend local, crie um arquivo `.env.local` na raiz
// do projeto (já ignorado pelo git) com:
//     VITE_API_URL=http://localhost:8000
// Sem essa variável, o padrão é o backend de produção.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://vr-beneficios-backend-fedcorp-ju482.ondigitalocean.app'

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

// Queue for handling multiple concurrent requests while token is refreshing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/users/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = response.data.access;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
