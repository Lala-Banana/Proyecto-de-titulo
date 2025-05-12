'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PerfilUsuario from '../components/PerfilUsuario';
import NavbarCombined from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuthUniversal } from '@/hooks/useAuthUniversal';
import { Obra } from '@/types/types';

export default function ProfilePage() {
  const { user, token, loading } = useAuthUniversal();
  const [obras, setObras] = useState<Obra[]>([]);
  const [activeTab, setActiveTab] = useState<'venta' | 'noVenta'>('venta');
  const router = useRouter();

  useEffect(() => {
    const fetchObras = async () => {
      if (!user || !token) return;

      try {
        const res = await fetch(`http://localhost:8000/api/obras/?usuario_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Error al obtener obras');
        const obrasData = await res.json();
        setObras(obrasData);
      } catch (err) {
        console.error('❌ Error al cargar obras', err);
      }
    };

    fetchObras();
  }, [user, token]);

  if (loading) return <p className="text-center mt-20">Cargando perfil...</p>;
  if (!user) return <p className="text-red-600 text-center mt-10">⚠️ No has iniciado sesión.</p>;

  const obrasEnVenta = obras.filter((obra) => obra.en_venta);
  const obrasNoVenta = obras.filter((obra) => !obra.en_venta);

  return (
    <div className="bg-gray-50 text-gray-900">
      <NavbarCombined />

      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-0">
          <img
            src={
              user.fondo ||
              'https://images.unsplash.com/photo-1415889455891-23bbf19ee5c7?q=80&w=1476&auto=format&fit=crop'
            }
            alt="Fondo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-none" />
        </div>

        <div className="relative z-10 py-12 px-4 text-white flex flex-col items-center">
          <PerfilUsuario
            user={user}
            token={token || ''}
            obrasEnVenta={obrasEnVenta}
            obrasNoVenta={obrasNoVenta}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
