'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchConAuth } from '@/lib/auth';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  precio: string;
  en_venta: boolean;
  imagen_url: string;
}

export default function ObrasAdminPage() {
  const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const [obras, setObras] = useState<Obra[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Obra>>({
    titulo: '',
    descripcion: '',
    precio: '',
    en_venta: true,
    imagen_url: '',
  });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const router = useRouter();

  const getToken = () => localStorage.getItem('access_token') ?? '';

  const fetchObras = async () => {
    const token = getToken();
    if (!token) {
      setError('🔐 Necesitas iniciar sesión como administrador para acceder a esta sección.');
      return;
    }

    const data = await fetchConAuth(`${BASE}/api/admin/obras/`, token, setError);
    if (data && Array.isArray(data)) setObras(data);
  };

  useEffect(() => {
    fetchObras();
  }, []);

  const eliminarObra = async (id: number) => {
    if (!confirm('¿Eliminar esta obra?')) return;
    const token = getToken();
    try {
      const res = await fetch(`${BASE}/api/admin/obras/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      fetchObras();
      setMensaje('🗑️ Obra eliminada exitosamente.');
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error('❌ Error al eliminar obra:', error);
    }
  };

  const guardarObra = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setError('🔐 No tienes permiso para crear o editar obras.');
      return;
    }

    const url = editandoId
      ? `${BASE}/api/admin/obras/${editandoId}/`
      : `${BASE}/api/admin/obras/`;
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Error en la solicitud');

      fetchObras();
      setMensaje(editandoId ? '✅ Obra actualizada' : '✅ Obra creada');
      setForm({ titulo: '', descripcion: '', precio: '', en_venta: true, imagen_url: '' });
      setEditandoId(null);
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error('❌ Error al guardar obra');
    }
  };

  const editarObra = (obra: Obra) => {
    setForm(obra);
    setEditandoId(obra.id);
  };

  const irADetalle = (obraId: number) => {
    router.push(`/app/obra/${obraId}`);
  };

  // ✅ Mostrar solo mensaje si no hay acceso
  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen text-black">
        <div className="bg-red-100 text-red-800 p-4 rounded shadow">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">Obras</h2>

      {mensaje && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow">{mensaje}</div>
      )}

      <form onSubmit={guardarObra} className="space-y-4 bg-gray-100 p-4 rounded mb-8">
        <input
          value={form.titulo || ''}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          placeholder="Título"
          className="w-full p-2 rounded border"
          required
        />
        <textarea
          value={form.descripcion || ''}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Descripción"
          className="w-full p-2 rounded border"
        />
        <input
          value={form.precio || ''}
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
          placeholder="Precio"
          className="w-full p-2 rounded border"
        />
        <input
          value={form.imagen_url || ''}
          onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
          placeholder="Imagen URL"
          className="w-full p-2 rounded border"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.en_venta}
            onChange={(e) => setForm({ ...form, en_venta: e.target.checked })}
          />
          En venta
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editandoId ? 'Actualizar' : 'Agregar'} Obra
        </button>
      </form>

      <table className="w-full text-left bg-gray-100 rounded-lg overflow-hidden">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Imagen</th>
            <th className="p-3">Título</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Precio</th>
            <th className="p-3">En venta</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {obras.map((obra) => (
            <tr key={obra.id} className="border-b border-gray-300">
              <td className="p-3">{obra.id}</td>
              <td className="p-3">
                {obra.imagen_url ? (
                  <Image
                    src={obra.imagen_url}
                    alt={obra.titulo}
                    width={60}
                    height={60}
                    className="rounded cursor-pointer object-cover"
                    onClick={() => irADetalle(obra.id)}
                  />
                ) : (
                  <span className="text-gray-400">Sin imagen</span>
                )}
              </td>
              <td className="p-3">{obra.titulo}</td>
              <td className="p-3">{obra.descripcion}</td>
              <td className="p-3">${obra.precio}</td>
              <td className="p-3">{obra.en_venta ? '✅' : '❌'}</td>
              <td className="p-3 flex gap-2">
                <button
                  onClick={() => editarObra(obra)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarObra(obra.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
