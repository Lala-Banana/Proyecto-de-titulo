'use client';

import { useRouter } from 'next/navigation';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
}

interface Props {
  obras: Obra[];
}

export default function ObrasGrid({ obras }: Props) {
  const router = useRouter();

  if (!obras || obras.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-8">
        No hay obras disponibles para mostrar.
      </p>
    );
  }

  const handleClickObra = (obraId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('⚠️ Token no encontrado aún, esperando...');
      setTimeout(() => {
        const retryToken = localStorage.getItem('access_token');
        if (retryToken) {
          window.location.href = `/obra/${obraId}?token=${retryToken}`;
        } else {
          console.error('⛔ Token sigue sin estar disponible después del delay');
        }
      }, 500); // espera 200 ms
    } else {
      window.location.href = `/obra/${obraId}?token=${token}`;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6 justify-items-center">
      {obras.map((obra) => (
        <div
          key={obra.id}
          onClick={() => handleClickObra(obra.id)}
          className="relative bg-gray-100 rounded shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
          style={{ width: '200px', height: '200px' }}
        >
          <img
            src={obra.imagen_url}
            alt={obra.titulo}
            className="w-full h-full object-cover"
          />
          {obra.en_venta && (
            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              ${obra.precio}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
