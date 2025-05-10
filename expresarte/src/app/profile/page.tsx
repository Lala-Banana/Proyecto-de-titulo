'use client';

import { useEffect, useState } from 'react';
import { getSession, signOut } from 'next-auth/react';
import PerfilUsuario from '../components/PerfilUsuario';
import NavbarCombined from '../components/Navbar';
import Footer from '../components/Footer';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
}

interface User {
  id: number;
  nombre: string;
  email: string;
  foto_url: string;
  descripcion: string;
  seguidores?: number;
  me_gusta?: number;
}

export default function ProfilePage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'venta' | 'noVenta'>('venta');

  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return null;

    try {
      const res = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } catch (error) {
      console.error('❌ Error al refrescar token', error);
      return null;
    }
  };

  const fetchUserAndObras = async (accessToken: string) => {
    try {
      const userRes = await fetch('http://localhost:8000/api/me/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (userRes.status === 401) {
        console.warn('⚠️ Token expirado, intentando refrescar...');
        const newToken = await refreshAccessToken();
        if (!newToken) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');

        setToken(newToken);

        return await fetchUserAndObras(newToken); // retry con nuevo token
      }

      if (!userRes.ok) throw new Error(await userRes.text());

      const userData = await userRes.json();
      setUser(userData);

      const obrasRes = await fetch(`http://localhost:8000/api/obras/?usuario_id=${userData.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!obrasRes.ok) throw new Error('Error al obtener obras');

      const obrasData = await obrasRes.json();
      setObras(obrasData);
    } catch (err: any) {
      console.error('❌ Error al cargar perfil', err);
      setError(err.message || 'Error desconocido');
      signOut(); // o redirige a /login
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      let accessToken: string | null = null;

      // Reintenta 3 veces con delay incremental
      for (let i = 0; i < 3; i++) {
        const session = await getSession();

        if (session && (session as any).access_token) {
          accessToken = (session as any).access_token;
          break;
        }

        accessToken = localStorage.getItem('access_token');
        if (accessToken) break;

        console.warn(`⏳ Intento ${i + 1}: Token aún no disponible, esperando...`);
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }

      if (!accessToken) {
        console.error('⛔ Token sigue sin estar disponible después del delay');
        setError('No se encontró un token válido. Por favor inicia sesión.');
        setLoading(false);
        return;
      }

      console.log('✅ Token listo:', accessToken);
      setToken(accessToken);
      await fetchUserAndObras(accessToken);
    };

    init();
  }, []);

  if (loading || !user) return <p className="text-center mt-20">Cargando perfil...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">⚠️ {error}</p>;

  const obrasEnVenta = obras.filter((obra) => obra.en_venta);
  const obrasNoVenta = obras.filter((obra) => !obra.en_venta);

  return (
    <div className="bg-gray-50 text-gray-900">
      <NavbarCombined />

      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1415889455891-23bbf19ee5c7?q=80&w=1476&auto=format&fit=crop"
            alt="Fondo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-none" />
        </div>

        <div className="relative z-10 py-12 px-4 text-white flex flex-col items-center">
          <PerfilUsuario
            user={user}
            token={token || ''}
            obrasEnVenta={obrasEnVenta}
            obrasNoVenta={obrasNoVenta}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
