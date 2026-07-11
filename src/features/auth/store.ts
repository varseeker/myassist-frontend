'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getProfileRequest,
  loginRequest,
  logoutRequest,
  refreshTokenRequest,
} from '@/features/auth/api';
import type { User } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isHydrated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setSession: (accessToken: string, user: User) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isHydrated: false,
      isLoading: false,

      setSession: (accessToken, user) => {
        set({ accessToken, user });
      },

      clearSession: () => {
        set({ accessToken: null, user: null });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = await loginRequest(email, password);
          set({
            accessToken: result.accessToken,
            user: result.user,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          if (get().accessToken) {
            await logoutRequest();
          }
        } finally {
          get().clearSession();
        }
      },

      hydrate: async () => {
        if (get().isHydrated) {
          return;
        }

        set({ isLoading: true });

        try {
          if (get().accessToken) {
            const user = await getProfileRequest();
            set({ user });
            return;
          }

          const result = await refreshTokenRequest();
          set({
            accessToken: result.accessToken,
            user: result.user,
          });
        } catch {
          get().clearSession();
        } finally {
          set({ isHydrated: true, isLoading: false });
        }
      },
    }),
    {
      name: 'myassist-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);
