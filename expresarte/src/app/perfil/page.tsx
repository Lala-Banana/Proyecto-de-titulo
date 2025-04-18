'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getSession } from 'next-auth/react';

export default function PerfilPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // 🔁 Obtener token desde el backend si estamos logueados por NextAuth pero no tenemos token local
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      getSession().then(async (session) => {
        if (!session?.user?.email) {
          router.push('/login');
          return;
        }

        try {
          const res = await fetch('http://localhost:8000/api/token-google/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email }),
          });

          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            window.location.reload(); // 🔁 Volvemos a cargar con todo listo
          } else {
            router.push('/login');
          }
        } catch (err) {
          router.push('/login');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-md text-center max-w-sm w-full">
        <img
          src={user.foto_url}
          alt="Foto del usuario"
          className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-gray-300"
        />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">{user.nombre}</h2>
        <p className="text-gray-500">{user.email}</p>

        <button
          onClick={logout}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
