'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ObrasGrid from './ObrasGrid';
import CrearObraForm from './CrearObraForm';
import { useRouter } from 'next/navigation';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
}

interface User {
  id: number;
  nombre: string;
  foto_url: string;
  descripcion: string;
  seguidores?: number;
  me_gusta?: number;
  ubicacion?: string;
  fondo?: string;
  rut?: string;
  tipo_usuario?: 'comprador' | 'artista';
}

interface Props {
  user: User;
  token: string;
  obrasEnVenta: Obra[];
  obrasNoVenta: Obra[];
  activeTab: 'venta' | 'noVenta';
  setActiveTab: (tab: 'venta' | 'noVenta') => void;
  isOwner?: boolean; // ✅ NUEVA PROP
}

export default function PerfilUsuario({
  user: userProp,
  token,
  obrasEnVenta,
  obrasNoVenta,
  activeTab,
  setActiveTab,
  isOwner = true,
}: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User>(userProp);
  const [cantidadVisible, setCantidadVisible] = useState(100);
  const [mostrarFormObra, setMostrarFormObra] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token || !isOwner) return;
      try {
        const res = await fetch('http://localhost:8000/api/me/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUser({
          ...data,
          region: data.ubicacion || data.region || 'No especificada',
          rut: data.rut || 'No especificado',
          tipo_usuario: data.tipo_usuario || undefined,
        });
      } catch (err) {
        console.error('Error al obtener perfil:', err);
      }
    };
    fetchUser();
  }, [token, isOwner]);

  const allObras = activeTab === 'venta' ? obrasEnVenta : obrasNoVenta;
  const obrasMostradas = allObras.slice(0, cantidadVisible);

  const reiniciarScrollYCantidad = (nuevoTab: 'venta' | 'noVenta') => {
    setActiveTab(nuevoTab);
    setCantidadVisible(9);
    setTimeout(() => {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[90vh] max-w-screen-xl mx-auto bg-white shadow-lg rounded-4xl">
      {/* Perfil */}
      <div className="w-full lg:w-[320px] p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
        <div className="flex flex-col items-center">
          <Image
            src={user.foto_url || '/default-avatar.png'}
            alt="Perfil"
            width={150}
            height={150}
            className="border-4 border-black rounded-full shadow-md object-cover"
          />
          <h2 className="text-2xl font-bold mt-4 text-center text-black">{user.nombre}</h2>
          <p className="text-sm text-gray-700 text-center">
            Rol:{' '}
            <span className="font-semibold capitalize">
              {user.tipo_usuario === 'artista' ? 'Artista' :
                user.tipo_usuario === 'comprador' ? 'Comprador' :
                'No especificado'}
            </span>
          </p>
          <p className="text-sm text-gray-700 text-center">RUT: <span className="font-semibold">{user.rut}</span></p>
          <p className="text-sm text-gray-700 text-center mb-2">Región: <span className="font-semibold">{user.ubicacion}</span></p>
          <p className="text-sm text-gray-600 text-center mb-4">{user.descripcion || 'Sin descripción'}</p>

          {isOwner && (
            <div className="flex flex-col gap-4 mb-6 w-full">
              <button
                onClick={() => {
                  router.push('/profile/editar');
                  router.refresh();
                }}
                className="bg-black text-white px-4 py-2 rounded hover:bg-rose-950 transition text-sm"
              >
                Editar perfil
              </button>
              <button
                onClick={() => setMostrarFormObra(true)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-rose-950 transition text-sm"
              >
                Agregar obra
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 w-full">
            {[
              { label: 'En venta', count: obrasEnVenta.length },
              { label: 'No en venta', count: obrasNoVenta.length },
              { label: 'Seguidores', count: user.seguidores ?? 0 },
              { label: 'Me gusta', count: user.me_gusta ?? 0 }
            ].map((item, i) => (
              <div key={i} className="bg-gray-100 rounded-xl text-black shadow text-center py-3">
                <p className="text-xl font-bold">{item.count}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Obras */}
      <div className="flex-1 overflow-hidden">
        <div className="sticky top-0 bg-white z-10 p-6 pb-2 border-b border-black">
          <div className="w-full md:w-2/3 mx-auto border border-black rounded-md overflow-hidden">
            {['venta', 'noVenta'].map((tab) => (
              <button
                key={tab}
                className={`w-1/2 py-3 font-semibold text-sm ${
                  activeTab === tab ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
                onClick={() => reiniciarScrollYCantidad(tab as 'venta' | 'noVenta')}
              >
                {tab === 'venta' ? 'Obras en venta' : 'No en venta'}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={containerRef}
          className="overflow-y-auto px-6 pb-6 animate-fade-in"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {obrasMostradas.length > 0 ? (
            <ObrasGrid obras={obrasMostradas} slug={user.nombre.toLowerCase().replace(/\s+/g, '-')} />
          ) : (
            <p className="text-center text-gray-600 text-lg mt-20">
              {activeTab === 'venta'
                ? 'No hay obras en venta.'
                : 'No hay obras fuera de venta.'}
            </p>
          )}
        </div>

        {isOwner && mostrarFormObra && (
          <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-90 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl">
              <CrearObraForm
                usuarioId={user.id}
                token={token}
                onObraCreada={() => {
                  setMostrarFormObra(false);
                  setActiveTab('venta');
                  setCantidadVisible(15);
                }}
              />
              <button
                className="mt-4 text-sm text-gray-600 underline"
                onClick={() => setMostrarFormObra(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
