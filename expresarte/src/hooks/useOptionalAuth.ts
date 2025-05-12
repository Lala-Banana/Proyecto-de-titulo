'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { Usuario } from '@/types/types';

export function useOptionalAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await getSession();
        console.log("👀 session desde useOptionalAuth:", session); // 👈 Aquí el log

        const sessionToken = (session as any)?.access_token;
        const manualToken = localStorage.getItem('access_token');
        const finalToken = sessionToken || manualToken;

        setToken(finalToken || null);
        if (!finalToken) {
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:8000/api/me/', {
          headers: {
            Authorization: `Bearer ${finalToken}`,
          },
        });

        if (!res.ok) {
          console.warn('⚠️ Token inválido, no se pudo obtener el usuario');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('❌ Error opcional al cargar usuario:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, token };
}
