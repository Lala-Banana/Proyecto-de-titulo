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

  // 📌 Log 1: Al cargar el componente
  console.log('🪪 [1] Token recibido como prop:', token);

  useEffect(() => {
    console.log('🪪 [2] Token dentro de useEffect:', token);

    const fetchCategorias = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categorias/');
        const data = await res.json();

        console.log('📦 Categorías recibidas:', data);

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

    // 📌 Log 3: Al iniciar handleSubmit
    console.log('🪪 [3] Token dentro de handleSubmit (inicio):', token);

    if (!token) {
      console.warn('❌ [4] Token está vacío o no definido');
      setError('No estás autenticado. Inicia sesión nuevamente.');
      return;
    }

    if (!titulo || !descripcion || !precio || !imagenUrl || !categoriaId) {
      setError('Todos los campos son obligatorios.');
      console.warn('⚠️ Formulario incompleto');
      return;
    }

    const body = {
      titulo,
      descripcion,
      precio,
      imagen_url: imagenUrl,
      en_venta: true,
      destacada: false,
      usuario: usuarioId,
      categoria: categoriaId,
    };

    console.log('📤 Enviando obra al backend...');
    console.log('🧾 Body:', body);
    console.log('🪪 [5] Token antes del fetch:', token);

    try {
      const res = await fetch('http://localhost:8000/api/obras/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      let responseData = null;
      try {
        responseData = await res.json();
      } catch {
        console.warn('⚠️ No se pudo parsear la respuesta del backend');
      }

      if (!res.ok) {
        console.error('❌ Error del backend:', responseData || 'Sin contenido');
        throw new Error('Error al crear la obra');
      }

      console.log('✅ Obra creada correctamente:', responseData);
      console.log('🪪 [6] Token usado exitosamente:', token);

      // limpiar campos
      setTitulo('');
      setDescripcion('');
      setPrecio('');
      setImagenUrl('');
      setCategoriaId(null);
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
        type="number"
        placeholder="Precio"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
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
