'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

type Obra = {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url: string | null;
  usuario: {
    nombre: string;
  };
};

export default function BuscarPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const router = useRouter();

  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchObras = async () => {
      if (!query) {
        setObras([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/obras/buscar/?search=${encodeURIComponent(query)}`
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }

        const data = await res.json();

        if (typeof data === 'string' && data.startsWith('<!DOCTYPE')) {
          throw new Error('Respuesta inesperada del servidor (HTML en lugar de JSON)');
        }

        setObras(data);
      } catch (err: any) {
        console.error('Error al buscar obras:', err);
        setError('Hubo un problema al buscar obras. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchObras();
  }, [query]);

  return (
    <>
      <NavbarCombined />
      <main className="pt-24 py-30 pb-16 bg-white min-h-screen flex flex-col items-center">
        <div className="w-full max-w-7xl px-4">
          <br />
          <h1 className="text-4xl font-serif italic font-bold tracking-wider text-black mb-6 text-center uppercase">
            Resultados para: "{query}"
          </h1>

          {loading ? (
            <p className="text-center mt-10">Cargando resultados...</p>
          ) : error ? (
            <p className="text-center text-red-500 mt-10">{error}</p>
          ) : obras.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              No se encontraron obras para esta búsqueda.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {obras.map((obra) => (
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
                    <p className="text-xs italic text-gray-400">Artista: {obra.usuario?.nombre}</p>
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
