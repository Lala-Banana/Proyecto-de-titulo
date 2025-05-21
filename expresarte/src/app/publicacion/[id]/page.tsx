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
  const [related, setRelated] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obraId = pathname.split('/').pop();

  // Fetch obra and usuario
  useEffect(() => {
    (async () => {
      if (!obraId) {
        setError('ID de obra inválido');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:8000/api/obras/${obraId}/`);
        if (!res.ok) throw new Error(await res.text());
        const obraData: Obra = await res.json();
        setObra(obraData);

        // fetch usuario
        const userRes = await fetch(
          `http://localhost:8000/api/perfil-publico/${obraData.usuario}/`
        );
        if (userRes.ok) {
          const usuarioData: Usuario = await userRes.json();
          setUsuario(usuarioData);
        }

        // fetch related by same category
        const relRes = await fetch(
          `http://localhost:8000/api/obras/?categoria=${obraData.categoria_slug}`
        );
        if (relRes.ok) {
          let relList: Obra[] = await relRes.json();
          relList = relList.filter(o => o.id !== obraData.id);
          // shuffle
          relList.sort(() => 0.5 - Math.random());
          setRelated(relList.slice(0, 10));
        }
      } catch (err: any) {
        console.error(err);
        setError('No se pudo cargar la obra.');
      } finally {
        setLoading(false);
      }
    })();
  }, [obraId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">Cargando…</div>
    );
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarCombined />

      <main className="flex-grow container mx-auto px-4 py-8">
        <br />
        <br />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Galería principal con full-HD scaled */}
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
            <div className="flex space-x-20 overflow-x-auto">
              {Array(5)
                .fill(obra.imagen_url)
                .map((src, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden shadow-sm bg-white"
                  >
                    <Image
                      src={src}
                      alt={`${obra.titulo} mini ${i}`}
                      width={112}
                      height={212}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </section>

          {/* Sidebar info sobre obra y artista */}
          <aside className="space-y-2">
            <div className="bg-white p-3 rounded-xl shadow-lg space-y-4">
              <h1 className="text-2xl font-bold">{obra.titulo}</h1>
              <p className="text-gray-700">{obra.descripcion}</p>
              {obra.en_venta ? (
                <p className="text-3xl font-semibold text-green-600">
                  ${obra.precio}
                </p>
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
                <div className="mt-6 space-y-2">
                  <a
                    href={`mailto:${usuario.email}`}
                    className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Enviar correo
                  </a>
                  {usuario.telefono && (
                    <a
                      href={`https://api.whatsapp.com/send?phone=${usuario.telefono}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-green-500 text-white py-2 rounded hover:bg-green-600"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
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

        {/* Sección de obras relacionadas */}
        {related.length > 0 && (
          <section className="mt-5">
            <h3 className="text-xl font-semibold mb-2">Obras en la misma categoría</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-10">
              {related.map(o => (
                <Link key={o.id} href={`/publicacion/${o.id}`}>
                  <div className="bg-white text-black border-b-black rounded-lg overflow-hidden shadow hover:shadow-md transition">
                    <Image
                      src={o.imagen_url}
                      alt={o.titulo}
                      width={300}
                      height={300}
                      className="w-full h-24 object-cover"
                    />
                    <p className="text-sm p-2 truncate">{o.titulo}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}