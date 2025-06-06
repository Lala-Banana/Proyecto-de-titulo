'use client';

import { useEffect, useState } from 'react';

interface Comentario {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    foto_url: string;
  };
  contenido: string;
  fecha: string;
}

interface Props {
  obraId: number;
}

export default function ComentariosObra({ obraId }: Props) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');

  // Leer token desde localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Cargar comentarios
  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/obras/${obraId}/comentarios/`);
        const data = await res.json();
        setComentarios(data);
      } catch (error) {
        console.error('Error al obtener comentarios:', error);
      }
    };

    fetchComentarios();
  }, [obraId]);

  // Enviar nuevo comentario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      console.error('No se encontró token');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/comentarios/crear/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          obra: obraId,
          contenido: nuevoComentario,
        }),
      });

      if (res.ok) {
        const comentarioCreado = await res.json();
        setComentarios([comentarioCreado, ...comentarios]);
        setNuevoComentario('');
      } else {
        console.error('Error al crear comentario', res.status);
      }
    } catch (error) {
      console.error('Error al enviar comentario:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h3 className="text-lg font-bold mb-2">Comentarios</h3>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          className="w-full border p-2 rounded mb-2"
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder="Escribe un comentario..."
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Enviar comentario
        </button>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {comentarios.map((comentario) => (
          <div key={comentario.id} className="flex items-start space-x-3">
            <img
              src={comentario.usuario.foto_url || '/default-avatar.png'}
              alt={comentario.usuario.nombre}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{comentario.usuario.nombre}</p>
              <p className="text-sm text-gray-600">{new Date(comentario.fecha).toLocaleString()}</p>
              <p className="mt-1">{comentario.contenido}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
