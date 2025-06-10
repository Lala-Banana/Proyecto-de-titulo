'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NavbarCombined from '@/app/components/Navbar';
import SidebarFiltros from '@/app/components/SidebarFiltros';
import ObrasGrid, { Obra } from '@/app/components/ObrasGrid';
import Footer from '@/app/components/Footer';

export default function CategoriaSlugPage() {
  const { slug } = useParams();
  const slugStr = Array.isArray(slug) ? slug[0] : slug;

  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugStr) return;

    setLoading(true);
    fetch(`http://localhost:8000/api/categorias/${slugStr}/obras/`)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data: Obra[]) => {
        setObras(data);
      })
      .catch(err => {
        console.error('Error al cargar obras por categoría:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slugStr]);

  return (
    <>
      <NavbarCombined />

      <div className="flex">
        <aside className="w-64">
          <SidebarFiltros onAplicar={() => { /* aquí podrías filtrar aún más */ }} />
        </aside>

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-4">
            Obras en categoría: <span className="capitalize">{slugStr}</span>
          </h1>

          {loading && <p>Cargando obras…</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && <ObrasGrid obras={obras} />}
        </main>
      </div>

      <Footer />
    </>
  );
}
