'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

// Obra ahora incluye información del vendedor
type Obra = {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  precio: number;
  en_venta: boolean;
  usuario: {
    id: number;
    nombre: string;
  };
};

export default function CategoriaSlugPage() {
  const { slug } = useParams();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) {
      setError('Slug no disponible');
      setLoading(false);
      return;
    }
    const categoriaSlug = Array.isArray(slug) ? slug[0] : slug;
    const fetchObras = async () => {
      try {
        setLoading(true);
        setError('');

        const headers: HeadersInit = {};
        const token = localStorage.getItem('access_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(
          `http://localhost:8000/api/categorias/${categoriaSlug}/obras/`,
          { headers }
        );
        if (!res.ok) {
          if (res.status === 404)
            throw new Error(`Categoría "${categoriaSlug}" no encontrada`);
          throw new Error(`Error ${res.status} al cargar obras`);
        }

        const data: Obra[] = await res.json();
        setObras(data);
      } catch (err: any) {
        setError(err.message || 'Error inesperado');
      } finally {
        setLoading(false);
      }
    };
    fetchObras();
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-gray-900">
      <NavbarCombined />

      <div className="flex justify-center items-start py-32">
        <div className="w-full max-w-7xl px-4">
          <h1 className="text-4xl font-serif italic font-bold tracking-wider text-black mb-6 text-center uppercase">
            Obras de la categoría: {slug}
          </h1>

          {loading && <p className="text-center mt-10">Cargando obras...</p>}
          {error && (
            <p className="text-center text-red-600 mt-10">⚠️ {error}</p>
          )}
          {!loading && !error && obras.length === 0 && (
            <p className="text-center mt-10 text-gray-500">
              No hay obras en esta categoría.
            </p>
          )}

          {!loading && obras.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {obras.map((obra) => (
                <div
                  key={obra.id}
                  className="group cursor-pointer border hover:scale-105 transition-transform duration-300 border-gray-300 rounded-r-full"
                  onClick={() => window.location.href = `/publicaciones/${obra.id}`}
                >
                  <div className="aspect-square overflow-hidden  shadow-neutral-950">
                    <img
                      src={obra.imagen_url || '/default-image.jpg'}
                      alt={obra.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Detalles ocultos hasta hover debajo */}
                  <div className=" overflow-hidden group-hover:max-h-34 transition-all duration-300 bg-white p-4">
                    <h2 className="text-lg font-bold mb-1">{obra.titulo}</h2>
                    <p className="text-sm mb-1">
                      Precio: ${obra.precio.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 mb-2 truncate">
                      {obra.descripcion}
                    </p>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
