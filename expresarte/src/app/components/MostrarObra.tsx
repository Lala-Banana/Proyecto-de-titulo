'use client';

import { useEffect, useState } from 'react';
import ComentariosObra from './ComentarioObra'; // ✅ importado para que quede dentro

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: number;
  en_venta: boolean;
  destacada: boolean;
  categoria: number;
  usuario: number;
  stock: number;
}

interface Photo {
  id: number;
  url: string;
}

interface Props {
  obra: Obra;
}

export default function MostrarObra({ obra }: Props) {
  const [fotos, setFotos] = useState<Photo[]>([]);
  const [contentTypeObra, setContentTypeObra] = useState<number | null>(null);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>('');
  const [loadingFotos, setLoadingFotos] = useState<boolean>(false);

  useEffect(() => {
    const fetchContentTypeObra = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/obra-content-type/');
        const data = await res.json();
        setContentTypeObra(data.content_type_id);
      } catch (err) {
        console.error('Error al obtener content type de Obra:', err);
      }
    };

    fetchContentTypeObra();
  }, []);

  useEffect(() => {
    const fetchFotos = async () => {
      if (contentTypeObra === null) return;

      setLoadingFotos(true);

      try {
        const res = await fetch(
          `http://localhost:8000/api/photos/?object_id=${obra.id}&content_type=${contentTypeObra}`
        );

        if (!res.ok) {
          throw new Error(`Error al obtener fotos: ${res.status}`);
        }

        const data = await res.json();
        setFotos(data);

        if (data.length > 0 && data[0].url && data[0].url !== '') {
          setImagenPrincipal(data[0].url);
        } else {
          setImagenPrincipal(
            obra.imagen_url && obra.imagen_url !== ''
              ? obra.imagen_url
              : 'https://via.placeholder.com/600x400?text=Sin+imagen'
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFotos(false);
      }
    };

    if (contentTypeObra !== null) {
      fetchFotos();
    }
  }, [contentTypeObra, obra.id]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg space-y-6">
      
      {/* Layout en 2 columnas */}
<div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">

  {/* Columna de imágenes con MÁS ancho */}
  <div className="w-full">
    {/* Imagen principal bien grande */}
    <div className="flex justify-center items-center bg-white p-2 rounded shadow mb-4">
      {loadingFotos ? (
        <p className="text-center text-gray-500">Cargando fotos...</p>
      ) : (
        <img
          src={
            imagenPrincipal && imagenPrincipal !== ''
              ? imagenPrincipal
              : 'https://via.placeholder.com/600x400?text=Sin+imagen'
          }
          alt={obra.titulo}
          className="w-full max-h-[800px] object-contain"
        />
      )}
    </div>

    {/* Thumbnails MÁS GRANDES */}
    {fotos.length > 0 && (
      <div className="flex space-x-3 mb-4 overflow-x-auto px-1">
        {fotos.map((foto) => (
          <img
            key={foto.id}
            src={
              foto.url && foto.url !== ''
                ? foto.url
                : 'https://via.placeholder.com/150?text=Sin+foto'
            }
            alt={`Miniatura`}
            onClick={() => {
              if (foto.url && foto.url !== '') {
                setImagenPrincipal(foto.url);
              }
            }}
            className={`w-32 h-32 object-cover rounded cursor-pointer border-2 ${
              imagenPrincipal === foto.url ? 'border-black' : 'border-gray-300'
            }`}
          />
        ))}
      </div>
    )}
  </div>

</div>

      {/* Sección de comentarios (debajo de todo) */}
      <div className="mt-6">
        <ComentariosObra obraId={obra.id} />
      </div>

    </div>
  );
}
