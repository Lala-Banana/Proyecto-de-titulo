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
        const data = await res.json();
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
    <aside className="w-64 px-4 border-r border-gray-300 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-black">Categorías</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1 text-black">Categoría</label>
        <select
          className="w-full border rounded text-black p-2"
          value={categoriaId ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            setCategoriaId(value ? parseInt(value) : null);
          }}
        >
          <option className="w-full border rounded text-black p-2" value="">Todas</option>
          {categorias.map((cat) => (
            <option  className="w-full border rounded text-black p-2" key={cat.id} value={cat.id}>
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
  );
}
