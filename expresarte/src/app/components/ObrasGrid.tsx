'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
}

interface Props {
  obras: Obra[];
  slug: string;
  columnas?: number; // 🆕 Nueva prop opcional
}

export default function ObrasGrid({ obras, slug, columnas = 4 }: Props) {
  const router = useRouter();

  const handleClickObra = useCallback(
    (obraId: number) => {
      router.push(`/publicacion/${obraId}`);
    },
    [router, slug]
  );

  if (!obras || obras.length === 0) {
    return <p className="text-center text-gray-600 mt-8">No hay obras disponibles para mostrar.</p>;
  }

  // Generar clases dinámicamente
  const gridColsClass = `grid-cols-1 sm:grid-cols-2 md:grid-cols-${columnas}`;

  return (
    <div className={`grid ${gridColsClass} gap-6 mt-6 justify-items-center`}>
      {obras.map((obra) => (
        <div
          key={obra.id}
          onClick={() => handleClickObra(obra.id)}
          className="relative bg-gray-100 rounded shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
          style={{ width: '200px', height: '200px' }}
        >
          <img src={obra.imagen_url} alt={obra.titulo} className="w-full h-full object-cover" />
          {obra.en_venta && (
            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              ${obra.precio}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
