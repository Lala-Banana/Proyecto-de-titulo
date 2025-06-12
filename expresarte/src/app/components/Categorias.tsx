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
  columnas?: number; // Número de columnas
  limite?: number;   // Máximo de categorías a mostrar
  titulo?: string;   // Título personalizado
}

const CategoriasGrid: React.FC<Props> = ({
  columnas = 4,
  limite,
  titulo = 'CATEGORÍAS DISPONIBLES',
}) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categorias/');
        if (!res.ok) throw new Error('Error al obtener categorías');
        const data: Category[] = await res.json();
        setAllCategories(data);
      } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleClick = (slug: string) => {
    router.push(`/categorias/${slug}`);
  };

  const categoriasMostradas = limite
    ? allCategories.slice(0, limite)
    : allCategories;

  const colsMap: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
  };
  const columnasClase = `grid-cols-1 sm:grid-cols-2 ${colsMap[columnas] || colsMap[4]}`;

  return (
    <div className="flex justify-center capitalize items-start bg-[#f7f7f7] py-30">
      <div className="w-full max-w-7xl  px-4 text-center">
        <h1 className="text-4xl font-serif italic font-bold tracking-wider text-black mb-6">
          {titulo}
        </h1>
        <div className={`grid ${columnasClase} gap-6 w-full `}>
          {categoriasMostradas.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleClick(cat.slug)}
              className="cursor-pointer hover:scale-105 transition-transform duration-300 relative group aspect-square overflow-hidden rounded-xl shadow-md"
            >
              <img
                src={cat.imagen_url ?? '/default-image.jpg'}
                alt={cat.nombre}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-opacity-0 text-white py-2 text-center">
                <span className="text-lg font-semibold">{cat.nombre}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriasGrid;
