'use client';

import { useEffect, useState } from 'react';

interface Categoria {
  id: number;
  nombre: string;
}

interface Props {
  onAplicar: (categoriaId: number | null) => void;
}

export default function SidebarFiltros({ onAplicar }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categorias/');
        if (!res.ok) throw new Error('Error al cargar categorías');
        const data: Categoria[] = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
      }
    };
    fetchCategorias();
  }, []);

  const handleAplicar = () => {
    onAplicar(categoriaId);
  };

  return (
    <>
      {/* MÓVIL/TABLET: solo el dropdown (select + botón) */}
      <div className="lg:hidden px-4 py-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2 text-black">Filtrar</h2>
        <label className="block font-medium mb-1 text-black">Categoría</label>
        <select
          className="w-full border rounded text-black p-2 mb-3"
          value={categoriaId ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            setCategoriaId(value ? parseInt(value) : null);
          }}
        >
          <option value="">Todas</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
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

      {/* ESCRITORIO: sidebar completo */}
      <aside className="hidden lg:block w-64 px-4 border-r border-gray-300 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto bg-white">
        <h2 className="text-xl font-semibold mb-4 text-black">Categorías</h2>
        <div className="mb-4">
          <label className="block font-medium mb-1 text-black">Categoría</label>
          <select
            className="w-full border rounded text-black p-2 mb-3"
            value={categoriaId ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setCategoriaId(value ? parseInt(value) : null);
            }}
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAplicar}
          className=" text-white w-full py-2 rounded"
        >
          Aplicar
        </button>
      </aside>
    </>
  );
}
