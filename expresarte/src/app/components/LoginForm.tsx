'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession, signOut } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function LoginForm() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al iniciar sesión');

      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      setTimeout(() => {
        window.location.reload();
      }, 100);

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
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

    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/usuarios/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        nombre: user.name || '',
        foto_url: user.image || '',
      }),
    });

    const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/token_google/`, {
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
    <div className="bg-gray-950 text-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Sign in</h1>

      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-sm">Email</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className="w-full px-4 py-2 mt-1 rounded-md bg-gray-800 border border-gray-700 text-white"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 mt-1 rounded-md bg-gray-800 border border-gray-700 text-white"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-white text-gray-900 font-semibold rounded hover:bg-gray-200"
        >
          Sign in
        </button>
      </form>

      <div className="my-4 text-center text-gray-500 text-sm">or</div>

      <div className="space-y-3">
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full py-2 bg-black border border-gray-600 rounded hover:bg-gray-800"
        >
          <FcGoogle className="mr-2" size={20} />
          Sign in with Google
        </button>

        <button
          className="flex items-center justify-center w-full py-2 bg-black border border-gray-600 rounded hover:bg-gray-800"
        >
          <FaFacebook className="mr-2 text-blue-500" size={20} />
          Sign in with Facebook
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <a href="#" className="text-white font-semibold underline">
          Sign up
        </a>
      </p>
    </div>
  );
}
