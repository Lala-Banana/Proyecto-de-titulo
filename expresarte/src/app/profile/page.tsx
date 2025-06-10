// pages/profile/page.tsx (o donde esté tu ProfilePage)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PerfilUsuario from '../components/PerfilUsuario'; // asegúrate de la ruta
import NavbarCombined from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuthUniversal } from '@/hooks/useAuthUniversal';
import { Obra } from '@/types/types';

export default function ProfilePage() {
  const { user, token, loading } = useAuthUniversal();
  const [obras, setObras] = useState<Obra[]>([]);
  const [activeTab, setActiveTab] = useState<'venta' | 'noVenta'>('venta');
  const router = useRouter();

  // Fetch inicial y después de borrado
  const fetchObras = async () => {
    if (!user || !token) return;
    try {
      const res = await fetch(`http://localhost:8000/api/obras/?usuario_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al obtener obras');
      const data = await res.json();
      setObras(
        data.map((obra: any) => ({
          ...obra,
          precio: typeof obra.precio === 'string' ? Number(obra.precio) : obra.precio,
        }))
      );
    } catch (err) {
      console.error('❌ Error al cargar obras', err);
    }
  };

  useEffect(() => {
    if (!loading) fetchObras();
  }, [user, token, loading]);

  // Handler de eliminación
  const handleDeleteObra = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta obra?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/obras/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar obra');
      // Refresca el listado
      await fetchObras();
    } catch (err) {
      console.error('❌ Error al eliminar obra', err);
      alert('No se pudo eliminar la obra');
    }
  };

  if (loading) return <p className="text-center mt-20">Cargando perfil...</p>;
  if (!user) return <p className="text-red-600 text-center mt-10">⚠️ No has iniciado sesión.</p>;

  // Filtrado por pestañas
  const obrasEnVenta = obras.filter((o) => o.en_venta);
  const obrasNoVenta = obras.filter((o) => !o.en_venta);

  return (
    <div className="bg-gray-10 text-gray-900">
      <NavbarCombined />

      <div className="relative min-h-screen">
        {/* ...fondo y demás... */}
        <div className="relative z-10 py-12 px-4 text-white flex flex-col items-center">
          <PerfilUsuario
            user={user}
            token={token || ''}
            obrasEnVenta={obrasEnVenta}
            obrasNoVenta={obrasNoVenta}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onDelete={handleDeleteObra}      // ← le pasamos el callback
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
