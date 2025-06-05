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
  const [contentTypeObra, setContentTypeObra] = useState<number | null>(null);

  const [enVenta, setEnVenta] = useState(true);
  const [stock, setStock] = useState(1);
  const [imagenes, setImagenes] = useState<File[]>([]);

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
        console.log('✅ ContentType Obra:', data.content_type_id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación general
    if (!titulo || !descripcion || !categoriaId) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    // Validación precio / stock si es venta
    if (enVenta) {
      if (!precio || Number(precio) <= 0 || !stock || stock <= 0) {
        setError('Completa precio y stock válidos.');
        return;
      }
    }

    // Validación imágenes
    if (imagenes.length === 0) {
      setError('Debes subir al menos una imagen.');
      return;
    }

    try {
      // Crear la obra primero
      const bodyObra = {
        titulo,
        descripcion,
        precio: enVenta ? precio : 0,
        imagen_url: '',
        en_venta: enVenta,
        destacada: false,
        usuario: usuarioId,
        categoria: categoriaId,
        stock: enVenta ? stock : 1,
      };

      const resObra = await fetch('http://localhost:8000/api/obras/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyObra),
      });

      const nuevaObra = await resObra.json();

      if (!resObra.ok) {
        throw new Error('Error al crear la obra');
      }

      console.log('✅ Obra creada:', nuevaObra);

      // Subir imágenes en paralelo
      const urlsSubidas = await Promise.all(
        imagenes.map(async (imagen) => {
          const imagenUrl = await uploadImageToCloudinary(imagen);
          console.log('✅ Imagen subida:', imagenUrl);

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

            console.log('📸 Photo asociada a obra:', imagenUrl);
          } else {
            console.error('❌ No se pudo asociar foto: contentTypeObra es null');
          }

          return imagenUrl; // para actualizar imagen_url después
        })
      );

      // Actualizar imagen_url de la obra con la primera
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

        console.log('🖼️ imagen_url de obra actualizado:', urlsSubidas[0]);
      }

      // Limpiar formulario
      setTitulo('');
      setDescripcion('');
      setPrecio('');
      setCategoriaId(null);
      setImagenes([]);
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

      {/* Imágenes */}
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

        {/* PREVIEW de imágenes */}
        {imagenes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {imagenes.map((img, index) => {
              const url = URL.createObjectURL(img);
              return (
                <div key={index} className="relative border rounded overflow-hidden">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                </div>
              );
            })}
          </div>
        )}
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
