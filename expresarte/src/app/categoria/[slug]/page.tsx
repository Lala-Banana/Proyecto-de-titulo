'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ObrasGrid from '@/app/components/ObrasGrid';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
}

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

  const fetchObras = async () => {
    try {
      const headers: HeadersInit = {};
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:8000/api/categorias/${slug}/`, {
        headers,
      });

      if (!res.ok) throw new Error('Error al obtener obras de la categoría');

      const data = await res.json();
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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavbarCombined />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Categoría: {slug}</h1>

        {loading && <p className="text-center mt-10">Cargando obras...</p>}
        {error && <p className="text-center text-red-600 mt-10">⚠️ {error}</p>}

        {!loading && !error && obras.length === 0 && (
          <p className="text-center mt-10 text-gray-500">No hay obras en esta categoría.</p>
        )}

        {!loading && obras.length > 0 && <ObrasGrid obras={obras} slug={slug as string} />}
      </div>

      <Footer />
    </div>
  );
}
