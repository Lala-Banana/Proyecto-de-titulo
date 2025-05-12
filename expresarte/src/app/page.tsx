'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import NavbarCombined from './components/Navbar';
import Carrusel from './components/Carrusel';
import Categorias from './components/Categorias';
import Footer from './components/Footer';

export default function HomePage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authType, setAuthType] = useState<'manual' | 'google' | 'none'>('none');

  useEffect(() => {
    const loadAuth = async () => {
      const session = await getSession();
      console.log('🟣 [NextAuth] session:', session);

      const googleToken = (session as any)?.access_token;
      const manualToken = localStorage.getItem('access_token');

      const finalToken = googleToken || manualToken;
      setToken(finalToken || null);

      if (googleToken) {
        console.log('✅ Login con Google detectado');
        setAuthType('google');
      } else if (manualToken) {
        console.log('✅ Login manual detectado');
        setAuthType('manual');
      } else {
        console.log('❌ No hay login activo');
        setAuthType('none');
        return;
      }

      console.log('🔑 Token usado:', finalToken);

      try {
        const res = await fetch('http://localhost:8000/api/me/', {
          headers: {
            Authorization: `Bearer ${finalToken}`,
          },
        });

        if (!res.ok) {
          console.warn('⚠️ Token inválido o expirado');
          return;
        }

        const data = await res.json();
        console.log('👤 Usuario autenticado:', data);
        setUserInfo(data);
      } catch (err) {
        console.error('❌ Error al obtener /api/me/:', err);
      }
    };

    loadAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavbarCombined />
      <Carrusel />

      <div className="px-4 md:px-8 mt-8">
        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-center mb-4">Explora por categorías</h2>
          <Categorias />
        </section>

        <div className="mt-10 p-4 bg-white rounded-lg shadow text-sm">
          <p><strong>🔍 Tipo de autenticación:</strong> {authType}</p>
          <p><strong>🔐 Token:</strong></p>
          <code className="break-words">{token || 'Ninguno'}</code>
        </div>

        {userInfo && (
          <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg">
            <p><strong>👤 Usuario autenticado:</strong></p>
            <p>Nombre: {userInfo.nombre}</p>
            <p>Email: {userInfo.email}</p>
            <p>ID: {userInfo.id}</p>
            <p>Tipo usuario: {userInfo.tipo_usuario || 'No especificado'}</p>
            <p>Ubicación: {userInfo.ubicacion || 'No disponible'}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
