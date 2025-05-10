import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ObrasPorCategoria = () => {
  const [obras, setObras] = useState<any[]>([]); // Usamos any para evitar el problema de tipos
  const [loading, setLoading] = useState(true);
  const { query } = useRouter();
  const { slug } = query;

  useEffect(() => {
    if (slug) {
      const fetchObras = async () => {
        const response = await fetch(`/api/categorias/${slug}/obras`);
        const data = await response.json();  // Respuesta sin tipo específico
        setObras(data);  // Aquí simplemente usamos los datos sin procesarlos
        setLoading(false);
      };

      fetchObras();
    }
  }, [slug]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Obras en la categoría: {slug}</h2>
      <ul>
        {obras.map((obra: any) => (  // Usamos 'any' para evitar errores de tipo
          <li key={obra.id}>
            <h3>{obra.titulo}</h3>
            <p>{obra.descripcion}</p>
            {/* Aquí puedes agregar más propiedades según la respuesta de la API */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ObrasPorCategoria;
