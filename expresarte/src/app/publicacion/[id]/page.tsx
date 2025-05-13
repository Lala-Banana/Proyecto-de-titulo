'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
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
  const searchParams = useSearchParams();
  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idMatch = pathname.match(/\/publicacion\/(\d+)/);
  const obraId = idMatch ? idMatch[1] : null;

  const getValidToken = async (): Promise<string | null> => {
    let token = searchParams.get('token') || null;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }
    if (!token) {
      const session = await getSession();
      token = (session as any)?.access_token || null;
      if (token) localStorage.setItem('access_token', token);
    }
    return token;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!obraId) {
        setError('ID de obra inválido');
        setLoading(false);
        return;
      }

      const token = await getValidToken();
      if (!token) {
        setError('No hay token disponible. Inicia sesión.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8000/api/obras/${obraId}/`);
        if (res.status === 401) {
          setError('Token inválido o expirado.');
        } else if (!res.ok) {
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
  }, [obraId, searchParams]);

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
        <br />
        <br />
        <br />
        {/* Contenedor

    </div>

    // Contenedor principal
    <div className="bg-white mt-[30px]  text-gray-900 min-h-screen">
      <NavbarCombined />

      {/* Contenedor principal con margen top de 30px */}
        <div className="max-w-6xl mx-auto w-full  text-black   px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Columna de imagen principal */}
          <div className="lg:col-span-2 ">
            <div className="bg-white w-[400px] h-[400px] mx-auto flex items-center justify-center ">
              <Image
                src={obra.imagen_url}
                alt={obra.titulo}
                width={1080}
                height={1080}
                className="object-contain max-w-full max-h-full text-black  bg-white"
              />
            </div>

            {/* Imágenes adicionales debajo */}
            <div className="flex gap-4 mt-4 overflow-x-auto ">
              <Image src={obra.imagen_url} alt="mini" width={100} height={100} className="rounded object-cover" />
              <Image src={obra.imagen_url} alt="mini" width={100} height={100} className="rounded object-cover" />
              <Image src={obra.imagen_url} alt="mini" width={100} height={100} className="rounded object-cover" />
              <Image src={obra.imagen_url} alt="mini" width={100} height={100} className="rounded object-cover" />
            </div>

            {/* Otras obras del artista */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4 text-black " >Otras obras del artista</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <Image src={obra.imagen_url} alt="mini" width={100} height={100} className="rounded object-cover" />
                <Image src={obra.imagen_url} alt="mini" width={100} height={100} className="rounded object-cover" />
                <Image src={obra.imagen_url} alt="mini" width={100} height={100} className="rounded object-cover" />
                <Image src={obra.imagen_url} alt="mini" width={100} height={100} className="rounded object-cover" />
              </div>
            </div>
          </div>

          {/* Columna derecha - Info de la obra */}
          <div className="lg:col-span-1">
            <h1 className="text-3xl font-bold mb-4">{obra.titulo}</h1>
            <p className="mb-4 text-gray-700">{obra.descripcion}</p>

            {obra.en_venta ? (
              <p className="text-2xl font-semibold text-green-600 mb-4">${obra.precio}</p>
            ) : (
              <p className="text-xl font-semibold text-gray-500 mb-4">No está en venta</p>
            )}

            <div className="flex gap-4 mb-6">
              <button className="flex-1 bg-black text-white py-2 rounded">Comprar</button>
              <button className="flex-1 border border-black text-black py-2 rounded">Chat</button>
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
