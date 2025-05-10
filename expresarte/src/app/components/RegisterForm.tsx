'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession, signOut } from 'next-auth/react';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export default function RegisterForm() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const response = await fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email: correo, password }),
    });

    if (!response.ok) {
      setError('Error al registrar. Inténtalo nuevamente.');
      return;
    }

    router.push('/login');
  };

  const handleGoogleLogin = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    await signOut({ redirect: false });

    const res = await signIn('google', { redirect: false });
    if (res?.error) throw new Error(res.error);

    let session = null;
    for (let i = 0; i < 10; i++) {
      session = await getSession();
      if (session?.user?.email) break;
      await new Promise((r) => setTimeout(r, 300));
    }

    const { user } = session || {};
    if (!user?.email) return;

    await fetch('http://localhost:8000/api/usuarios/google/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        nombre: user.name || '',
        foto_url: user.image || '',
      }),
    });

    const tokenRes = await fetch('http://localhost:8000/api/token_google/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error || 'No se generaron los tokens');

    localStorage.setItem('access_token', tokenData.access);
    localStorage.setItem('refresh_token', tokenData.refresh);
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full bg-white/65 backdrop-blur-lg text-black flex items-center justify-center px-4 lg:justify-end lg:px-24">
      <div className="w-full max-w-xl px-6 sm:px-10 py-12 sm:py-20 lg:max-w-lg lg:ml-auto lg:mr-0 lg:justify-end">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 tracking-wide text-center lg:text-left">Crear cuenta</h1>

        {error && <p className="text-red-500 text-base text-center lg:text-left mb-6">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 text-base sm:text-lg focus:outline-none focus:border-white"
              placeholder="Nombre completo"
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 text-base sm:text-lg focus:outline-none focus:border-white"
              placeholder="Correo electrónico"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 text-base sm:text-lg focus:outline-none focus:border-white"
              placeholder="Contraseña"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 text-base sm:text-lg focus:outline-none focus:border-white"
              placeholder="Confirmar contraseña"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-white text-black text-base sm:text-lg font-semibold rounded-lg hover:bg-gray-300 transition-all"
          >
            REGISTRARSE
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white text-black flex items-center justify-center gap-2 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
          >
            <FcGoogle className="text-2xl" /> Registrar con Google
          </button>
        </form>
      </div>
    </div>
  );
}
