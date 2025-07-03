"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession, signOut } from "next-auth/react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

type FieldErrors = { [key: string]: string[] };

export default function RegisterForm() {
  const [nombre, setNombre] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const router = useRouter();
  const fotodefault =
    "https://us.123rf.com/450wm/tuktukdesign/tuktukdesign1608/tuktukdesign160800036/61010819-icono-de-usuario-hombre-perfil-hombre-de-negocios-avatar-ilustraci%C3%B3n-vectorial-persona-glifo.jpg?ver=6";

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({
        password: ["Las contraseñas no coinciden"],
        confirmPassword: ["Las contraseñas no coinciden"],
      });
      setError("Las contraseñas no coinciden");
      return;
    }

    const response = await fetch("http://localhost:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        email: correo,
        password,
        foto_url: fotodefault,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Si el backend entrega errores de campos, los mostramos
      if (typeof data === "object" && data !== null) {
        setFieldErrors(data as FieldErrors);
        if ("non_field_errors" in data)
          setError((data.non_field_errors as string[]).join(" "));
        else if ("detail" in data) setError(data.detail as string);
        else setError("Corrige los campos indicados.");
      } else {
        setError("Error al registrar. Inténtalo nuevamente.");
      }
      return;
    }

    // Registro exitoso
    router.push("/login");
  };

  const handleGoogleLogin = async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    await signOut({ redirect: false });

    const res = await signIn("google", { redirect: false });
    if (res?.error) throw new Error(res.error);

    let session = null;
    for (let i = 0; i < 10; i++) {
      session = await getSession();
      if (session?.user?.email) break;
      await new Promise((r) => setTimeout(r, 300));
    }

    const { user } = session || {};
    if (!user?.email) return;

    await fetch("http://localhost:8000/api/usuarios/google/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        nombre: user.name || "",
        foto_url: user.image || "",
      }),
    });

    const tokenRes = await fetch("http://localhost:8000/api/token_google/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok)
      throw new Error(tokenData.error || "No se generaron los tokens");

    localStorage.setItem("access_token", tokenData.access);
    localStorage.setItem("refresh_token", tokenData.refresh);
    router.push("/");
  };

  // Muestra errores específicos bajo cada input
  const errorMsg = (field: string) =>
    fieldErrors[field] && (
      <div className="text-red-500 text-xs mt-1">
        {fieldErrors[field].join(" ")}
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-white/65 backdrop-blur-lg text-black flex items-center justify-center px-4 lg:justify-end lg:px-24">
      <div className="w-full max-w-xl px-6 sm:px-10 py-12 sm:py-20 lg:max-w-lg lg:ml-auto lg:mr-0 lg:justify-end">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 tracking-wide text-center lg:text-left">
          Crear cuenta
        </h1>

        {error && (
          <p className="text-red-500 text-base text-center lg:text-left mb-6">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setFieldErrors((prev) => {
                  const { nombre, ...rest } = prev;
                  return rest;
                });
              }}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 text-base sm:text-lg focus:outline-none focus:border-white"
              placeholder="Nombre completo"
            />
            {errorMsg("nombre")}
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                setFieldErrors((prev) => {
                  const { email, ...rest } = prev;
                  return rest;
                });
              }}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 text-base sm:text-lg focus:outline-none focus:border-white"
              placeholder="Correo electrónico"
            />
            {errorMsg("email")}
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => {
                  const { password, ...rest } = prev;
                  return rest;
                });
              }}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 text-base sm:text-lg focus:outline-none focus:border-white"
              placeholder="Contraseña"
            />
            {errorMsg("password")}
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFieldErrors((prev) => {
                  const { confirmPassword, ...rest } = prev;
                  return rest;
                });
              }}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/60 border border-gray-500 text-white placeholder-gray-400 text-base sm:text-lg focus:outline-none focus:border-white"
              placeholder="Confirmar contraseña"
            />
            {errorMsg("confirmPassword")}
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
          
          <p className="text-sm text-gray-600 text-center">
            ¿tienes cuenta?{' '}
            <a href="/login" className="text-black font-semibold hover:underline">
              Inicia sesión
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
