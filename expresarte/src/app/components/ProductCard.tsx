'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: number;
  titulo: string;
  precio: number;
  imagen_url: string;
  en_venta: boolean;
}

export default function ProductCard({ id, titulo, precio, imagen_url, en_venta }: ProductCardProps) {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg bg-white transition hover:scale-105 hover:shadow-xl duration-300">
      <div className="relative w-full h-60">
        <Image
          src={imagen_url}
          alt={titulo}
          fill
          className="object-cover"
          style={{ borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 truncate">{titulo}</h3>
        <p className="text-gray-500 mb-3">${precio}</p>
        {en_venta ? (
          <Link href={`/comprar/${id}`}>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
              Comprar ahora
            </button>
          </Link>
        ) : (
          <p className="text-center text-red-500 font-medium">No disponible</p>
        )}
      </div>
    </div>
  );
}
