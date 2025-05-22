'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  // ojo: aquí no tipamos categoria_* porque puede variar; usamos any al parsear
}

interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

export default function CategoriaSlugPage() {
  const { slug } = useParams();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) {
      setError('Slug no disponible');
      setLoading(false);
      return;
    }

    const fetchYFiltrar = async () => {
      try {
        setLoading(true);

        // Preparamos headers con token si existe
        const headers: HeadersInit = {};
        const token = localStorage.getItem('access_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const categoriaSlug = Array.isArray(slug) ? slug[0] : slug;

        // 1) Traer todas las categorías
        const catRes = await fetch('http://localhost:8000/api/categorias/', { headers });
        if (!catRes.ok) {
          throw new Error(`Error cargando categorías (status ${catRes.status})`);
        }
        const categorias: Categoria[] = await catRes.json();

        // 2) Buscar la que coincida en slug
        const cat = categorias.find(c => c.slug === categoriaSlug);
        if (!cat) {
          throw new Error(`Categoría "${categoriaSlug}" no encontrada`);
        }
        const categoriaId = cat.id;

        // 3) Traer todas las obras
        const obrasRes = await fetch('http://localhost:8000/api/obras/', { headers });
        if (!obrasRes.ok) {
          throw new Error(`Error cargando obras (status ${obrasRes.status})`);
        }
        const todasObras: any[] = await obrasRes.json();

        // 4) Debug: inspecciona la forma real de cada obra
        console.log('todasObras:', todasObras);

        // 5) Filtrar según la forma de tu API:
        const filtradas = todasObras.filter(o => {
          // Caso A: tu API devuelve "categoria" como número
          if (typeof o.categoria === 'number') {
            return o.categoria === categoriaId;
          }
          // Caso B: tu API devuelve un objeto anidado { categoria: { id, nombre, … } }
          if (o.categoria && typeof o.categoria === 'object') {
            return o.categoria.id === categoriaId;
          }
          // Caso C: tu API nombra el campo "categoria_id"
          if (typeof o.categoria_id === 'number') {
            return o.categoria_id === categoriaId;
          }
          // Si ninguno aplica, devolvemos false (no incluir)
          return false;
        });

        setObras(filtradas);
      } catch (err: any) {
        setError(err.message || 'Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchYFiltrar();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavbarCombined />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold mb-6">Categoría: {slug}</h1>

        {loading && <p className="text-center mt-10">Cargando obras...</p>}
        {error && <p className="text-center text-red-600 mt-10">⚠️ {error}</p>}
        {!loading && !error && obras.length === 0 && (
          <p className="text-center mt-10 text-gray-500">No hay obras en esta categoría.</p>
        )}
        {!loading && obras.length > 0 && <ObrasGrid obras={obras} slug={slug as string} />}
      </main>

      <Footer />
    </div>
  );
}
