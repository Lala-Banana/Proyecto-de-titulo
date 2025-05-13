'use client';

import { useEffect, useState } from 'react';
import ObrasGrid from '@/app/components/ObrasGrid';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
}

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/obras/');
        if (!res.ok) throw new Error('Error al cargar obras');
        const data = await res.json();
        setObras(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las obras');
      } finally {
        setLoading(false);
      }
    };

    fetchObras();
  }, []);

  return (
    <>
      <NavbarCombined />
      <main className="px-4 pt-24 pb-16 min-h-screen bg-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Todas las Obras</h1>
        {loading ? (
          <p className="text-center mt-10">Cargando obras...</p>
        ) : error ? (
          <p className="text-center text-red-500 mt-10">{error}</p>
        ) : (
          <ObrasGrid obras={obras} slug="todas" />
        )}
      </main>
      <Footer />
    </>
  );
}
