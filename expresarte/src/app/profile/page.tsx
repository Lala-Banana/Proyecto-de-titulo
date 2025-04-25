'use client';

import { useUser } from '@/context/UserContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout, loading } = useUser();
  const router = useRouter();

  if (loading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col items-center pt-28 px-4">
      {/* Card */}
      <div className="bg-white text-gray-900 w-full max-w-3xl rounded-2xl shadow-lg p-8 relative">
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
          <Image
            src={user.foto_url || '/default-avatar.png'}
            alt="Avatar"
            width={120}
            height={120}
            className="rounded-full border-4 border-white shadow-lg"
          />
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold">{user.nombre}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="mt-2">Artista independiente y creador visual.</p>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button className="bg-cyan-500 text-white px-4 py-2 rounded-full hover:bg-cyan-600 transition">
            Editar perfil
          </button>
          <button
            onClick={logout}
            className="bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-900 transition"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="mt-8 flex justify-around border-t pt-6 text-center text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-900">22</p>
            <p>Amigos</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">10</p>
            <p>Obras</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">89</p>
            <p>Comentarios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
