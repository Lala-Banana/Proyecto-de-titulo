'use client';

import { useEffect, useState } from 'react';
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
  categoria: number;
}

export default function ObrasPage() {
  const [todasLasObras, setTodasLasObras] = useState<Obra[]>([]);
  const [obrasFiltradas, setObrasFiltradas] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroVenta, setFiltroVenta] = useState<'all' | 'enVenta' | 'noVenta'>('all');

  const fetchObras = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/obras/');
      if (!res.ok) throw new Error('Error al cargar obras');
      const data: Obra[] = await res.json();
      setTodasLasObras(data);
      setObrasFiltradas(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las obras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObras();
  }, []);

  const aplicarFiltroCategoria = (categoriaId: number | null) => {
    if (categoriaId === null) {
      setObrasFiltradas(todasLasObras);
    } else {
      setObrasFiltradas(
        todasLasObras.filter((obra) => obra.categoria === categoriaId)
      );
    }
  };

  // Filtra según estado de venta además del filtro de categoría
  const obrasMostradas = obrasFiltradas.filter((obra) => {
    if (filtroVenta === 'enVenta') return obra.en_venta;
    if (filtroVenta === 'noVenta') return !obra.en_venta;
    return true;
  });

  return (
    <>
      <NavbarCombined />
      <main className="pt-24 py-30 pb-16 bg-white min-h-screen flex flex-col items-center">
        <div className="w-full max-w-7xl px-4">
          <br />
          <h1 className="text-4xl font-serif italic font-bold tracking-wider text-center text-black mb-10">
            PUBLICACIONES DISPONIBLES
          </h1>
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setFiltroVenta('all')}
              className={`px-4 py-2 rounded-lg transition ${
            filtroVenta === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
            }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroVenta('enVenta')}
              className={`px-4 py-2 rounded-lg transition ${
            filtroVenta === 'enVenta' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
            }`}
            >
              En venta
            </button>
            <button
              onClick={() => setFiltroVenta('noVenta')}
              className={`px-4 py-2 rounded-lg transition ${
            filtroVenta === 'noVenta' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
            }`}
            >
              No en venta
            </button>
          </div>

          

          {loading ? (
            <p className="text-center mt-10">Cargando obras...</p>
          ) : error ? (
            <p className="text-center text-red-500 mt-10">{error}</p>
          ) : obrasMostradas.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              No hay obras que coincidan con el filtro.
            </p>
          ) : (
            <ObrasGrid
              obras={obrasMostradas.map((obra) => ({
                ...obra,
                precio: Number(obra.precio),
              }))}
              slug="todas"
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
