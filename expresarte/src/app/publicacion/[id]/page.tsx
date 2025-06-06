'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import MostrarObra from '@/app/components/MostrarObra';

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
  destacada: boolean;
  categoria: number;
  usuario: number;
  stock: number;
  me_gusta?: number[];
}

export default function PublicacionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [obra, setObra] = useState<Obra | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [otherObras, setOtherObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obraId = pathname.split('/').pop();

  // ❤️ Estados Me gusta
  const [likesCount, setLikesCount] = useState<number>(0);
  const [likedByUser, setLikedByUser] = useState<boolean>(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // —————————————— FETCH Obra y Artista ——————————————
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

        // ❤️ Inicializar likes
        setLikesCount(obraData.me_gusta?.length || 0);

        // Fetch del Artista
        const userRes = await fetch(`http://localhost:8000/api/perfil-publico/${obraData.usuario}/`);
        if (userRes.ok) {
          const usuarioData: Usuario = await userRes.json();
          setUsuario(usuarioData);
        }

        // Otras obras
        const allRes = await fetch(`http://localhost:8000/api/obras/`);
        if (allRes.ok) {
          const todas: Obra[] = await allRes.json();
          const filtradas = todas.filter((o) => o.id !== obraData.id);
          const shuffled = filtradas.sort(() => Math.random() - 0.5);
          setOtherObras(shuffled.slice(0, 4));
        }
      } catch (err: any) {
        console.error(err);
        setError('No se pudo cargar la información.');
      } finally {
        setLoading(false);
      }
    })();
  }, [obraId, token]);

  // ❤️ Actualizar likedByUser cuando cambie obra
  useEffect(() => {
    if (obra && token) {
      const userId = JSON.parse(atob(token.split('.')[1])).user_id;
      setLikedByUser(obra.me_gusta ? obra.me_gusta.includes(userId) : false);
    }
  }, [obra, token]);

  // —————————————— ❤️ Toggle Me gusta ——————————————
  const handleToggleMeGusta = async () => {
    if (!token || !obra) {
      alert('Debes iniciar sesión para dar me gusta.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/obras/${obra.id}/toggle-me-gusta/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setLikedByUser(data.liked);
        setLikesCount(data.total_likes);
      } else {
        console.error('Error al dar me gusta', res.status);
      }
    } catch (err) {
      console.error('Error al enviar me gusta:', err);
    }
  };

  // —————————————— Función COMPRAR ——————————————
  async function handleComprar() {
    if (!obra) return;

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

  // —————————————— RENDER ——————————————
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

  // WhatsApp
  let telefonoParaWhatsapp = '';
  if (usuario?.telefono) {
    const soloDigitos = usuario.telefono.replace(/\D/g, '');
    telefonoParaWhatsapp = soloDigitos.startsWith('56')
      ? soloDigitos
      : `56${soloDigitos}`;
  }

  // —————————————— UI ——————————————
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarCombined />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ✅ Galería principal */}
          <section className="lg:col-span-2 space-y-6">
            <MostrarObra obra={obra} />
          </section>

          {/* Sidebar */}
          <aside className="space-y-2">
            <div className="bg-white p-4 rounded-xl shadow-lg space-y-4">
              <h1 className="text-2xl font-bold">{obra.titulo}</h1>
              <p className="text-gray-700">{obra.descripcion}</p>
              <p className="text-sm text-gray-600">Stock disponible: {obra.stock}</p>

              {/* ❤️ Me gusta */}
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={handleToggleMeGusta}
                  className="text-2xl focus:outline-none"
                  title={likedByUser ? 'Quitar me gusta' : 'Dar me gusta'}
                >
                  {likedByUser ? '❤️' : '🤍'}
                </button>
                <span className="text-sm text-gray-600">{likesCount} Me gusta</span>
              </div>

              {/* Precio y botón */}
              {obra.en_venta ? (
                <>
                  <p className="text-3xl font-semibold text-green-600">
                    ${Number(obra.precio).toLocaleString('es-CL')}
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

            {/* Artista */}
            {usuario && (
              <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                <h2 className="text-xl font-semibold mb-2">Artista</h2>
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
                  {usuario.telefono && (
                    <li>
                      <strong>Teléfono:</strong> {usuario.telefono}
                    </li>
                  )}
                </ul>
                <p className="mt-2 text-gray-600">{usuario.descripcion}</p>

                {/* Botones contacto */}
                <div className="mt-4 flex flex-col gap-2">
                  {usuario.email && (
                    <a
                      href={`mailto:${usuario.email}`}
                      className="w-full text-center bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm"
                    >
                      Enviar correo
                    </a>
                  )}
                  {usuario.telefono && (
                    <a
                      href={`https://wa.me/${telefonoParaWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-sm"
                    >
                      Enviar WhatsApp
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

        {/* Otras obras */}
        {otherObras.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Otras obras</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {otherObras.map((o) => (
                <Link
                  key={o.id}
                  href={`/publicacion/${o.id}`}
                  className="block group overflow-hidden rounded-lg bg-white transition-shadow shadow-sm hover:shadow-lg"
                >
                  {o.imagen_url ? (
                    <Image
                      src={o.imagen_url}
                      alt={o.titulo}
                      width={300}
                      height={300}
                      unoptimized
                      className="object-cover w-full h-40 transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      Sin imagen
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {o.titulo}
                    </p>
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
