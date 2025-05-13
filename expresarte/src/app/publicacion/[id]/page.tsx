'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: number;
  en_venta: boolean;
}

export default function ObraPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idMatch = pathname.match(/\/publicacion\/(\d+)/);
  const obraId = idMatch ? idMatch[1] : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!obraId) {
        setError('ID de obra inválido');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/api/obras/${obraId}/`);
        if (!res.ok) {
          const txt = await res.text();
          setError(`Error al cargar obra: ${txt}`);
        } else {
          setObra(await res.json());
        }
      } catch (err: any) {
        console.error(err);
        setError('Error de red al cargar la obra.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [obraId]);

  if (loading) return <p className="text-center mt-20">Cargando…</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;
  if (!obra) return <p className="text-center mt-20">Obra no encontrada.</p>;

  return (
    <div className="bg-white" style={{ minHeight: '100vh' }}>
      {/* Contenedor de la barra de navegación */}
      <div className="bg-white shadow">
        <NavbarCombined />
        <br />
        <br />
      </div>
       
    <div className="bg-white min-h-screen text-gray-900">
      <NavbarCombined />

      <div className="max-w-6xl mx-auto w-full mt-[30px] px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Columna de imagen principal */}
        <div className="lg:col-span-2">
          <div className="bg-white w-[400px] h-[400px] mx-auto flex items-center justify-center rounded-lg shadow">
            <Image
              src={obra.imagen_url}
              alt={obra.titulo}
              width={1080}
              height={1080}
              className="object-contain max-w-full max-h-full"
            />
          </div>

          <div className="flex gap-4 mt-4 overflow-x-auto">
            {[1, 2, 3, 4].map((_, i) => (
              <Image
                key={i}
                src={obra.imagen_url}
                alt={`mini-${i}`}
                width={100}
                height={100}
                className="rounded object-cover"
              />
            ))}
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-4">Otras obras del artista</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((_, i) => (
                <Image
                  key={i}
                  src={obra.imagen_url}
                  alt={`other-${i}`}
                  width={100}
                  height={100}
                  className="rounded object-cover"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha - Info de la obra */}
        <div className="lg:col-span-1 bg-white p-4 rounded shadow">
          <h1 className="text-3xl font-bold mb-4">{obra.titulo}</h1>
          <p className="mb-4 text-gray-700">{obra.descripcion}</p>

          {obra.en_venta ? (
            <p className="text-2xl font-semibold text-green-600 mb-4">${obra.precio}</p>
          ) : (
            <p className="text-xl font-semibold text-gray-500 mb-4">No está en venta</p>
          )}

          <div className="flex gap-4 mb-6">
            <button className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800">Comprar</button>
            <button className="flex-1 border border-black text-black py-2 rounded hover:bg-gray-100">Chat</button>
          </div>

          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-black transition"
          >
            ← Volver
          </button>
        </div>
      </div>

      <Footer />
    </div>
    </div>
  );
}
