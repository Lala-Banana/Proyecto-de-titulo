'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
}

export default function ObrasGeneralesPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchObras = async () => {
      const token = localStorage.getItem('access_token'); // si la API requiere auth
      try {
        const res = await fetch(`http://localhost:8000/api/obras/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al cargar las obras');

        const data = await res.json();
        setObras(data);
      } catch (err: any) {
        setError(err.message || 'Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchObras();
  }, []);

  if (loading) return <p className="text-center mt-20">Cargando obras...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">⚠️ {error}</p>;
  if (obras.length === 0) return <p className="text-center mt-20 text-gray-500">No hay obras disponibles.</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Todas las obras</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {obras.map((obra) => (
          <div
            key={obra.id}
            className="bg-white rounded shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => router.push(`/obra/${obra.id}`)}
          >
            <img
              src={obra.imagen_url}
              alt={obra.titulo}
              className="w-full h-48 object-cover rounded-t"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold">{obra.titulo}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{obra.descripcion}</p>
              <p className="mt-2 text-green-600 font-bold">${obra.precio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
