'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/app/api/apiServices';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
    const router = useRouter();
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await loginUser({ email: correo, password });

            // ✅ Guardar los tokens correctamente
            localStorage.setItem('access_token', data.tokens.access);
            localStorage.setItem('refresh_token', data.tokens.refresh);

            // ✅ Redirigir al perfil
            router.push('/perfil');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
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

                {/* Botón de Google por fuera del form */}
                <button
                    onClick={() =>
                        signIn('google', { callbackUrl: '/perfil' })
                    }
                    className="bg-red-600 text-white px-4 py-2 w-full rounded hover:bg-red-700 mt-4"
                >
                    Iniciar con Google
                </button>
            </div>
        </div>
    );
}
