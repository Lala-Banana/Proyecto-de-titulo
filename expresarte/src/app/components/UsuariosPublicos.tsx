'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UsuarioPublico {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  foto_url: string | null;
  ubicacion?: string;
}

export default function UsuariosPublicos() {
  const [usuarios, setUsuarios] = useState<UsuarioPublico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/usuarios-publicos/');
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }
        const data: UsuarioPublico[] = await res.json();
        setUsuarios(data);
      } catch (err: any) {
        console.error('❌ Error al cargar usuarios públicos:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando usuarios...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
  if (usuarios.length === 0) return <p className="text-center mt-10">No hay usuarios públicos.</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Usuarios Públicos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {usuarios.map(u => (
          <div
            key={u.id}
            onClick={() => router.push(`/usuarios/${u.id}`)}
            className="cursor-pointer bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition"
          >
            <Image
              src={u.foto_url || '/default-avatar.png'}
              alt={u.nombre}
              width={80}
              height={80}
              className="rounded-full object-cover mb-4"
            />
            <h3 className="font-semibold text-lg mb-2 truncate">{u.nombre}</h3>
            <p className="text-sm text-gray-600 mb-1 truncate">{u.email}</p>
            {u.ubicacion && <p className="text-sm text-gray-500">{u.ubicacion}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
