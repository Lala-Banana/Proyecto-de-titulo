'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import Image from 'next/image';
import { BsThreeDotsVertical } from 'react-icons/bs';

export interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  precio: number;
  en_venta: boolean;
  esPropia?: boolean; // ← Agregado para identificar si es del usuario
}

interface Props {
  obras: Obra[];
  slug: string;
  columnas?: number;
  onEditar?: (obra: Obra) => void;
  onEliminar?: (obraId: number) => void;
}

export default function ObrasGrid({ obras, slug, columnas = 4, onEditar, onEliminar }: Props) {
  const router = useRouter();
  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);

  const handleClickObra = useCallback(
    (obraId: number) => {
      router.push(`/publicaciones/${obraId}`);
    },
    [router]
  );

  const toggleMenu = (obraId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuVisibleId((prev) => (prev === obraId ? null : obraId));
  };

  const handleEditar = (obra: Obra, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuVisibleId(null);
    onEditar?.(obra);
  };

  const handleEliminar = (obraId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuVisibleId(null);
    onEliminar?.(obraId);
  };

  const gridColsClass = `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${columnas}`;

  if (!obras || obras.length === 0) {
    return <p className="text-center text-gray-600 mt-8">No hay obras disponibles para mostrar.</p>;
  }

  return (
    <div className={`grid ${gridColsClass} gap-6 mt-6 justify-items-center`}>
      {obras.map((obra) => (
        <div
          key={obra.id}
          onClick={() => handleClickObra(obra.id)}
          className="relative w-full aspect-square bg-gray-100 rounded shadow-md overflow-hidden hover:scale-105 transition-transform duration-300"
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
            <div className="absolute top-1 left-1 bg-gray-600 opacity-75 text-white text-md px-2 py-1 rounded">
              ${Number(obra.precio).toLocaleString('es-CL')}
            </div>
          )}

          {obra.esPropia && (
            <div className="absolute top-1 right-1">
              <button
                className="p-1  bg-opacity-60 text-white rounded-full hover:bg-opacity-80"
                onClick={(e) => toggleMenu(obra.id, e)}
              >
                <BsThreeDotsVertical size={26} />
              </button>

              {menuVisibleId === obra.id && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-10">
                  <button
                    onClick={(e) => handleEditar(obra, e)}
                    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    Editar/Eliminar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
