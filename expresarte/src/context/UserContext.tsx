'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface Usuario {
  nombre: string;
  email: string;
  foto_url?: string;
}

interface UserContextType {
  user: Usuario | null;
  loading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      if (status === 'loading') return;

      // ✅ Si hay sesión de NextAuth (Google)
      if (session?.user?.email) {
        setUser({
          nombre: session.user.nombre || session.user.name || '',
          email: session.user.email,
          foto_url: session.user.foto_url || session.user.image || '',
        });
        setLoading(false);
        return;
      }

      // ✅ Si no hay sesión de Google, intenta cargar desde Django (manual login)
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/me/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setUser({
              nombre: data.nombre,
              email: data.email,
              foto_url: data.foto_url || '',
            });
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('❌ Error al obtener usuario desde Django:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    cargarUsuario();
  }, [session, status]);

  const logout = () => {
    localStorage.removeItem('access_token');
    signOut({ callbackUrl: '/' }); // Para Google
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
