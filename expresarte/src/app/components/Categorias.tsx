'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = {
  id: number;
  nombre: string;
  slug: string;
  imagen_url: string | null;
};

const GalleryMosaic: React.FC = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const router = useRouter();

  const categoriasPermitidas = [1, 2, 3, 4, 5]; // Mostramos 5 categorías

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

  const filteredCategories = allCategories.filter((cat) =>
    categoriasPermitidas.includes(cat.id)
  );

  const handleClick = (slug: string) => {
    router.push(`/categoria/${slug}`);
  };

  return (
    <div className="flex flex-col items-center px-2 sm:px-4 py-12 bg-[#f7f7f7] text-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full">
        {filteredCategories.map((cat) => (
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

      {/* Texto inferior elegante */}
      <div className="mt-16">
        <h2 className="text-4xl font-serif font-bold tracking-wide">NEW ARRIVAL</h2>
        <p className="mt-2 text-md italic tracking-wider text-gray-700">
          INTRODUCING OUR NEW FASHION COLLECTION
        </p>
      </div>
    </div>
  );
};

export default GalleryMosaic;
