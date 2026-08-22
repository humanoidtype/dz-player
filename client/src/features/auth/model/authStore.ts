// client/src/features/auth/model/authStore.ts
import create from 'zustand/middleware';
import type { User } from '../../entities/media';
import { persist } from 'zustand/middleware';

export interface AuthStore {
  user: User | null;
  sessionId: string | null;
  isLoggedIn: boolean;
  cookiesStatus: 'ready' | 'pending' | 'error';
  login: (idToken: string, accessToken: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      sessionId: null,
      isLoggedIn: false,
      cookiesStatus: 'pending',
      login: async (idToken: string, accessToken: string) => {
        const resp = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, accessToken }),
        });
        const data = await resp.json();
        if (!resp.ok || data.error) throw new Error(data.error?.message || 'Auth failed');
        set({ user: data.user, sessionId: data.session.id, isLoggedIn: true, cookiesStatus: 'ready' });
      },
      logout: () => {
        fetch('/api/auth/logout', { method: 'POST' }).then(() =>
          set({ user: null, sessionId: null, isLoggedIn: false, cookiesStatus: 'pending' })
        );
      },
      refresh: async () => {
        set({ cookiesStatus: 'pending' });
        const { sessionId } = get();
        if (!sessionId) return;
        const resp = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${sessionId}` },
        });
        const data = await resp.json();
        if (!resp.ok) {
          set({ cookiesStatus: 'error', isLoggedIn: false });
          return;
        }
        set({ user: data.user, sessionId: data.session.id, cookiesStatus: 'ready' });
      },
    }),
    {
      name: 'auth-store',
      storage: {
        getItem: (name: string) => {
          if (typeof window !== 'undefined') return localStorage.getItem(name);
          return null;
        },
        setItem: (name: string, value: string) => {
          if (typeof window !== 'undefined') localStorage.setItem(name, value);
        },
        removeItem: (name: string) => {
          if (typeof window !== 'undefined') localStorage.removeItem(name);
        },
      },
    }
  )
);