/**
 * ============================================================
 * Client API Axios - Dream Team Mobile
 * Gestion centralisée des requêtes HTTP avec intercepteurs
 * pour authentification JWT et refresh automatique des tokens
 * ============================================================
 */
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// URL de base de l'API - Tunnel ngrok vers le backend local
// Le backend tourne sur localhost:8084 et est exposé via ngrok
export const BASE_URL = 'https://polytomous-kristi-overimpressibly.ngrok-free.dev/api/v1';

/**
 * Instance Axios pré-configurée avec timeout et headers par défaut
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

/**
 * Intercepteur de requêtes : injecte le token JWT Bearer
 * dans chaque requête sortante si l'utilisateur est authentifié
 */
apiClient.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState();
    const token = state.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Token injecté`);
    } else {
      // console.warn(`[API Request] ${config.method?.toUpperCase()} ${config.url} - AUCUN TOKEN trouvé dans le Store`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Intercepteur de réponses : gère les erreurs 401 (token expiré)
 * en tentant un refresh automatique du token, puis déconnecte
 * l'utilisateur si le refresh échoue
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 et qu'on n'a pas déjà tenté un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          // Tenter le refresh du token
          const response = await axios.post(`${BASE_URL}/auth/refresh`, null, {
            params: { refreshToken },
          });

          if (response.data?.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            useAuthStore.getState().setTokens(accessToken, newRefreshToken);

            // Rejouer la requête originale avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Le refresh a échoué, déconnexion forcée
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
