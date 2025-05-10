// src/services/apiServices.ts

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  tokens: {
    access: string;
    refresh: string;
  };
}

// 🔐 LOGIN MANUAL
export async function loginUser(data: LoginData): Promise<TokenResponse> {
  try {
    const res = await fetch('http://localhost:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('❌ Error al iniciar sesión:', result);
      throw new Error(result.detail || 'Credenciales inválidas');
    }

    // ✅ Guardar tokens si existen
    if (result.tokens?.access && result.tokens?.refresh) {
      localStorage.setItem('access_token', result.tokens.access);
      localStorage.setItem('refresh_token', result.tokens.refresh);
      console.log('✅ Tokens guardados en localStorage');
    } else {
      console.warn('⚠️ Tokens no recibidos correctamente del backend:', result);
      throw new Error('Tokens faltantes');
    }

    return result;
  } catch (error: any) {
    console.error('❌ Fallo de conexión:', error);
    throw new Error(error.message || 'Fallo de conexión con el servidor');
  }
}
