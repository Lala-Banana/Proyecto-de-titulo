'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { fetchConAuth } from '@/lib/auth';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  slug: string;
  visible: boolean;
  imagen_url: string;
}

export default function CategoriasPage() {
  const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [slug, setSlug] = useState('');
  const [visible, setVisible] = useState(true);
  const [imagenUrl, setImagenUrl] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formularioRef = useRef<HTMLDivElement | null>(null);

  const getToken = () => localStorage.getItem('access_token') ?? '';

  const fetchCategorias = async () => {
    const token = getToken();
    const data = await fetchConAuth(`${BASE}/api/admin/categorias/`, token, setError);
    if (data && Array.isArray(data)) setCategorias(data);
    else setCategorias([]);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'expresarte_preset');

    const res = await fetch('https://api.cloudinary.com/v1_1/drb5jrimz/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'Error al subir imagen');
    }

    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let imagenUrlFinal = imagenUrl;

    if (imagen) {
      try {
        setSubiendoImagen(true);
        imagenUrlFinal = await uploadImageToCloudinary(imagen);
        console.log('✅ Imagen subida:', imagenUrlFinal);
      } catch (err) {
        console.error('❌ Error al subir imagen:', err);
        setError('No se pudo subir la imagen.');
        setSubiendoImagen(false);
        return;
      } finally {
        setSubiendoImagen(false);
      }
    }

    const payload = {
      nombre,
      descripcion,
      slug,
      imagen_url: imagenUrlFinal,
      visible,
    };

    const token = getToken();
    const url = editandoId
      ? `${BASE}/api/admin/categorias/${editandoId}/`
      : `${BASE}/api/admin/categorias/`;
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Error al guardar (${res.status}):`, errorText);
        setError('No se pudo guardar la categoría.');
        return;
      }

      limpiarFormulario();
      fetchCategorias();
      setMensaje(editandoId ? '✅ Categoría actualizada exitosamente.' : '✅ Categoría creada exitosamente.');
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error('❌ Error de red al guardar categoría:', error);
      setError('No se pudo guardar la categoría.');
    }
  };

  const handleEditar = (cat: Categoria) => {
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion);
    setSlug(cat.slug);
    setImagenUrl(cat.imagen_url);
    setImagen(null);
    setVisible(cat.visible);
    setEditandoId(cat.id);
    formularioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    const token = getToken();
    try {
      const res = await fetch(`${BASE}/api/admin/categorias/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        console.error(`❌ Error al eliminar (${res.status})`);
        return;
      }
      fetchCategorias();
      setMensaje('🗑️ Categoría eliminada exitosamente.');
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error('❌ Error de red al eliminar categoría:', error);
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setSlug('');
    setImagenUrl('');
    setImagen(null);
    setVisible(true);
    setEditandoId(null);
    setError(null);
    setMensaje(null);
    formularioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen text-black">
        <div className="bg-red-100 text-red-800 p-4 rounded shadow">{error}</div>
      </div>
    );
  }

  return (
    <div className=" capitalize bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">Categorías</h2>

      {mensaje && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow">
          {mensaje}
        </div>
      )}

      <div ref={formularioRef}>
        <form onSubmit={handleSubmit} className="mb-8 space-y-3 bg-gray-100 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="bg-gray-200 text-black border border-gray-300 p-2 rounded"
              required
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug"
              className="bg-gray-200 text-black border border-gray-300 p-2 rounded"
              required
            />
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción"
              className="bg-gray-200 text-black border border-gray-300 p-2 rounded col-span-2"
            />

            <div className="col-span-2 space-y-2">
              <label className="block text-sm font-medium text-black mb-1">Imagen</label>
              <div className="flex items-center space-x-4 mb-2">
                <label className="bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-800 transition">
                  Elegir archivo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setImagen(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <span className="text-black text-sm">
                  {imagen ? imagen.name : imagenUrl ? 'Imagen existente' : 'Ningún archivo seleccionado'}
                </span>

                {(imagen || imagenUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagen(null);
                      setImagenUrl('');
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Limpiar imagen
                  </button>
                )}
              </div>

              {(imagen || imagenUrl) && (
                <div className="relative border rounded overflow-hidden w-32 h-32">
                  <img
                    src={imagen ? URL.createObjectURL(imagen) : imagenUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {subiendoImagen && <p className="text-blue-600 mt-2">Subiendo imagen...</p>}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Visible</span>
            </label>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white"
              disabled={subiendoImagen}
            >
              {editandoId ? 'Actualizar' : 'Agregar'} Categoría
            </button>

            <button
              type="button"
              onClick={limpiarFormulario}
              className="bg-gray-500 hover:bg-gray-600 px-6 py-2 rounded text-white"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <table className="w-full text-left bg-gray-100 rounded-lg overflow-hidden">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Imagen</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Visible</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border-b border-gray-300">
              <td className="p-3">{cat.id}</td>
              <td className="p-3">
                {cat.imagen_url ? (
                  <a href={`/categoria/${cat.slug}`}>
                    <Image
                      src={cat.imagen_url}
                      alt={cat.nombre}
                      width={50}
                      height={50}
                      className="rounded object-cover"
                    />
                  </a>
                ) : (
                  <span className="text-gray-400">Sin imagen</span>
                )}
              </td>
              <td className="p-3">{cat.nombre}</td>
              <td className="p-3">{cat.descripcion}</td>
              <td className="p-3">{cat.slug}</td>
              <td className="p-3">{cat.visible ? '✅' : '❌'}</td>
              <td className="p-3 flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  onClick={() => handleEditar(cat)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => handleEliminar(cat.id)}
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
