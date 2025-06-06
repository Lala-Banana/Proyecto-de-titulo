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

  // Obtener content type
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

  // Obtener fotos
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
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
      
      {/* Columna de imágenes */}
      <div className="md:w-1/2">
        {/* Imagen principal */}
        <div className="mb-4">
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
              className="w-full h-auto rounded object-contain"
            />
          )}
        </div>

        {/* Thumbnails */}
        {fotos.length > 0 && (
          <div className="flex space-x-2 mb-4 overflow-x-auto">
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
                className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                  imagenPrincipal === foto.url ? 'border-black' : 'border-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Columna de detalles y comentarios */}
      <div className="md:w-1/2 flex flex-col space-y-4">
        {/* Datos de la publicación */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{obra.titulo}</h1>
          <p className="text-gray-700 mb-4">{obra.descripcion}</p>

          {obra.en_venta && (
            <>
              <p className="text-lg font-semibold mb-2">💰 Precio: ${obra.precio}</p>
              <p className="text-sm text-gray-600">Stock disponible: {obra.stock}</p>
            </>
          )}
        </div>

        {/* Sección de comentarios */}
        <ComentariosObra obraId={obra.id} />
      </div>
    </div>
  );
}
