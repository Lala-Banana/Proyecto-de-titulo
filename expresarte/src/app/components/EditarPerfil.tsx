'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch('http://localhost:8000/api/me/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          foto_url: data.foto_url || '',
          fondo: data.fondo || ''
        });
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const res = await fetch('http://localhost:8000/api/editar-perfil/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(user)
    });

    if (res.ok) {
      // ✅ Esperamos a que la actualización se guarde
      await new Promise((r) => setTimeout(r, 300)); // pequeño delay opcional
      router.push('/profile'); // redirige al perfil, que ya hace fetch de datos
    } else {
      const data = await res.json();
      alert('Error al guardar: ' + JSON.stringify(data));
    }
  };

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
