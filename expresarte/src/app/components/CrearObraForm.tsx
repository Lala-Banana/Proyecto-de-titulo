'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


interface Categoria {
  id: number;
  nombre: string;
}

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  precio: number;
  en_venta: boolean;
  me_gusta?: number[];
}

interface Props {
  usuarioId: number;
  token: string;
  onObraCreada: () => void;
  obraInicial?: Obra;
}

export default function CrearObraForm({ usuarioId, token, onObraCreada, obraInicial }: Props) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [contentTypeObra, setContentTypeObra] = useState<number | null>(null);

  const [enVenta, setEnVenta] = useState(true);
  const [stock, setStock] = useState(1);
  const [imagenes, setImagenes] = useState<File[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (obraInicial) {
      setTitulo(obraInicial.titulo);
      setDescripcion(obraInicial.descripcion);
      setPrecio(String(obraInicial.precio));
      setEnVenta(obraInicial.en_venta);
      setStock(1);
    }
  }, [obraInicial]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categorias/');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategorias(data);
        } else if (Array.isArray(data.categorias)) {
          setCategorias(data.categorias);
        } else {
          setError('No se pudieron cargar las categorías.');
        }
      } catch (err) {
        setError('Error al conectar con el servidor.');
      }
    };

    const fetchContentTypeObra = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/obra-content-type/');
        const data = await res.json();
        setContentTypeObra(data.content_type_id);
      } catch (err) {
        console.error('Error al obtener content type de Obra:', err);
      }
    };

    fetchCategorias();
    fetchContentTypeObra();
  }, [token]);

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'expresarte_preset');

    const res = await fetch('https://api.cloudinary.com/v1_1/drb5jrimz/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Error al subir imagen');
    }

    return data.secure_url;
  };

  const handleDelete = async () => {
    if (!obraInicial) return;
    const confirm = window.confirm('¿Estás seguro de que deseas eliminar esta obra?');
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:8000/api/obras/${obraInicial.id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al eliminar la obra');
      onObraCreada();
      window.location.reload();
    } catch (err) {
      console.error('❌ Error al eliminar obra:', err);
      setError('No se pudo eliminar la obra.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo || !descripcion || !categoriaId) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    if (enVenta && (!precio || Number(precio) <= 0 || !stock || stock <= 0)) {
      setError('Completa precio y stock válidos.');
      return;
    }

    try {
      const bodyObra = {
        titulo,
        descripcion,
        precio: enVenta ? precio : 0,
        imagen_url: obraInicial?.imagen_url || '',
        en_venta: enVenta,
        destacada: false,
        usuario: usuarioId,
        categoria: categoriaId,
        stock: enVenta ? stock : 1,
      };

      const url = obraInicial
        ? `http://localhost:8000/api/obras/${obraInicial.id}/`
        : 'http://localhost:8000/api/obras/';
      const method = obraInicial ? 'PUT' : 'POST';

      const resObra = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyObra),
      });

      const nuevaObra = await resObra.json();
      if (!resObra.ok) throw new Error('Error al guardar la obra');

      if (!obraInicial && imagenes.length > 0) {
        const urlsSubidas = await Promise.all(
          imagenes.map(async (imagen) => {
            const imagenUrl = await uploadImageToCloudinary(imagen);
            if (contentTypeObra) {
              await fetch('http://localhost:8000/api/photos/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  content_type: contentTypeObra,
                  object_id: nuevaObra.id,
                  url: imagenUrl,
                }),
              });
            }
            return imagenUrl;
          })
        );

        if (urlsSubidas.length > 0) {
          await fetch(`http://localhost:8000/api/obras/${nuevaObra.id}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              imagen_url: urlsSubidas[0],
            }),
          });
        }
      }

      setTitulo('');
      setDescripcion('');
      setPrecio('');
      setCategoriaId(null);
      setImagenes([]);
      setEnVenta(true);
      setStock(1);
      onObraCreada();
      if (!obraInicial) {
        window.location.reload();
      }
    } catch (err) {
      console.error('❌ Error al guardar obra:', err);
      setError('No se pudo guardar la obra.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-md bg-white shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">
        {obraInicial ? 'Editar obra' : 'Crear nueva obra'}
      </h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full px-3 py-2 border rounded text-black"
        required
      />

      <textarea
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="w-full px-3 py-2 border rounded text-black"
        required
      />

      <select
        value={categoriaId ?? ''}
        onChange={(e) => setCategoriaId(Number(e.target.value))}
        className="w-full px-3 py-2 border rounded text-black"
        required
      >
        <option value="">Selecciona una categoría</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>

      {!obraInicial && (
        <div>
          <label className="block text-sm font-medium text-black mb-1">Imágenes</label>
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
                required
              />
            </label>
            <span className="text-black text-sm">
              {imagenes.length > 0
                ? `${imagenes.length} archivo(s) seleccionado(s)`
                : 'Ningún archivo seleccionado'}
            </span>
          </div>
        </div>
      )}

      {obraInicial && obraInicial.imagen_url && (
        <div className="mb-4">
          <p className="text-sm font-medium text-black mb-1">Imagen actual:</p>
          <img
            src={obraInicial.imagen_url}
            alt="Imagen actual"
            className="w-full h-40 object-cover rounded border"
          />
        </div>
      )}

      <div className="mt-4 space-y-2">
        <p className="font-semibold text-gray-800 text-center">Opciones de venta</p>
        <div className="flex justify-center items-center space-x-2">
          <input
            type="checkbox"
            checked={enVenta}
            onChange={(e) => setEnVenta(e.target.checked)}
            className="form-checkbox h-5 w-5 text-black"
            id="venta-checkbox"
          />
          <label htmlFor="venta-checkbox" className="text-sm font-medium text-black">
            ¿Está en venta?
          </label>
        </div>

        {enVenta && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                placeholder="Precio"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full px-3 py-2 border rounded text-black"
                min={0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock disponible</label>
              <input
                type="number"
                placeholder="Cantidad disponible"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded text-black"
                min={1}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between mt-4">
        {obraInicial && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-red-600 underline"
          >
            Eliminar obra
          </button>
        )}
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          {obraInicial ? 'Actualizar obra' : 'Agregar obra'}
        </button>
      </div>
    </form>
  );
}
