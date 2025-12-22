import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@pt/shared';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, locale?: 'en' | 'ru') => Promise<void>;
  requestMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response: any = await api.login({ email, password });
        api.setToken(response.accessToken);
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });

        // Trigger migration and sync in next tick to avoid circular dependency
        setTimeout(() => {
          import('./tasksStore').then(({ useTasksStore }) => {
            const store = useTasksStore.getState();
            store.migrateLocalTasks(response.user.id).then(() => {
              store.sync();
            });
          });
        }, 0);
      },

      register: async (email, password, locale = 'en') => {
        const response: any = await api.register({ email, password, locale });
        api.setToken(response.accessToken);
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });

        // Trigger migration and sync in next tick
        setTimeout(() => {
          import('./tasksStore').then(({ useTasksStore }) => {
            const store = useTasksStore.getState();
            store.migrateLocalTasks(response.user.id).then(() => {
              store.sync();
            });
          });
        }, 0);
      },

      requestMagicLink: async (email) => {
        await api.requestMagicLink(email);
      },

      verifyMagicLink: async (token) => {
        const response: any = await api.verifyMagicLink(token);
        api.setToken(response.accessToken);
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });

        // Trigger migration and sync in next tick
        setTimeout(() => {
          import('./tasksStore').then(({ useTasksStore }) => {
            const store = useTasksStore.getState();
            store.migrateLocalTasks(response.user.id).then(() => {
              store.sync();
            });
          });
        }, 0);
      },

      logout: () => {
        api.setToken(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state?.accessToken) {
            api.setToken(state.accessToken);
          }
        };
      },
    }
  )
);
