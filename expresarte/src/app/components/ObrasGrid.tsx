// components/ObrasGrid.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Image from 'next/image';

export interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  precio: number;
  en_venta: boolean;
}

interface Props {
  obras: Obra[];
  slug: string;
  columnas?: number; // por defecto 4
}

export default function ObrasGrid({ obras, slug, columnas = 4 }: Props) {
  const router = useRouter();

  const handleClickObra = useCallback(
    (obraId: number) => {
      router.push(`/publicaciones/${obraId}`);
    },
    [router]
  );

  if (!obras || obras.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-8">
        No hay obras disponibles para mostrar.
      </p>
    );
  }

  // Grid responsive: 1 col móvil, 2 col tablet, 3 col notebook, N col escritorio
  const gridColsClass = `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columnas}`;

  return (
    <div className={`grid ${gridColsClass} gap-6 mt-6 justify-items-center`}>
      {obras.map((obra) => (
        <div
          key={obra.id}
          onClick={() => handleClickObra(obra.id)}
          className="relative w-full aspect-square bg-gray-100 rounded shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
        >
          {obra.imagen_url ? (
            <Image
              src={obra.imagen_url}
              alt={obra.titulo}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-300 text-sm text-gray-600">
              Sin imagen
            </div>
          )}

          {obra.en_venta && (
            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              ${Number(obra.precio).toLocaleString('es-CL')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
