/**
 * ============================================================
 * Store d'authentification Zustand - Dream Team Mobile
 * Gère l'état de connexion, les tokens JWT et les données
 * utilisateur, avec persistance sécurisée via Expo SecureStore
 * ============================================================
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { UserResponse, Role } from '../types';

/**
 * Adaptateur de stockage sécurisé pour Zustand
 * Utilise Expo SecureStore pour chiffrer les données sensibles
 * (tokens JWT notamment) sur l'appareil
 */
const secureStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    return SecureStore.getItemAsync(name);
  },
  setItem: (name: string, value: string): void | Promise<void> => {
    return SecureStore.setItemAsync(name, value);
  },
  removeItem: (name: string): void | Promise<void> => {
    return SecureStore.deleteItemAsync(name);
  },
};

/** Interface de l'état d'authentification */
interface AuthState {
  // Données
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: UserResponse, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<UserResponse>) => void;
  setLoading: (loading: boolean) => void;

  // Getters
  isAdmin: () => boolean;
  isMember: () => boolean;
  fullName: () => string;
}

/**
 * Store Zustand persisté avec SecureStore
 * Stocke les tokens et l'utilisateur de manière sécurisée
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      /**
       * Connecte un utilisateur en stockant ses données et tokens
       */
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      /**
       * Déconnecte l'utilisateur en nettoyant tout l'état
       */
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      /**
       * Met à jour les tokens après un refresh
       */
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      /**
       * Met à jour partiellement les données utilisateur
       */
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      /**
       * Indique si l'app est en cours de chargement initial
       */
      setLoading: (loading) => set({ isLoading: loading }),

      /**
       * Vérifie si l'utilisateur courant est administrateur
       */
      isAdmin: () => {
        const roles = get().user?.roles ?? [];
        return roles.includes(Role.ADMIN);
      },

      /**
       * Vérifie si l'utilisateur courant est membre
       */
      isMember: () => {
        const roles = get().user?.roles ?? [];
        return roles.includes(Role.MEMBER);
      },

      /**
       * Retourne le nom complet de l'utilisateur
       */
      fullName: () => {
        const user = get().user;
        return user ? `${user.prenoms} ${user.nom}` : '';
      },
    }),
    {
      name: 'dream-team-auth',
      storage: createJSONStorage(() => secureStorage),
      // Ne pas persister isLoading
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
