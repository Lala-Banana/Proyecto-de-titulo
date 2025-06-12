'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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

  // Aplicar filtro de venta
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
                filtroVenta === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroVenta('enVenta')}
              className={`px-4 py-2 rounded-lg transition ${
                filtroVenta === 'enVenta'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              En venta
            </button>
            <button
              onClick={() => setFiltroVenta('noVenta')}
              className={`px-4 py-2 rounded-lg transition ${
                filtroVenta === 'noVenta'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-black'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {obrasMostradas.map((obra) => (
                <div
                  key={obra.id}
                  className="group cursor-pointer border hover:scale-105 transition-transform duration-300 text-black border-gray-300 rounded-r-full"
                  onClick={() => router.push(`/publicaciones/${obra.id}`)}
                >
                  <div className="aspect-square overflow-hidden shadow-neutral-950">
                    <img
                      src={obra.imagen_url || '/default-image.jpg'}
                      alt={obra.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="max-h-34 overflow-hidden bg-white p-4">
                    <h2 className="text-lg font-bold mb-1">{obra.titulo}</h2>
                    <p className="text-sm mb-1">
                      Precio: ${Number(obra.precio).toLocaleString()}
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
      </main>
      <Footer />
    </>
  );
}
