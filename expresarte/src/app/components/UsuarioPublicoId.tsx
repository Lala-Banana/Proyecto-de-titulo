'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PerfilUsuario from './PerfilUsuario';

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

export default function UsuarioPublicoId() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [obrasEnVenta, setObrasEnVenta] = useState<Obra[]>([]);
  const [obrasNoVenta, setObrasNoVenta] = useState<Obra[]>([]);
  const [activeTab, setActiveTab] = useState<'venta' | 'noVenta'>('venta');
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Cargar perfil público
  useEffect(() => {
    async function fetchPerfil() {
      if (!id) {
        setError('ID de usuario inválido');
        setLoadingUser(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:8000/api/perfil-publico/${id}/`, {
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) {
          throw new Error(`Error al cargar perfil: ${await res.text()}`);
        }
        const data: User = await res.json();
        setUser(data);
      } catch (err: any) {
        console.error('❌ Error fetching perfil:', err);
        setError(err.message);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchPerfil();
  }, [id]);

  // 2. Cargar obras cuando el perfil esté listo
  useEffect(() => {
    if (!user) return;
    async function fetchObras() {
      try {
        const userId = user!.id;
        const res = await fetch(`http://localhost:8000/api/usuarios/${userId}/obras/`, {
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) {
          throw new Error(`Error al cargar obras: ${await res.text()}`);
        }
        const lista: Obra[] = await res.json();
        setObrasEnVenta(lista.filter(o => o.en_venta));
        setObrasNoVenta(lista.filter(o => !o.en_venta));
      } catch (err: any) {
        console.error('❌ Error fetching obras:', err);
        setError(err.message);
      }
    }

    fetchObras();
  }, [user]);

  if (loadingUser) return <p className="text-center mt-20">Cargando usuario…</p>;
  if (error) return <p className="text-center mt-20 text-red-600">{error}</p>;
  if (!user) return <p className="text-center mt-20">Usuario no encontrado.</p>;

  return (
    <div className="relative min-h-screen">
      {/* Fondo posicion absoluto cubriendo todo el viewport */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={ user.fondo ? { backgroundImage: `url(${user.fondo})` } : {} }
      />
      {/* Contenido encima del fondo */}
      <br />
      <br />
      <div className="relative z-10">
        <PerfilUsuario
          user={user}
          token=""
          obrasEnVenta={obrasEnVenta}
          obrasNoVenta={obrasNoVenta}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOwner={false}
        />
      </div>
    </div>
  );
}
