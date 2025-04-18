// src/services/apiServices.ts

export interface LoginData {
    email: string;
    password: string;
  }
  
  export async function loginUser(data: LoginData) {
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
        throw new Error(result.detail || 'Error al iniciar sesión');
      }
  
      return result; // { access, refresh }
    } catch (error: any) {
      throw new Error(error.message || 'Fallo de conexión');
    }
  }
  