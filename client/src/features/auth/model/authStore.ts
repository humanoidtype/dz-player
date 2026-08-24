// client/src/features/auth/model/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../../../entities/media';
import { API_BASE_URL } from '../../../shared/lib/api/config';

export interface AuthStore {
  user: User | null;
  sessionId: string | null;
  isLoggedIn: boolean;
  cookiesStatus: 'ready' | 'pending' | 'error';
  login: (idToken: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      sessionId: null,
      isLoggedIn: false,
      cookiesStatus: 'pending',
      login: async (idToken: string) => {
        const resp = await fetch(`${API_BASE_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        const data = await resp.json();
        if (!resp.ok || data.error) throw new Error(data.error?.message || 'Auth failed');
        set({ user: data.user, sessionId: data.session.id, isLoggedIn: true, cookiesStatus: 'ready' });
      },
      logout: () => {
        set({ user: null, sessionId: null, isLoggedIn: false, cookiesStatus: 'pending' });
      },
      refresh: async () => {
        set({ cookiesStatus: 'pending' });
        const { sessionId } = get();
        if (!sessionId) return;
        const resp = await fetch(`${API_BASE_URL}/api/me`, {
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
      storage: createJSONStorage(() => localStorage),
    }
  )
);
