'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

interface User {
  nombre: string;
  email: string;
  telefono: string;
  rut: string;
  descripcion: string;
  tipo_usuario: 'comprador' | 'artista' | '';
  ubicacion: string;
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
    email: '',
    telefono: '',
    rut: '',
    descripcion: '',
    tipo_usuario: '',
    ubicacion: '',
    foto_url: '',
    fondo: '',
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cargarUsuario = async () => {
      let token = localStorage.getItem('access_token');

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
        alert('Debes iniciar sesión para editar tu perfil.');
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/api/me/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();

        const data = await res.json();
        setUser({
          nombre: data.nombre || '',
          email: data.email || '',
          telefono: data.telefono || '',
          rut: data.rut || '',
          descripcion: data.descripcion || '',
          tipo_usuario: data.tipo_usuario || '',
          ubicacion: data.ubicacion || '',
          foto_url: data.foto_url || '',
          fondo: data.fondo || '',
        });
      } catch {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al guardar cambios');
      }
      router.push('/profile');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-center py-8">Cargando perfil...</p>;

  return (
    <div className="max-w mx-auto p-8 bg-white ">
      <h1 className="text-2xl font-bold mb-6">Editar perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FOTO DE PERFIL */}
        <div>
          <label className="block mb-2 text-black font-medium">Foto de perfil</label>
          {user.foto_url && (
            <img src={user.foto_url} alt="Avatar" className="w-32 h-32 rounded-full object-cover mb-2" />
          )}
          <input
            type="text"
            placeholder="URL de tu foto"
            value={user.foto_url}
            onChange={(e) => setUser({ ...user, foto_url: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-500"
          />
        </div>

        {/* DATOS BÁSICOS */}
        <fieldset className="border-t pt-4 space-y-4">
          <legend className="text-lg font-semibold">Datos de usuario</legend>

          <div>
            <label className="block mb-1 text-black">Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={user.nombre}
              onChange={(e) => setUser({ ...user, nombre: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-black">Email</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-black">Teléfono</label>
              <input
                type="tel"
                placeholder="+56912345678"
                value={user.telefono}
                onChange={(e) => setUser({ ...user, telefono: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-black">RUT</label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={user.rut}
                onChange={(e) => setUser({ ...user, rut: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-500"
              />
            </div>
          </div>
        </fieldset>

        {/* DETALLE ADICIONAL */}
        <fieldset className="border-t pt-4 space-y-4">
          <legend className="text-lg font-semibold">Información adicional</legend>

          <div>
            <label className="block mb-1 text-black">Descripción</label>
            <textarea
              placeholder="Cuéntanos sobre ti..."
              value={user.descripcion}
              onChange={(e) => setUser({ ...user, descripcion: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-black">Tipo de usuario</label>
            <select
              value={user.tipo_usuario}
              onChange={(e) =>
                setUser({ ...user, tipo_usuario: e.target.value as 'comprador' | 'artista' | '' })
              }
              className="w-full border border-gray-300 p-2 rounded text-black"
            >
              <option value="" disabled>
                Selecciona...
              </option>
              <option value="comprador">Comprador</option>
              <option value="artista">Artista</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-black">Ubicación</label>
            <input
              type="text"
              placeholder="Ciudad, País"
              value={user.ubicacion}
              onChange={(e) => setUser({ ...user, ubicacion: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-500"
            />
          </div>
        </fieldset>

        {/* SELECCIÓN DE FONDO */}
        <div>
          <p className="text-black mb-2 font-medium">Selecciona un fondo</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {fondos.map((url, idx) => (
              <div
                key={idx}
                className={`border-4 ${
                  user.fondo === url ? 'border-blue-500' : 'border-transparent'
                } rounded overflow-hidden cursor-pointer`}
                onClick={() => setUser({ ...user, fondo: url })}
              >
                <img src={url} alt={`Fondo ${idx + 1}`} className="w-full h-24 object-cover" />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
