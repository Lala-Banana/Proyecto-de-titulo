'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Usuario } from '@/types/types';

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (accessToken: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/me/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error('Access token inválido');

      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      await tryRefreshToken();
    } finally {
      setLoading(false);
    }
  };

  const tryRefreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      handleLogout();
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) throw new Error('Refresh token inválido');

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      await fetchUser(data.access);
    } catch {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    await signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const syncLogout = (e: StorageEvent) => {
      if ((e.key === 'access_token' || e.key === 'refresh_token') && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  return { user, loading, logout: handleLogout };
}
