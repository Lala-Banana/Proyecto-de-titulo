'use client';
import { useEffect, useState } from 'react';

interface Categoria {
  id: number;
  nombre: string;
}

interface Props {
  usuarioId: number;
  token: string;
  onObraCreada: () => void;
}

export default function AgregarObraModal({ usuarioId, token, onObraCreada }: Props) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [enVenta, setEnVenta] = useState(true);
  const [stock, setStock] = useState(1);
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);

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

    fetchCategorias();
  }, [token]);

  // ✅ Subida a Cloudinary
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo || !descripcion || !categoriaId || (enVenta && (!precio || !stock))) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    if (!imagenArchivo) {
      setError('Debes subir una imagen.');
      return;
    }

    try {
      const imagenUrl = await uploadImageToCloudinary(imagenArchivo);
      console.log('✅ Imagen subida a Cloudinary:', imagenUrl);

      const body = {
        titulo,
        descripcion,
        precio: enVenta ? precio : 0,
        imagen_url: imagenUrl,
        en_venta: enVenta,
        destacada: false,
        usuario: usuarioId,
        categoria: categoriaId,
        stock: enVenta ? stock : 1,
      };

      console.log('📦 Body enviado:', body);

      const res = await fetch('http://localhost:8000/api/obras/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const responseData = await res.json();
      console.log('📥 Backend respondió:', responseData);


      if (!res.ok) {
        throw new Error('Error al crear la obra');
      }

      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setPrecio('');
      setCategoriaId(null);
      setImagenArchivo(null);
      setEnVenta(true);
      setStock(1);
      onObraCreada();
      //window.location.reload();

    } catch (err) {
      console.error('❌ Error al subir imagen o guardar obra:', err);
      setError('No se pudo guardar la obra.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-md bg-white shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">Crear nueva obra</h2>

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

      {/* Imagen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de la obra</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImagenArchivo(e.target.files[0]);
            }
          }}
          required
        />
      </div>

      {/* Opciones de venta */}
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
                required
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
                required
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={() => onObraCreada()}
          className="text-sm text-gray-600 underline"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Guardar obra
        </button>
      </div>
    </form>
  );
}
