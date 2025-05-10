'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import NavbarCombined from './components/Navbar';
import Carrusel from './components/Carrusel';
import Categorias from './components/Categorias';
import Footer from './components/Footer';

export default function HomePage() {
  const { data: session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // 1. Token desde NextAuth (Google)
    const nextAuthToken = (session as any)?.access_token;

    // 2. Token desde localStorage (Login manual)
    const manualToken = localStorage.getItem('access_token');

    const finalToken = nextAuthToken || manualToken;
    setToken(finalToken);
    console.log('🔐 Token desde sesión o localStorage:', finalToken);

    if (finalToken) {
      const fetchUserInfo = async () => {
        try {
          const res = await fetch('http://localhost:8000/api/me/', {
            headers: {
              Authorization: `Bearer ${finalToken}`,
            },
          });

          if (!res.ok) throw new Error('Error al obtener información del usuario');

          const data = await res.json();
          console.log('📥 Datos del usuario desde /api/me/:', data);
          setUserInfo(data);
        } catch (error) {
          console.error('❌ Error en la petición /api/me/', error);
        }
      };

      fetchUserInfo();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavbarCombined />
      <Carrusel />

      <div className="px-4 md:px-8 mt-8">
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-center mb-4">Explora por categorías</h2>
          <Categorias />
        </section>

        {token && (
          <div className="mt-10 p-4 bg-white rounded-lg shadow text-sm">
            <p><strong>🔐 Token:</strong></p>
            <code className="break-words">{token}</code>
          </div>
        )}

        {userInfo && (
          <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg">
            <p><strong>👤 Usuario autenticado:</strong></p>
            <p>Nombre: {userInfo.nombre}</p>
            <p>Email: {userInfo.email}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
