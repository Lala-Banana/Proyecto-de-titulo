'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MostrarObra from '../../components/MostrarObra';

interface Obra {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
  precio: string;
  en_venta: boolean;
  destacada: boolean;
  categoria: number;
  usuario: number;
}

export default function ObraPage() {
  const { id } = useParams();
  const [obra, setObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intentos = 0;
    const maxIntentos = 15;

    const esperarToken = async (): Promise<string | null> => {
      return new Promise((resolve) => {
        const comprobar = () => {
          const token = localStorage.getItem('access_token');
          console.log(`🔄 Intento ${intentos + 1}: token =`, token);
          intentos++;
          if (token || intentos >= maxIntentos) {
            resolve(token);
          } else {
            setTimeout(comprobar, 300); // intenta cada 300ms
          }
        };
        comprobar();
      });
    };

    const fetchObra = async () => {
      const token = await esperarToken();

      if (!token) {
        console.warn('⛔ Token no disponible después de varios intentos');
        setLoading(false);
        return;
      }

      try {
        console.log('📦 Fetching obra con token:', token);
        const res = await fetch(`http://localhost:8000/api/obras/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Error al obtener la obra');

        const data = await res.json();
        setObra(data);
      } catch (error) {
        console.error('❌ Error al cargar obra:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchObra();
  }, [id]);

  if (loading) return <p className="text-center mt-20">Cargando obra...</p>;
  if (!obra) return <p className="text-center mt-20 text-red-600">Obra no encontrada.</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <MostrarObra obra={obra} />
    </div>
  );
}
