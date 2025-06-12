"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchConAuth } from "@/lib/auth";

interface Usuario {
  id: number;
  nombre: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  precio: string;
  en_venta: boolean;
  imagen_url: string;
  categoria: number;
  stock: number;
  usuario: Usuario;
}

export default function ObrasAdminPage() {
  const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const [obras, setObras] = useState<Obra[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [contentTypeObra, setContentTypeObra] = useState<number | null>(null);

  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [imagenes, setImagenes] = useState<File[]>([]);

  const [enVenta, setEnVenta] = useState(true);
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState(1);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const router = useRouter();

  const getToken = () => localStorage.getItem("access_token") ?? "";

  const fetchObras = async () => {
    const token = getToken();
    const data = await fetchConAuth(
      `${BASE}/api/admin/obras/`,
      token,
      setError
    );
    if (data && Array.isArray(data)) setObras(data);
  };

  const fetchUsuarios = async () => {
    const token = getToken();
    const res = await fetch(`${BASE}/api/admin/usuarios/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (Array.isArray(data)) setUsuarios(data);
  };

  const fetchCategorias = async () => {
    const res = await fetch(`${BASE}/api/categorias/`);
    const data = await res.json();
    if (Array.isArray(data)) setCategorias(data);
  };

  const fetchContentTypeObra = async () => {
    try {
      const res = await fetch(`${BASE}/api/obra-content-type/`);
      const data = await res.json();
      setContentTypeObra(data.content_type_id);
    } catch (err) {
      console.error("Error al obtener content type de Obra:", err);
    }
  };

  useEffect(() => {
    fetchObras();
    fetchUsuarios();
    fetchCategorias();
    fetchContentTypeObra();
  }, []);

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "expresarte_preset");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/drb5jrimz/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Error al subir imagen");
    }

    return data.secure_url;
  };

  const guardarObra = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getToken();
    if (!token) {
      setError("🔐 No tienes permiso.");
      return;
    }

    // Validaciones
    if (!titulo || !descripcion || !categoriaId || !usuarioId) {
      setError("⚠️ Completa todos los campos requeridos.");
      return;
    }

    if (enVenta && (!precio || Number(precio) <= 0 || !stock || stock <= 0)) {
      setError("⚠️ Completa precio y stock válidos.");
      return;
    }

    if (imagenes.length === 0) {
      setError("⚠️ Debes subir al menos una imagen.");
      return;
    }

    try {
      // Crear obra
      const bodyObra = {
        titulo,
        descripcion,
        precio: enVenta ? precio : "0",
        imagen_url: "",
        en_venta: enVenta,
        destacada: false,
        usuario: usuarioId,
        categoria: categoriaId,
        stock: enVenta ? stock : 1,
      };

      const url = editandoId
        ? `${BASE}/api/admin/obras/${editandoId}/`
        : `${BASE}/api/admin/obras/`;
      const method = editandoId ? "PUT" : "POST";

      const resObra = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyObra),
      });

      const nuevaObra = await resObra.json();
      if (!resObra.ok) throw new Error("Error al crear/editar obra");

      // Subir imágenes
      const urlsSubidas = await Promise.all(
        imagenes.map(async (img) => {
          const url = await uploadImageToCloudinary(img);

          if (contentTypeObra) {
            await fetch(`${BASE}/api/photos/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                content_type: contentTypeObra,
                object_id: nuevaObra.id,
                url: url,
              }),
            });
          }

          return url;
        })
      );

      // Actualizar imagen_url principal
      if (urlsSubidas.length > 0) {
        await fetch(`${BASE}/api/admin/obras/${nuevaObra.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imagen_url: urlsSubidas[0],
          }),
        });
      }

      // Limpiar form
      setTitulo("");
      setDescripcion("");
      setCategoriaId(null);
      setUsuarioId(null);
      setImagenes([]);
      setEnVenta(true);
      setPrecio("");
      setStock(1);
      setEditandoId(null);

      fetchObras();

      setMensaje(editandoId ? "✅ Obra actualizada" : "✅ Obra creada");
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      console.error("❌ Error al guardar obra:", err);
      setError("❌ No se pudo guardar la obra.");
    }
  };

  const editarObra = (obra: Obra) => {
    setTitulo(obra.titulo);
    setDescripcion(obra.descripcion);
    setCategoriaId(obra.categoria);
    setUsuarioId(obra.usuario.id);
    setPrecio(obra.precio);
    setStock(obra.stock);
    setEnVenta(obra.en_venta);
    setImagenes([]);
    setEditandoId(obra.id);
  };

  const eliminarObra = async (id: number) => {
    if (!confirm("¿Eliminar esta obra?")) return;
    const token = getToken();
    await fetch(`${BASE}/api/admin/obras/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchObras();
    setMensaje("🗑️ Obra eliminada exitosamente.");
    setTimeout(() => setMensaje(null), 3000);
  };

  const irADetalle = (obraId: number) => {
    router.push(`/publicaciones/${obraId}`);
  };

  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen text-black">
        <div className="bg-red-100 text-red-800 p-4 rounded shadow">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-20 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">Obras</h2>

      {mensaje && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow">
          {mensaje}
        </div>
      )}

      <form
        onSubmit={guardarObra}
        className="space-y-4 bg-gray-100 p-4 rounded mb-8"
      >
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full p-2 rounded border"
          required
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 rounded border"
          required
        />

        <select
          value={categoriaId ?? ""}
          onChange={(e) => setCategoriaId(Number(e.target.value))}
          className="w-full p-2 rounded border"
          required
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <select
          value={usuarioId ?? ""}
          onChange={(e) => setUsuarioId(Number(e.target.value))}
          className="w-full p-2 rounded border"
          required
        >
          <option value="">Selecciona un usuario</option>
          {usuarios.map((user) => (
            <option key={user.id} value={user.id}>
              {user.id} - {user.nombre}
            </option>
          ))}
        </select>

        {/* Imágenes */}
        <div>
          <label className="block mb-1 font-medium">Imágenes</label>
          <div className="flex items-center space-x-4 mb-2">
            <label className="bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-800 transition">
              Elegir archivos
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setImagenes(Array.from(e.target.files));
                  }
                }}
                required={editandoId === null}
              />
            </label>
            <span className="text-black text-sm">
              {imagenes.length > 0
                ? `${imagenes.length} archivo(s) seleccionado(s)`
                : "Ningún archivo seleccionado"}
            </span>
          </div>
        </div>

        {/* En venta */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enVenta}
            onChange={(e) => setEnVenta(e.target.checked)}
          />
          En venta
        </label>

        {enVenta && (
          <>
            <input
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full p-2 rounded border"
              min={0}
            />
            <input
              type="number"
              placeholder="Stock disponible"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full p-2 rounded border"
              min={1}
            />
          </>
        )}

        {/* BOTONES */}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => {
              setTitulo("");
              setDescripcion("");
              setCategoriaId(null);
              setUsuarioId(null);
              setImagenes([]);
              setEnVenta(true);
              setPrecio("");
              setStock(1);
              setEditandoId(null);
              setError(null);
            }}
            className="text-sm text-gray-600 underline"
          >
            Limpiar
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {editandoId ? "Actualizar" : "Agregar"} Obra
          </button>
        </div>
      </form>

      {/* Tabla */}
      <table className="w-full text-left bg-gray-100 rounded-lg overflow-hidden">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Imagen</th>
            <th className="p-3">Título</th>
            <th className="p-3">Usuario</th>
            <th className="p-3">Precio</th>
            <th className="p-3">Stock</th>
            <th className="p-3">En venta</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {obras.map((obra) => (
            <tr key={obra.id} className="border-b border-gray-300">
              <td className="p-3">{obra.id}</td>
              <td className="p-3">
                {obra.imagen_url ? (
                  <Image
                    src={obra.imagen_url}
                    alt={obra.titulo}
                    width={60}
                    height={60}
                    className="rounded cursor-pointer object-cover"
                    onClick={() => irADetalle(obra.id)}
                  />
                ) : (
                  <span className="text-gray-400">Sin imagen</span>
                )}
              </td>
              <td className="p-3">{obra.titulo}</td>
              <td className="p-3">
                {obra.usuario && typeof obra.usuario === "object" ? (
                  <>
                    <span className="font-semibold">ID:</span> {obra.usuario.id}
                    <br />
                    <span className="font-semibold">Nombre:</span>{" "}
                    {obra.usuario.nombre}
                  </>
                ) : (
                  (() => {
                    const userId =
                      typeof obra.usuario === "number" ? obra.usuario : NaN;
                    const user = usuarios.find((u) => u.id === userId);
                    return user ? (
                      <>
                        <span className="font-semibold">ID:</span> {user.id}
                        <br />
                        <span className="font-semibold">Nombre:</span>{" "}
                        {user.nombre}
                      </>
                    ) : (
                      <span className="text-gray-400">Sin usuario</span>
                    );
                  })()
                )}
              </td>

              <td className="p-3">${obra.precio}</td>
              <td className="p-3">{obra.stock}</td>
              <td className="p-3">{obra.en_venta ? "✅" : "❌"}</td>
              <td className="p-3 flex gap-2">
                <button
                  onClick={() => editarObra(obra)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarObra(obra.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
