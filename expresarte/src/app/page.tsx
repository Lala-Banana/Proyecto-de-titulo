'use client';

import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import NavbarCombined from './components/Navbar';
import Carrusel from './components/Carrusel';
import Categorias from './components/Categorias';
import UsuariosAleatorios from './components/UsuariosAleatorioHome';
import Footer from './components/Footer';

export default function HomePage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authType, setAuthType] = useState<'manual' | 'google' | 'none'>('none');

  useEffect(() => {
    const loadAuth = async () => {
      const session = await getSession();
      const googleToken = (session as any)?.access_token;
      const manualToken = typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;
      const finalToken = googleToken || manualToken;
      setToken(finalToken);

      if (googleToken) {
        setAuthType('google');
        localStorage.setItem('access_token', googleToken);
        localStorage.setItem('refresh_token', (session as any)?.refresh_token || '');
      } else if (manualToken) {
        setAuthType('manual');
      } else {
        setAuthType('none');
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/me/', {
          headers: { Authorization: `Bearer ${finalToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
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

      {/* Mostramos solo 4 categorías */}
      <Categorias
        columnas={4}
        limite={4}
        titulo="CATEGORÍAS DESTACADAS"
      />

      <UsuariosAleatorios />
      <Footer />
    </div>
  );
}
