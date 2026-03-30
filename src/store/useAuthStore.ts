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
import { UserResponse, AuthResponse } from '../types';

/**
 * Adaptateur de stockage sécurisé pour Zustand
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
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (authData: AuthResponse | UserResponse, accessToken?: string, refreshToken?: string) => void;
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
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      /**
       * Connecte un utilisateur. 
       * Supporte l'objet AuthResponse complet ou (user, access, refresh)
       */
      login: (authData, access, refresh) => {
        console.log('[AuthStore] Connexion en cours...', authData);
        // Déduction du format (cas Polymorphisme)
        if ('accessToken' in authData) {
          // Format AuthResponse
          set({
            user: authData.user,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('[AuthStore] Token enregistré:', authData.accessToken.substring(0, 10) + '...');
        } else {
          // Format (user, access, refresh)
          set({
            user: authData,
            accessToken: access || null,
            refreshToken: refresh || null,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('[AuthStore] Token enregistré via arguments');
        }
      },

      logout: () => {
        console.log('[AuthStore] Déconnexion');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        console.log('[AuthStore] Mise à jour des tokens');
        set({ accessToken, refreshToken });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      /**
       * Vérifie si l'utilisateur courant est administrateur
       * CORRECTION: Utilise des strings littérales pour éviter l'erreur de type
       */
      isAdmin: () => {
        const user = get().user;
        if (!user) {
          console.warn('[AuthStore] isAdmin(): User is null');
          return false;
        }
        
        // Supporte single role ou array roles (compatibilité backend)
        const roles = user.roles || (user.role ? [user.role] : []);
        const result = roles.includes('ADMIN');
        console.log('[AuthStore] isAdmin ?', result, roles);
        return result;
      },

      isMember: () => {
        const user = get().user;
        if (!user) return false;
        const roles = user.roles || (user.role ? [user.role] : []);
        return roles.includes('MEMBER');
      },

      fullName: () => {
        const user = get().user;
        return user ? `${user.prenoms} ${user.nom}` : '';
      },
    }),
    {
      name: 'dream-team-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
