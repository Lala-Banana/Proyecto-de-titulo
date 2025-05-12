'use client';

import { useEffect, useState } from 'react';
import { getSession, signOut } from 'next-auth/react';
import { Usuario } from '@/types/types';

export function useAuthUniversal() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await getSession();
        const sessionToken = (session as any)?.access_token;
        const manualToken = localStorage.getItem('access_token');
        const finalToken = sessionToken || manualToken;

        if (!finalToken) {
          setLoading(false);
          return;
        }

        setToken(finalToken);

        const res = await fetch('http://localhost:8000/api/me/', {
          headers: { Authorization: `Bearer ${finalToken}` },
        });

        if (!res.ok) {
          console.warn('⚠️ Token inválido, no se pudo obtener el usuario');
          setUser(null);
        } else {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('❌ Error al cargar usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setToken(null);
    await signOut({ callbackUrl: '/' });
  };

  return { user, token, loading, logout };
}
