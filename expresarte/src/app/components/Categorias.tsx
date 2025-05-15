'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = {
  id: number;
  nombre: string;
  slug: string;
  imagen_url: string | null;
};

interface Props {
  columnas?: number;        // Número de columnas (ej: 3, 4, 5)
  limite?: number;          // Máximo de categorías a mostrar
  titulo?: string;          // Título personalizado
}

const CategoriasGrid: React.FC<Props> = ({ columnas = 4, limite, titulo = 'CATEGORÍAS DISPONIBLES' }) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categorias/');
        if (!res.ok) throw new Error('Error al obtener categorías');
        const data = await res.json();
        setAllCategories(data);
      } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleClick = (slug: string) => {
    router.push(`/categoria/${slug}`);
  };

  // Cortar la lista si hay límite
  const categoriasMostradas = limite ? allCategories.slice(0, limite) : allCategories;

  // Clases dinámicas para columnas
  const columnasClase = `grid-cols-1 sm:grid-cols-2 md:grid-cols-${columnas}`;

  return (
    <div className="flex flex-col items-center px-2 sm:px-4 py-12 bg-[#f7f7f7] text-center">
      <h1 className="text-4xl font-serif italic font-bold tracking-wider text-center text-black mb-6">{titulo}</h1>

      <div className={`grid ${columnasClase} gap-6 w-full`}>
        {categoriasMostradas.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleClick(cat.slug)}
            className="cursor-pointer relative group aspect-square overflow-hidden rounded-xl shadow-md w-full"
          >
            <img
              src={cat.imagen_url || '/default-image.jpg'}
              alt={cat.nombre}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-opacity-0 text-white py-2 text-center">
              <span className="text-lg font-semibold">{cat.nombre}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriasGrid;
