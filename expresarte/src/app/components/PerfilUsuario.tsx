'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import ObrasGrid from './ObrasGrid';
import CrearObraForm from './CrearObraForm';

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
  region?: string;
}

interface Props {
  user: User;
  token: string;
  obrasEnVenta: Obra[];
  obrasNoVenta: Obra[];
  activeTab: 'venta' | 'noVenta';
  setActiveTab: (tab: 'venta' | 'noVenta') => void;
}

export default function PerfilUsuario({
  user,
  token,
  obrasEnVenta,
  obrasNoVenta,
  activeTab,
  setActiveTab,
}: Props) {
  const [cantidadVisible, setCantidadVisible] = useState(100);
  const [mostrarFormObra, setMostrarFormObra] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log('🪪 [PerfilUsuario] Token recibido como prop:', token);
  }, [token]);

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
    <div className="flex h-[90vh] overflow-hidden max-w-screen-xl mx-auto bg-white shadow-lg rounded-4xl">
      {/* Columna izquierda - Perfil */}
      <div className="w-[320px] flex-shrink-0 p-6 overflow-hidden border-r border-gray-200">
        <div className="flex flex-col items-center">
          <Image
            src={user.foto_url || '/default-avatar.png'}
            alt="Perfil"
            width={250}
            height={250}
            className="border-4 border-black rounded-full shadow-md"
          />
          <h2 className="text-2xl font-bold mt-4 text-center">{user.nombre}</h2>
          <p className="text-sm text-gray-500">{user.region || 'Región no especificada'}</p>
          <p className="text-sm text-gray-600 text-center mb-4">{user.descripcion || 'Sin descripción'}</p>

          <div className="flex flex-col gap-4 mb-6 w-full">
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-rose-950 transition text-sm">
              Editar perfil
            </button>
            <button
              className="bg-black text-white px-4 py-2 rounded hover:bg-rose-950 transition text-sm"
              onClick={() => setMostrarFormObra(true)}
            >
              Agregar obra
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-gray-100 rounded-xl shadow text-center py-3">
              <p className="text-xl font-bold">{obrasEnVenta.length}</p>
              <p className="text-sm text-gray-600">En venta</p>
            </div>
            <div className="bg-gray-100 rounded-xl shadow text-center py-3">
              <p className="text-xl font-bold">{obrasNoVenta.length}</p>
              <p className="text-sm text-gray-600">No en venta</p>
            </div>
            <div className="bg-gray-100 rounded-xl shadow text-center py-3">
              <p className="text-xl font-bold">{user.seguidores ?? 0}</p>
              <p className="text-sm text-gray-600">Seguidores</p>
            </div>
            <div className="bg-gray-100 rounded-xl shadow text-center py-3">
              <p className="text-xl font-bold">{user.me_gusta ?? 0}</p>
              <p className="text-sm text-gray-600">Me gusta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha - Obras */}
      <div className="flex-1 relative overflow-hidden">
        {/* Tabs */}
        <div className="sticky top-0 bg-white z-10 p-6 pb-2 border-b border-black">
          <div className="w-full md:w-2/3 mx-auto border border-black rounded-md overflow-hidden">
            <button
              className={`w-1/2 py-3 font-semibold text-sm ${
                activeTab === 'venta' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => reiniciarScrollYCantidad('venta')}
            >
              Obras en venta
            </button>
            <button
              className={`w-1/2 py-3 font-semibold text-sm ${
                activeTab === 'noVenta' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => reiniciarScrollYCantidad('noVenta')}
            >
              No en venta
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="overflow-y-scroll scrollbar-hide px-6 pb-6 animate-fade-in"
          style={{ height: 'calc(90vh - 105px)' }}
        >
          <div className="min-h-[600px] flex-grow">
            {obrasMostradas.length > 0 ? (
              <ObrasGrid obras={obrasMostradas} />
            ) : (
              <p className="text-center text-gray-600 text-lg mt-20">
                {activeTab === 'venta' ? 'No hay obras en venta.' : 'No hay obras fuera de venta.'}
              </p>
            )}
          </div>
        </div>

        {/* Modal Crear Obra */}
        {mostrarFormObra && (
          <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-90 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl">
              <CrearObraForm
                usuarioId={user.id}
                token={token}
                onObraCreada={() => {
                  setMostrarFormObra(false);
                  setActiveTab('venta');
                  setCantidadVisible(9);
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
