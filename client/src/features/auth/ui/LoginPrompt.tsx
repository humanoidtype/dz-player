// client/src/features/auth/ui/LoginPrompt.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../model/authStore';

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

export interface LoginPromptProps {
  title?: string;
  onSuccess?: () => void;
}

export const LoginPrompt: React.FC<LoginPromptProps> = ({
  title = 'YouTube mendeteksi aktivitas tidak biasa. Login untuk melanjutkan.',
  onSuccess,
}) => {
  const login = useAuthStore((s) => s.login);
  const btnRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setStatus('error');
      return;
    }
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (window.google?.accounts?.id && btnRef.current) {
        clearInterval(timer);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp: { credential?: string }) => {
            if (!resp.credential) return;
            login(resp.credential)
              .then(() => onSuccess?.())
              .catch(() => setStatus('error'));
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          locale: 'id',
        });
        setStatus('ready');
      } else if (tries > 10) {
        clearInterval(timer);
        setStatus('error');
      }
    }, 300);
    return () => clearInterval(timer);
  }, [login, onSuccess]);

  return (
    <div className="col-span-full bg-surface border border-border rounded-xl p-6 text-center">
      <p className="text-sm text-text-primary mb-1">{title}</p>
      <p className="text-caption mb-4">
        Sesi login membuat request terlihat seperti pengguna asli.
      </p>
      {status === 'loading' && <p className="text-text-secondary text-xs">Memuat tombol login…</p>}
      {status === 'error' && (
        <p className="text-text-error text-xs">
          Login belum tersedia. Set VITE_GOOGLE_CLIENT_ID pada build.
        </p>
      )}
      <div ref={btnRef} className="flex justify-center min-h-[40px]" />
    </div>
  );
};
