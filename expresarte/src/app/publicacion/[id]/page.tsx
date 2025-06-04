'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  rut: string;
  ubicacion: string;
  descripcion: string;
  foto_url?: string;
}

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: number;
  en_venta: boolean;
  usuario: number;
  categoria_slug: string;
}

export default function PublicacionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [obra, setObra] = useState<Obra | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obraId = pathname.split('/').pop();

  // ——————————————
  // 1) Fetch de la obra y el artista (localhost)
  // ——————————————
  useEffect(() => {
    (async () => {
      if (!obraId) {
        setError('ID de obra inválido');
        setLoading(false);
        return;
      }
      try {
        // Traer datos de la obra desde tu API local
        const res = await fetch(`http://localhost:8000/api/obras/${obraId}/`);
        if (!res.ok) throw new Error(await res.text());
        const obraData: Obra = await res.json();
        setObra(obraData);

        // Traer perfil público del artista (localhost)
        const userRes = await fetch(
          `http://localhost:8000/api/perfil-publico/${obraData.usuario}/`
        );
        if (userRes.ok) {
          const usuarioData: Usuario = await userRes.json();
          setUsuario(usuarioData);
        }
      } catch (err: any) {
        console.error(err);
        setError('No se pudo cargar la obra.');
      } finally {
        setLoading(false);
      }
    })();
  }, [obraId]);


  // ———————————————————————————————
  // 2) Función para generar la preferencia (solo aquí usamos Ngrok)
  // ———————————————————————————————
  async function handleComprar() {
    if (!obra) return;

    // Verifica en consola que la variable exista
    console.log('Ngrok URL:', process.env.NEXT_PUBLIC_NGROK_URL);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NGROK_URL}/api/pagos/crear-preferencia-prod/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ obra_id: obra.id }),
        }
      );

      if (!res.ok) {
        const textoError = await res.text();
        console.error('Error en crear_preferencia:', textoError);
        return;
      }

      const { init_point } = await res.json();
      if (init_point) {
        window.open(init_point, '_blank');
      } else {
        console.error('No se recibió init_point:', init_point);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ——————————————
  // 3) Renderizado condicional
  // ——————————————
  if (loading)
    return <div className="flex items-center justify-center h-screen">Cargando…</div>;
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );
  if (!obra)
    return (
      <div className="flex items-center justify-center h-screen">
        Obra no encontrada.
      </div>
    );

  // ——————————————
  // 4) UI de la página
  // ——————————————
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarCombined />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galería principal */}
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-xl overflow-hidden shadow-lg bg-white">
              {obra.imagen_url ? (
                <Image
                  src={obra.imagen_url}
                  alt={obra.titulo}
                  width={500}
                  height={300}
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  Sin imagen disponible
                </div>
              )}
            </div>
          </section>

          {/* Sidebar con info y botón “Comprar” */}
          <aside className="space-y-2">
            <div className="bg-white p-3 rounded-xl shadow-lg space-y-4">
              <h1 className="text-2xl font-bold">{obra.titulo}</h1>
              <p className="text-gray-700">{obra.descripcion}</p>
              {obra.en_venta ? (
                <>
                  <p className="text-3xl font-semibold text-green-600">
                    ${obra.precio}
                  </p>
                  <button
                    onClick={handleComprar}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  >
                    Comprar ahora
                  </button>
                </>
              ) : (
                <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-gray-600">
                  No en venta
                </span>
              )}
            </div>

            {usuario && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Artista</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <Image
                    src={usuario.foto_url || '/default-avatar.png'}
                    alt={usuario.nombre}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <Link
                      href={`/usuarios/${usuario.id}`}
                      className="text-lg font-medium text-blue-600 hover:underline"
                    >
                      {usuario.nombre}
                    </Link>
                    <p className="text-gray-500 text-sm">{usuario.email}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>
                    <strong>RUT:</strong> {usuario.rut}
                  </li>
                  <li>
                    <strong>Ubicación:</strong> {usuario.ubicacion}
                  </li>
                </ul>
                <p className="mt-4 text-gray-600">{usuario.descripcion}</p>
              </div>
            )}

            <button
              onClick={() => router.back()}
              className="w-full text-center py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
            >
              ← Volver
            </button>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
