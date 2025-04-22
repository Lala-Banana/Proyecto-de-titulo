'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
    const router = useRouter();
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('http://localhost:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: correo, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Error al iniciar sesión');

            localStorage.setItem('access_token', data.tokens.access);
            localStorage.setItem('refresh_token', data.tokens.refresh);
            router.push('/perfil');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const res = await signIn('google', { redirect: false });
            if (res?.error) throw new Error(res.error);

            const sessionRes = await fetch('/api/auth/session');
            const session = await sessionRes.json();

            const { user } = session;
            if (!user?.email) throw new Error('No se obtuvo el correo del usuario');

            // 1. Guardar o actualizar en backend
            await fetch('http://localhost:8000/api/usuarios/google/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    nombre: user.name || '',
                    foto_url: user.image || '',
                }),
            });

            // 2. Obtener tokens JWT desde backend
            const tokenRes = await fetch('http://localhost:8000/api/token_google/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email }),
            });

            const tokenData = await tokenRes.json();
            if (!tokenRes.ok) throw new Error(tokenData.error || 'No se generaron los tokens');

            localStorage.setItem('access_token', tokenData.access);
            localStorage.setItem('refresh_token', tokenData.refresh);
            router.push('/perfil');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar con Google');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                <form onSubmit={handleLogin}>
                    <h1 className="text-black text-2xl font-bold mb-4 text-center">Iniciar sesión</h1>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <label className="block mb-2 text-black">
                        Correo:
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                            className="w-full p-2 mt-1 border rounded"
                        />
                    </label>

                    <label className="block mb-4 text-black">
                        Contraseña:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 mt-1 border rounded"
                        />
                    </label>

                    <button
                        type="submit"
                        className="bg-black text-white px-4 py-2 w-full rounded hover:bg-gray-800"
                    >
                        Iniciar sesión
                    </button>
                </form>

                {/* Botón de Google funcional */}
                <button
                    onClick={handleGoogleLogin}
                    className="bg-red-600 text-white px-4 py-2 w-full rounded hover:bg-red-700 mt-4"
                >
                    Iniciar con Google
                </button>
            </div>
        </div>
    );
}
