'use client';

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

export default function MostrarObra({ obra }: { obra: Obra }) {
  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
      <img src={obra.imagen_url} alt={obra.titulo} className="w-full h-auto rounded mb-4" />
      <h1 className="text-3xl font-bold mb-2">{obra.titulo}</h1>
      <p className="text-gray-700 mb-4">{obra.descripcion}</p>
      <p className="text-lg font-semibold mb-2">💰 Precio: ${obra.precio}</p>
      <p className="text-sm text-gray-600">
        Estado: {obra.en_venta ? 'En venta' : 'No disponible'}
      </p>
    </div>
  );
}
