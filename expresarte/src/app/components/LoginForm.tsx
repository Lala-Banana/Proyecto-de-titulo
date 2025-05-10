'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession, signOut } from 'next-auth/react';
import { FaUser, FaLock } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export default function LoginForm() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password }),
      });

      const data = await response.json();
      console.log('📦 Respuesta del login:', data);

      if (!response.ok) {
        setError(data.detail || 'Credenciales inválidas');
        return;
      }

      const access = data.tokens?.access || data.access;
      const refresh = data.tokens?.refresh || data.refresh;

      if (typeof access === 'string' && typeof refresh === 'string') {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        console.log('✅ Tokens guardados correctamente');
          await signOut({ redirect: false }); // 🔁 limpia la sesión anterior de Google
        window.location.href = '/';
      } else {
        setError('Tokens inválidos o incompletos');
        console.warn('⚠️ Tokens faltantes:', data);
      }
    } catch (err: any) {
      console.error('❌ Error de conexión:', err);
      setError('Error de red o conexión con el servidor');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    await signOut({ redirect: false }); // limpia sesión previa

    const res = await signIn('google', { redirect: false });
    if (res?.error) {
      console.error('❌ Error con Google SignIn:', res.error);
      setError('Error al iniciar sesión con Google');
      return;
    }

    // Esperar la sesión generada por NextAuth (máximo 10 intentos)
    let session = null;
    for (let i = 0; i < 10; i++) {
      session = await getSession();
      console.log(`🕐 Intento sesión ${i + 1}:`, session);
      if (session?.user?.email && (session as any).access_token) break;
      await new Promise((r) => setTimeout(r, 300));
    }

    if (
      session &&
      (session as any).access_token &&
      (session as any).refresh_token
    ) {
      localStorage.setItem('access_token', (session as any).access_token);
      localStorage.setItem('refresh_token', (session as any).refresh_token);
      console.log('✅ Tokens de Google guardados');
      window.location.href = '/';
    } else {
      console.error('❌ Tokens no disponibles en sesión:', session);
      setError('No se pudieron recuperar los tokens desde la sesión de Google');
    }
  };

  return (
    <div className="min-h-screen w-full bg-white/70 backdrop-blur-lg text-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Iniciar sesión</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-4 top-3.5 text-gray-400 text-lg" />
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-white"
              placeholder="Correo electrónico"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-3.5 text-gray-400 text-lg" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-white"
              placeholder="Contraseña"
            />
          </div>

          <div className="flex justify-between text-sm text-gray-700">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="accent-black" />
              <span>Recuérdame</span>
            </label>
            <a href="#" className="text-gray-700 hover:text-black underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
          >
            INICIAR SESIÓN
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white text-black flex items-center justify-center gap-2 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
          >
            <FcGoogle className="text-2xl" /> Iniciar con Google
          </button>
        </form>
      </div>
    </div>
  );
}
