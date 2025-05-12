'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: number;
  en_venta: boolean;
}

interface User {
  fondo?: string;
}

export default function ObraPage() {
  const router = useRouter();
  const pathname = usePathname();           // e.g. "/obras/40"
  const searchParams = useSearchParams();   // para leer "?token=..."
  const [obra, setObra] = useState<Obra | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extraer el ID de la URL
  const idMatch = pathname.match(/\/obras\/(\d+)/);
  const obraId = idMatch ? idMatch[1] : null;

  // Función unificada para obtener el token
  const getValidToken = async (): Promise<string | null> => {
    let token = searchParams.get('token') || null;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }
    if (!token) {
      const session = await getSession();
      token = (session as any)?.access_token || null;
      if (token) localStorage.setItem('access_token', token);
    }
    return token;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!obraId) {
        setError('ID de obra inválido');
        setLoading(false);
        return;
      }

      // 1) Obtener token
      const token = await getValidToken();
      if (!token) {
        setError('No hay token disponible. Inicia sesión.');
        setLoading(false);
        return;
      }

      // 2) Cargar perfil para fondo
      try {
        const perfilRes = await fetch('http://localhost:8000/api/me/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (perfilRes.ok) {
          const perfilData = await perfilRes.json();
          setUser({ fondo: perfilData.fondo });
        }
      } catch (err) {
        console.warn('❌ Error al cargar perfil para fondo:', err);
      }

      // 3) Cargar obra
      try {
        const res = await fetch(`http://localhost:8000/api/obras/${obraId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          setError('Token inválido o expirado.');
        } else if (!res.ok) {
          const txt = await res.text();
          setError(`Error al cargar obra: ${txt}`);
        } else {
          setObra(await res.json());
        }
      } catch (err: any) {
        console.error(err);
        setError('Error de red al cargar la obra.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [obraId, searchParams]);

  if (loading) return <p className="text-center mt-20">Cargando…</p>;
  if (error)    return <p className="text-center mt-20 text-red-600">{error}</p>;
  if (!obra)   return <p className="text-center mt-20">Obra no encontrada.</p>;

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-900">
      <NavbarCombined />

      {/* Fondo dinámico */}
      <div className="absolute inset-0 z-0">
        <img
          src={user?.fondo || 'https://images.unsplash.com/photo-1415889455891-23bbf19ee5c7?q=80&w=1476&auto=format&fit=crop'}
          alt="Fondo de perfil"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-3xl mx-auto p-6 bg-white bg-opacity-90 rounded-lg shadow-lg mt-8">
        <h1 className="text-3xl font-bold mb-4">{obra.titulo}</h1>
        <div className="mb-6">
          <Image
            src={obra.imagen_url}
            alt={obra.titulo}
            width={600}
            height={400}
            className="w-full h-auto object-cover rounded"
          />
        </div>
        <p className="mb-4">{obra.descripcion}</p>
        {obra.en_venta ? (
          <p className="text-xl font-semibold">
            Precio: <span className="text-green-600">${obra.precio}</span>
          </p>
        ) : (
          <p className="text-xl font-semibold text-gray-500">No está en venta</p>
        )}
        <button
          onClick={() => router.back()}
          className="mt-8 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          ← Volver
        </button>
      </div>

      <Footer />
    </div>
  );
}
