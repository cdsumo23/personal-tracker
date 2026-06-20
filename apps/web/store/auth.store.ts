import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import { setToken, setUser, removeToken, getToken, getUser } from '@/lib/auth';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      initializeAuth: () => {
        const token = getToken();
        const user = getUser<User>();
        if (token && user) {
          set({ token, user, isAuthenticated: true });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          const { user, accessToken } = response.data.data;
          setToken(accessToken);
          setUser(user);
          set({
            user: user as User,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          set({
            isLoading: false,
            isAuthenticated: false,
            error: err.response?.data?.message || 'Login failed. Please try again.',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch {
          // Continue logout even if server request fails
        } finally {
          removeToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      setUser: (user: User) => {
        setUser(user);
        set({ user });
      },

      setToken: (token: string) => {
        setToken(token);
        set({ token, isAuthenticated: true });
      },

      refreshToken: async () => {
        const token = getToken();
        if (!token) return;
        try {
          const response = await authApi.getMe();
          const user = response.data.data as User;
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
          removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
