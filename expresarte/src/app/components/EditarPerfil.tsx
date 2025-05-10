'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

interface User {
  nombre: string;
  descripcion: string;
  foto_url: string;
  fondo: string;
}

const fondos = [
  'https://images.unsplash.com/photo-1415889455891-23bbf19ee5c7?q=80&w=1476&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?q=80&w=1470&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520121401995-928cd50d4e27?q=80&w=1470&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1453959022778-cfda85dbe0f9?q=80&w=1470&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581985430116-d8fba25256b0?q=80&w=1470&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1646995919720-a27def2d37e9?q=80&w=1374&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1645260836430-7104791a865a?q=80&w=1374&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1482686115713-0fbcaced6e28?q=80&w=1467&auto=format&fit=crop'
];

export default function EditarPerfil() {
  const [user, setUser] = useState<User>({
    nombre: '',
    descripcion: '',
    foto_url: '',
    fondo: '',
    
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cargarUsuario = async () => {
      let token = localStorage.getItem('access_token');

      // Si no hay token en localStorage, intenta obtenerlo desde NextAuth
      if (!token) {
        const session = await getSession();
        if (session && (session as any).access_token) {
          token = (session as any).access_token;
          if (token) {
            localStorage.setItem('access_token', token);
          }
        }
      }

      if (!token) {
        console.warn('❌ Token no disponible ni en localStorage ni en sesión. Redirigiendo...');
        alert('Debes iniciar sesión para editar tu perfil.');
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/me/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Error al obtener usuario');

        const data = await res.json();
        console.log('👤 Usuario cargado:', data);
        setUser({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          foto_url: data.foto_url || '',
          fondo: data.fondo || ''
        });
      } catch (error) {
        console.error('❌ Error al cargar usuario:', error);
        alert('Error al obtener datos del perfil.');
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Sesión expirada. Inicia sesión nuevamente.');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/editar-perfil/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });

      if (res.ok) {
        console.log('✅ Perfil actualizado correctamente');
        await new Promise((r) => setTimeout(r, 300));
        router.push('/profile');
      } else {
        const data = await res.json();
        console.error('❌ Error al guardar:', data);
        alert('Error al guardar cambios: ' + (data.detail || JSON.stringify(data)));
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  if (loading) return <p className="text-center py-8">Cargando perfil...</p>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Editar perfil</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nombre"
          value={user.nombre}
          onChange={(e) => setUser({ ...user, nombre: e.target.value })}
          className="border border-gray-300 p-2 rounded"
        />
        <textarea
          placeholder="Descripción"
          value={user.descripcion}
          onChange={(e) => setUser({ ...user, descripcion: e.target.value })}
          className="border border-gray-300 p-2 rounded"
        />

        <input
          type="text"
          placeholder="URL de foto de perfil"
          value={user.foto_url}
          onChange={(e) => setUser({ ...user, foto_url: e.target.value })}
          className="border border-gray-300 p-2 rounded"
        />

        <div>
          <p className="mb-2">Selecciona un fondo:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {fondos.map((url, idx) => (
              <div
                key={idx}
                className={`border-4 ${user.fondo === url ? 'border-blue-500' : 'border-transparent'} rounded overflow-hidden cursor-pointer`}
                onClick={() => setUser({ ...user, fondo: url })}
              >
                <img src={url} alt={`Fondo ${idx + 1}`} className="w-full h-24 object-cover" />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
