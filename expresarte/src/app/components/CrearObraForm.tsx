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
  const [imagenUrl, setImagenUrl] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [enVenta, setEnVenta] = useState(true);
  const [stock, setStock] = useState(1);

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
          console.error('⚠️ Formato inesperado de categorías:', data);
          setError('No se pudieron cargar las categorías.');
        }
      } catch (err) {
        console.error('❌ Error al cargar categorías:', err);
        setError('Error al conectar con el servidor.');
      }
    };

    fetchCategorias();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('No estás autenticado. Inicia sesión nuevamente.');
      return;
    }

    if (!titulo || !descripcion || !imagenUrl || !categoriaId || (enVenta && !precio)) {
      setError('Todos los campos obligatorios deben completarse.');
      return;
    }

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

    try {
      const res = await fetch('http://localhost:8000/api/obras/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const responseData = await res.json();

      if (!res.ok) {
        console.error('❌ Error del backend:', responseData);
        throw new Error('Error al crear la obra');
      }

      // limpiar campos
      setTitulo('');
      setDescripcion('');
      setPrecio('');
      setImagenUrl('');
      setCategoriaId(null);
      setEnVenta(true);
      setStock(1);
      onObraCreada();
      window.location.reload();
    } catch (err) {
      console.error('❌ Error al guardar obra:', err);
      setError('No se pudo guardar la obra. Revisa los campos y vuelve a intentarlo.');
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

      <input
        type="text"
        placeholder="URL de la imagen"
        value={imagenUrl}
        onChange={(e) => setImagenUrl(e.target.value)}
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

      {/* Sección de venta */}
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
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
                Precio
              </label>
              <input
                id="precio"
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
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock disponible
              </label>
              <input
                id="stock"
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
