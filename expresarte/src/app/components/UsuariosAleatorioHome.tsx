'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface UsuarioPublico {
  id: number;
  nombre: string;
  foto_url: string;
  descripcion: string;
  ubicacion: string;
}

export default function UsuariosAleatorios() {
  const [usuarios, setUsuarios] = useState<UsuarioPublico[]>([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/usuarios-publicos/');
        if (!res.ok) throw new Error('No se pudieron cargar los usuarios.');

        const todosUsuarios: UsuarioPublico[] = await res.json();
        const seleccionados = todosUsuarios
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        setUsuarios(seleccionados);
      } catch (err) {
        console.error('Error al cargar usuarios públicos:', err);
      }
    };

    fetchUsuarios();
  }, []);

  if (usuarios.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Conoce a algunos artistas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {usuarios.map((user) => (
          <Link
            key={user.id}
            href={`/usuarios/${user.id}`}
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition"
          >
            <Image
              src={user.foto_url || '/default-avatar.png'}
              alt={user.nombre}
              width={100}
              height={100}
              className="mx-auto rounded-full object-cover"
            />
            <h3 className="text-lg font-semibold mt-3">{user.nombre}</h3>
            <p className="text-sm text-gray-500">{user.ubicacion}</p>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
              {user.descripcion || 'Sin descripción'}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}