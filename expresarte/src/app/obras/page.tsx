'use client';

import { useEffect, useState } from 'react';
import ObrasGrid from '@/app/components/ObrasGrid';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import SidebarFiltros from '@/app/components/SidebarFiltros';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
  categoria: number; // ✅ importante que tengas este campo en tu modelo
}

export default function ObrasPage() {
  const [todasLasObras, setTodasLasObras] = useState<Obra[]>([]);
  const [obrasFiltradas, setObrasFiltradas] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchObras = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/obras/');
      if (!res.ok) throw new Error('Error al cargar obras');
      const data = await res.json();
      setTodasLasObras(data);
      setObrasFiltradas(data); // Mostrar todas al inicio
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las obras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObras();
  }, []);

  const aplicarFiltro = (categoriaId: number | null) => {
    if (categoriaId === null) {
      setObrasFiltradas(todasLasObras); // sin filtro
    } else {
      const filtradas = todasLasObras.filter(
        (obra) => obra.categoria === categoriaId
      );
      setObrasFiltradas(filtradas);
    }
  };

  return (
    <>
      <NavbarCombined />
      <main className="flex pt-24 pb-16 min-h-screen bg-white">
        <SidebarFiltros onAplicar={aplicarFiltro} />

        <section className="flex-1 px-4">
          <h1 className="text-4xl font-serif italic font-bold tracking-wider text-center text-black mb-10">
            PUBLICACIONES DISPONIBLES
          </h1>
          {loading ? (
            <p className="text-center mt-10">Cargando obras...</p>
          ) : error ? (
            <p className="text-center text-red-500 mt-10">{error}</p>
          ) : obrasFiltradas.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No hay obras en esta categoría.</p>
          ) : (
            <ObrasGrid obras={obrasFiltradas} slug="todas" />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
