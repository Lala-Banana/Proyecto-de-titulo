// components/SidebarFiltros.tsx
'use client';

import { useEffect, useState } from 'react';

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;          // <-- ahora también usamos el slug
}

interface Props {
  /** Recibirá el slug de la categoría (o null para “Todas”) */
  onAplicar: (categoriaSlug: string | null) => void;
}

export default function SidebarFiltros({ onAplicar }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSlug, setCategoriaSlug] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categorias/');
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data: Categoria[] = await res.json();
        setCategorias(data);
      } catch (err) {
        console.error('❌ Error al cargar categorías:', err);
      }
    };
    fetchCategorias();
  }, []);

  const handleAplicar = () => {
    console.log('[Sidebar] Aplicando slug=', categoriaSlug);
    onAplicar(categoriaSlug);
  };

  return (
    <>
      {/* ==== VERSIÓN MÓVIL/TABLET ==== */}
      <div className="lg:hidden px-4 py-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2 text-black">Filtrar</h2>
        <label className="block font-medium mb-1 text-black">Categoría</label>
        <select
          className="w-full border rounded text-black p-2 mb-3"
          value={categoriaSlug ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            setCategoriaSlug(val || null);
          }}
        >
          <option value="">Todas</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={handleAplicar}
          className="bg-black text-white w-full py-2 rounded"
        >
          Aplicar
        </button>
      </div>

      {/* ==== VERSIÓN ESCRITORIO ==== */}
      <aside className="hidden lg:block w-64 px-4 border-r border-gray-300 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto bg-white">
        <h2 className="text-xl font-semibold mb-4 text-black">Categorías</h2>
        <div className="mb-4">
          <label className="block font-medium mb-1 text-black">Categoría</label>
          <select
            className="w-full border rounded text-black p-2 mb-3"
            value={categoriaSlug ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setCategoriaSlug(val || null);
            }}
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAplicar}
          className="bg-black text-white w-full py-2 rounded"
        >
          Aplicar
        </button>
      </aside>
    </>
  );
}
