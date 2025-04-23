'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

interface Usuario {
  email: string;
  nombre: string;
  foto_url: string;
}

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/me/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Token inválido');

      const data = await res.json();
      setUser(data);
    } catch (err) {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        logout();
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/token/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });

        if (!res.ok) throw new Error('Refresh falló');

        const data = await res.json();
        localStorage.setItem('access_token', data.access);
        await fetchUser(data.access);
      } catch {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetchUser(token);
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

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);

    // 🔁 Si estamos usando NextAuth, cerrar también su sesión
    signOut({ callbackUrl: '/login' });
  };

  return { user, loading, logout };
}
