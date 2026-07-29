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
  /** Session restore in progress (must not block login button). */
  isHydrating: boolean;
  /** Explicit login submit in progress. */
  isLoggingIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setSession: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}

let hydratePromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isHydrated: false,
      isHydrating: false,
      isLoggingIn: false,

      setSession: (accessToken, user) => {
        set({ accessToken, user });
      },

      setUser: (user) => {
        set({ user });
      },

      clearSession: () => {
        set({ accessToken: null, user: null });
      },

      login: async (username, password) => {
        set({ isLoggingIn: true });
        try {
          const result = await loginRequest(username, password);
          set({
            accessToken: result.accessToken,
            user: result.user,
            isHydrated: true,
            isHydrating: false,
          });
        } finally {
          set({ isLoggingIn: false });
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

        if (hydratePromise) {
          return hydratePromise;
        }

        hydratePromise = (async () => {
          set({ isHydrating: true });

          try {
            // Wait for persisted localStorage token before deciding refresh vs profile.
            if (
              typeof window !== 'undefined' &&
              !useAuthStore.persist.hasHydrated()
            ) {
              await new Promise<void>((resolve) => {
                const unsub = useAuthStore.persist.onFinishHydration(() => {
                  unsub();
                  resolve();
                });
                // Safety: don't hang forever if persist never fires.
                window.setTimeout(() => {
                  unsub();
                  resolve();
                }, 1_500);
              });
            }

            if (get().isHydrated) {
              return;
            }

            if (get().accessToken) {
              try {
                const user = await getProfileRequest();
                set({ user, isHydrated: true });
                return;
              } catch {
                // Access token invalid — try refresh cookie once.
              }
            }

            try {
              const result = await refreshTokenRequest();
              set({
                accessToken: result.accessToken,
                user: result.user,
                isHydrated: true,
              });
            } catch {
              get().clearSession();
              set({ isHydrated: true });
            }
          } catch {
            get().clearSession();
            set({ isHydrated: true });
          } finally {
            set({ isHydrating: false });
            hydratePromise = null;
          }
        })();

        return hydratePromise;
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
