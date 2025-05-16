export async function fetchConAuth(
  url: string,
  token: string,
  setError: (msg: string) => void
): Promise<any | null> {
  if (!token) {
    setError('❌ No hay token disponible');
    return null;
  }

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 401) {
      setError('🔐 Necesitas iniciar sesión como administrador para acceder a esta sección.');
      return null;
    }

    if (res.status === 403) {
      setError('⛔ No tienes permisos para acceder a esta sección.');
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`❌ Error inesperado (${res.status}):`, errorText);
      setError('❌ Error inesperado al obtener datos.');
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('❌ Error de red:', err);
    setError('❌ Error de red al intentar conectar con el servidor.');
    return null;
  }
}
