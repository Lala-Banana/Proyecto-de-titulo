'use client';

import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';

interface Obra {
  id: number;
  titulo: string;
  precio: number;
  imagen_url: string;
  en_venta: boolean;
}

export default function HomePage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchObras = async () => {
      const res = await fetch('http://localhost:8000/api/obras/');
      const data = await res.json();
      setObras(data);
    };
    fetchObras();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="px-8 pt-10">
        <h1 className="text-3xl font-bold text-center mb-10">
          {user ? `Bienvenido, ${user.nombre}` : 'Explora obras de arte'}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {obras.map((obra) => (
            <div
              key={obra.id}
              className="relative overflow-hidden rounded-xl shadow-lg group h-80 cursor-pointer"
            >
              <Image
                src={obra.imagen_url}
                alt={obra.titulo}
                fill
                className="object-cover z-0 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 z-10 flex flex-col justify-between p-4">
                <div>
                  <p className="text-xs uppercase text-gray-300 font-semibold">Obra</p>
                  <h2 className="text-lg font-bold text-white leading-tight truncate">
                    {obra.titulo}
                  </h2>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">${obra.precio}</p>
                  {obra.en_venta ? (
                    <Link href={`/comprar/${obra.id}`}>
                      <button className="bg-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-700">
                        Comprar
                      </button>
                    </Link>
                  ) : (
                    <span className="text-sm text-red-400">No disponible</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}