'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Image from 'next/image';

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
  columnas?: number; // Número de columnas (por defecto 4)
}

export default function ObrasGrid({ obras, slug, columnas = 4 }: Props) {
  const router = useRouter();

  const handleClickObra = useCallback(
    (obraId: number) => {
      router.push(`/publicacion/${obraId}`);
    },
    [router]
  );

  if (!obras || obras.length === 0) {
    return <p className="text-center text-gray-600 mt-8">No hay obras disponibles para mostrar.</p>;
  }

  // Clases dinámicas para las columnas
  const gridColsClass = `grid-cols-1 sm:grid-cols-2 md:grid-cols-${columnas}`;

  return (
    <div className={`grid ${gridColsClass} gap-6 mt-6 justify-items-center`}>
      {obras.map((obra) => (
        <div
          key={obra.id}
          onClick={() => handleClickObra(obra.id)}
          className="relative bg-gray-100 rounded shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
          style={{ width: 200, height: 200 }}
        >
          {/* Imagen optimizada con next/image, alta calidad y recorte */}
          <Image
            src={obra.imagen_url}
            alt={obra.titulo}
            fill
            sizes="200px"
            quality={200}
            className="object-cover"
          />

          {/* Precio si está en venta */}
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
