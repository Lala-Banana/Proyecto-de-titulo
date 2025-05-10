'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
}

interface Props {
  slugCategoria: string;
  usuarioId: number;
  token: string | null;
}

export default function ObrasUsuario({ slugCategoria, usuarioId, token }: Props) {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchObras = async () => {
      if (!token) {
        setError('No se encontró el token de acceso.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/categorias/${slugCategoria}/?usuario_id=${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener las obras');
        }

        const data = await response.json();
        setObras(data);
        console.log('🖼️ Obras cargadas:', data);
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchObras();
  }, [slugCategoria, usuarioId, token]);

  const handleClickObra = (obraId: number) => {
    console.log(`🧭 Click en obra con ID: ${obraId}`);
    try {
      router.push(`/obra/${obraId}`);
       
    } catch (err) {
      console.error('❌ Error en router.push:', err);
    }
  };

  if (loading) return <p className="text-gray-600">Cargando tus obras...</p>;
  if (error) return <p className="text-red-600 font-semibold">⚠️ {error}</p>;
  if (obras.length === 0) return <p className="text-gray-500 italic">No has publicado ninguna obra en esta categoría.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tus Obras Publicadas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {obras.map((obra) => (
          <div
            key={obra.id}
            className="p-4 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition cursor-pointer"
            onClick={() => handleClickObra(obra.id)}
          >
            <img
              src={obra.imagen_url}
              alt={obra.titulo}
              className="w-full h-48 object-cover rounded-xl mb-3"
            />
            <h3 className="text-lg font-semibold truncate">{obra.titulo}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{obra.descripcion}</p>
            <p className="mt-2 text-green-600 font-bold">${obra.precio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
