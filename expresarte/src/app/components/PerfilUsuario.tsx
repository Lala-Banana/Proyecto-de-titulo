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
  precio: number;
  en_venta: boolean;
  me_gusta?: number[];
}

interface User {
  id: number;
  nombre: string;
  foto_url: string;
  descripcion: string;
  seguidores?: number;
  me_gusta?: number;
  region?: string;
  fondo?: string;
  rut?: string;
  tipo_usuario?: 'comprador' | 'artista';
  seguidores_count?: number;
}

interface Props {
  user: User;
  token: string;
  obrasEnVenta: Obra[];
  obrasNoVenta: Obra[];
  activeTab: 'venta' | 'noVenta';
  setActiveTab: (tab: 'venta' | 'noVenta') => void;
  isOwner?: boolean;
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
  const [mostrarFormObra, setMostrarFormObra] = useState(false);
  const [cantidadVisible, setCantidadVisible] = useState<number>(() => obrasEnVenta.length);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false); // 🚀 para botón Seguir

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
          region: data.region || 'No especificada',
          tipo_usuario: data.tipo_usuario || undefined,
        });
      } catch (err) {
        console.error('Error al obtener perfil:', err);
      }
    };
    fetchUser();
  }, [token, isOwner]);

  // 🚀 Calcular totalLikes
  useEffect(() => {
    const sumarLikes = () => {
      const todasLasObras = [...obrasEnVenta, ...obrasNoVenta];

      const total = todasLasObras.reduce((acc, obra) => {
        const likes = Array.isArray(obra.me_gusta) ? obra.me_gusta.length : 0;
        return acc + likes;
      }, 0);

      setTotalLikes(total);
    };

    sumarLikes();
  }, [obrasEnVenta, obrasNoVenta]);

  useEffect(() => {
  const nuevasObras = activeTab === 'venta' ? obrasEnVenta : obrasNoVenta;
  setCantidadVisible(nuevasObras.length);
}, [activeTab, obrasEnVenta, obrasNoVenta]);


  // 🚀 Verificar si sigo al usuario
  useEffect(() => {
    const checkIfFollowing = async () => {
      if (!token || isOwner) return;
      try {
        const res = await fetch(`http://localhost:8000/api/usuarios/${user.id}/is-following/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(data.is_following);
        }
      } catch (err) {
        console.error('Error checking following:', err);
      }
    };

    checkIfFollowing();
  }, [token, user.id, isOwner]);

  // 🚀 Toggle seguir/dejar de seguir
  const handleToggleSeguir = async () => {
    if (!token || isOwner) return;
    try {
      const res = await fetch(`http://localhost:8000/api/usuarios/${user.id}/toggle-follow/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const nuevoIsFollowing = data.is_following;

        setIsFollowing(nuevoIsFollowing);

        // 🚀 ACTUALIZAR seguidores_count dinámicamente
        setUser((prevUser) => ({
          ...prevUser,
          seguidores_count:
            (prevUser.seguidores_count ?? 0) + (nuevoIsFollowing ? 1 : -1),
        }));
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const allObras = activeTab === 'venta' ? obrasEnVenta : obrasNoVenta;
  const obrasMostradas = allObras.slice(0, cantidadVisible);

  const reiniciarScrollYCantidad = (nuevoTab: 'venta' | 'noVenta') => {
    setActiveTab(nuevoTab);
    setCantidadVisible(allObras.length);
    setTimeout(() => {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      {/* Perfil */}
      <div className="w-full lg:w-[320px] p-6 border-b lg:border-b-0 lg:sticky lg:top-[80px] z-20 bg-white/20 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <Image
            src={user.foto_url || 'https://us.123rf.com/450wm/tuktukdesign/tuktukdesign1608/tuktukdesign160800036/61010819-icono-de-usuario-hombre-perfil-hombre-de-negocios-avatar-ilustraci%C3%B3n-vectorial-persona-glifo.jpg?ver=6'}
            alt="Perfil"
            width={200}
            height={200}
            className="border-4 border-black shadow-md object-cover"
          />
          <h2 className="text-2xl font-bold mt-4 text-center text-white">{user.nombre}</h2>
          <p className="text-sm text-gray-100 text-center">
            Rol:{' '}
            <span className="font-semibold capitalize">
              {user.tipo_usuario === 'artista'
                ? 'Artista'
                : user.tipo_usuario === 'comprador'
                ? 'Comprador'
                : user.tipo_usuario === 'distribuidor'
                ? 'Distribuidor'
                : 'No especificado'}
            </span>
          </p>
          <p className="text-sm text-gray-100 text-center mb-2">
            Región: <span className="font-semibold">{user.region}</span>
          </p>
          <p className="w-4/5 mx-auto text-sm text-gray-100 text-center mb-4 break-words">
            {user.descripcion || 'Sin descripción'}
          </p>

          {isOwner && (
            <div className="flex flex-col gap-4 mb-3 w-full">
              <button
                onClick={() => {
                  router.push('/profile/editar');
                  router.refresh();
                }}
                className="bg-black text-white px-4 py-2 rounded hover:bg-rose-950 transition text-sm"
              >
                Editar Perfil
              </button>
              <button
                onClick={() => setMostrarFormObra(true)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-rose-950 transition text-sm"
              >
                Agregar Publicacion
              </button>
            </div>
          )}

          {/* 🚀 Botón seguir / dejar de seguir */}
          {!isOwner && (
            <div className="flex justify-center w-full mb-4">
              <button
                onClick={handleToggleSeguir}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm"
              >
                {isFollowing ? 'Dejar de seguir' : 'Seguir'}
              </button>
            </div>
          )}

          {/* 🚀 Grid de datos */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {[
              { label: 'En venta', count: obrasEnVenta.length },
              { label: 'No en venta', count: obrasNoVenta.length },
              { label: 'Seguidores', count: user.seguidores_count ?? 0 },
              { label: 'Me gusta', count: totalLikes },
            ].map((item, i) => (
              <div
                key={i}
                className="w-full bg-gray-100 rounded-xl text-black shadow text-center"
              >
                <p className="text-xl font-bold">{item.count}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Obras */}
      <div className="flex-1 p-6 overflow-y-auto" ref={containerRef}>
        <div className="z-10 p-6 pb-2 border-black">
          <div className="mx-auto bg-white/20 border-black rounded-md overflow-hidden">
            {['venta', 'noVenta'].map((tab) => (
              <button
                key={tab}
                className={`w-1/2 py-3 font-semibold text-sm ${
                  activeTab === tab
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                onClick={() => reiniciarScrollYCantidad(tab as 'venta' | 'noVenta')}
              >
                {tab === 'venta' ? 'Publicaciones en venta' : 'No en venta'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 animate-fade-in">
          {obrasMostradas.length > 0 ? (
            <ObrasGrid
              obras={obrasMostradas}
              slug={user.nombre.toLowerCase().replace(/\s+/g, '-')}
            />
          ) : (
            <p className="text-center text-gray-600 text-lg mt-20">
              {activeTab === 'venta'
                ? 'No hay Publicaciones en venta.'
                : 'No hay Publicaciones fuera de venta.'}
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
