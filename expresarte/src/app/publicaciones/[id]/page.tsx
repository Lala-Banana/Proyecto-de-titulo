"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NavbarCombined from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import MostrarObra from "@/app/components/MostrarObra";

const BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(
  /\/+$/,
  ""
);
const PAYMENT_URL = (process.env.NEXT_PUBLIC_NGROK_URL ?? "").replace(
  /\/+$/,
  ""
);

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  rut: string;
  region: string;
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

  const [likesCount, setLikesCount] = useState(0);
  const [likedByUser, setLikedByUser] = useState(false);
  const [cantidad, setCantidad] = useState(1);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const obraId = pathname.split("/").pop();

  useEffect(() => {
    (async () => {
      if (!obraId) {
        setError("ID de obra inválido");
        setLoading(false);
        return;
      }
      try {
        // Traer datos de la obra
        const res = await fetch(`${BASE_URL}/api/obras/${obraId}/`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const obraData: Obra = await res.json();
        setObra(obraData);
        setLikesCount(obraData.me_gusta?.length ?? 0);

        // Traer datos del artista
        const userRes = await fetch(
          `${BASE_URL}/api/perfil-publico/${obraData.usuario}/`
        );
        if (userRes.ok) {
          setUsuario(await userRes.json());
        }

        // Traer otras obras
        const allRes = await fetch(`${BASE_URL}/api/obras/`);
        if (allRes.ok) {
          const todas: Obra[] = await allRes.json();
          const filtradas = todas.filter((o) => o.id !== obraData.id);
          setOtherObras(filtradas.sort(() => Math.random() - 0.5).slice(0, 4));
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("No se pudo cargar la información. Ver consola.");
      } finally {
        setLoading(false);
      }
    })();
  }, [obraId]);

  useEffect(() => {
    if (obra && token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setLikedByUser(obra.me_gusta?.includes(payload.user_id) ?? false);
      } catch {
        setLikedByUser(false);
      }
    }
  }, [obra, token]);

  const handleToggleMeGusta = async () => {
    if (!token || !obra) {
      alert("Debes iniciar sesión para dar me gusta.");
      return;
    }
    try {
      const res = await fetch(
        `${BASE_URL}/api/obras/${obra.id}/toggle-me-gusta/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setLikedByUser(data.liked);
        setLikesCount(data.total_likes);
      } else {
        console.error("Error al dar me gusta", res.status);
      }
    } catch (err) {
      console.error("Error al enviar me gusta:", err);
    }
  };

  async function handleComprar() {
    if (!obra) return;
    if (cantidad < 1 || cantidad > obra.stock) {
      alert("Cantidad inválida");
      return;
    }
    try {
      const endpoint = `${PAYMENT_URL}/api/pagos/crear-preferencia-prod/`;
      const body = { obra_id: obra.id, cantidad };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Si sale bien (200 o 201), abrimos el init_point y programamos el descuento en 1 minuto
      if (res.ok && (res.status === 200 || res.status === 201)) {
        const { init_point } = await res.json();
        if (init_point) window.open(init_point, "_blank");
        else {
          console.error("No se recibió init_point:", init_point);
          alert("No pudimos obtener la URL de MercadoPago.");
        }

        // Aquí esperas 60 000 ms (1 min) antes de descontar el stock en la UI
        setTimeout(() => {
          setObra((prev) => {
            if (!prev) return prev;
            return { ...prev, stock: prev.stock - cantidad };
          });
        }, 10_000);

        return;
      }

      // Si la respuesta no es exitosa, mostramos el error y no tocamos el stock
      const text = await res.text();
      console.error("Error en crear_preferencia:", res.status, text);
      alert("Hubo un problema al generar el pago. Revisa la consola.");
    } catch (err) {
      console.error("Excepción en handleComprar:", err);
      alert("Error inesperado. Mira la consola.");
    }
  }

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

  // Formateo de WhatsApp
  let telefonoParaWhatsapp = "";
  if (usuario?.telefono) {
    const soloDigitos = usuario.telefono.replace(/\D/g, "");
    telefonoParaWhatsapp = soloDigitos.startsWith("56")
      ? soloDigitos
      : `56${soloDigitos}`;
  }

  return (
    <div className="flex flex-col capitalize min-h-screen bg-gray-100">
      <NavbarCombined />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <MostrarObra obra={obra} />
          </section>

          <aside className="space-y-2">
            <div className="bg-white p-4 rounded-xl shadow-lg space-y-4">
              <h1 className="text-4xl text-black font-bold">{obra.titulo}</h1>
              <p className="text-1xl text-gray-900">{obra.descripcion}</p>

              {obra.en_venta === true && (
                <p className="text-2xl text-gray-900">
                  Stock disponible: {obra.stock}
                </p>
              )}

              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={handleToggleMeGusta}
                  className="text-2xl focus:outline-none"
                  title={likedByUser ? "Quitar me gusta" : "Dar me gusta"}
                >
                  {likedByUser ? "❤️" : "🤍"}
                </button>
                <span className="text-1xl text-gray-600">
                  {likesCount} Me gusta
                </span>
              </div>

              {obra.en_venta ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm text-black font-medium mb-1">
                      Cantidad:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={obra.stock}
                      value={cantidad}
                      onChange={(e) => setCantidad(Number(e.target.value))}
                      className="w-20 text-black p-2 border rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      / {obra.stock} disponibles 
                    </span>
                  </div>
                  <p className="text-3xl font-semibold text-gray-900 mb-4">
                    ${(obra.precio * cantidad).toLocaleString("es-CL")}
                  </p>
                  <button
                    onClick={handleComprar}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  >
                    Comprar {cantidad}
                  </button>
                </>
              ) : (
                <span className="inline-block px-3 py-2 bg-gray-200 rounded-full text-gray-600">
                  No en venta
                </span>
              )}
            </div>

            {usuario && (
              <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                <h2 className="text-2xl text-black font-semibold mb-2">
                  Artista
                </h2>
                <div className="flex items-center space-x-4 mb-4">
                  <Image
                    src={usuario.foto_url || "/default-avatar.png"}
                    alt={usuario.nombre}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <Link
                      href={`/usuarios/${usuario.id}`}
                      className="text-lg font-medium text-gray-900 hover:underline"
                    >
                      {usuario.nombre}
                    </Link>
                    <p className="text-gray-500 text-sm">{usuario.email}</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>
                    <strong>Region:</strong> {usuario.region}
                  </li>
                  {usuario.telefono && (
                    <li>
                      <strong>Teléfono:</strong> {usuario.telefono}
                    </li>
                  )}
                </ul>
                <p className="mt-2 text-gray-600">{usuario.descripcion}</p>
                <div className="mt-4 flex flex-col gap-2">
                  {usuario.email && (
                    <a
                      href={`mailto:${usuario.email}`}
                      className="w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-green-600 transition text-sm"
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
              className="w-full text-center text-black py-2 rounded border border-gray-300 hover:bg-gray-300 transition"
            >
              ← Volver
            </button>
          </aside>
        </div>

        {otherObras.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Otras obras</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {otherObras.map((o) => (
                <Link
                  key={o.id}
                  href={`/publicaciones/${o.id}`}
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
