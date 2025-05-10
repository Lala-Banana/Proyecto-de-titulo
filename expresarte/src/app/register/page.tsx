'use client';

import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex bg-cover bg-center relative"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1507643179773-3e975d7ac515?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
      }}
    >
      {/* Capa oscura */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Texto de bienvenida */}
      <div className="absolute top-16 left-6 sm:left-10 md:left-16 z-10 text-white max-w-xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-md">
          ¡Únete a ExpresArte!
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl drop-shadow-sm">
          Crea tu cuenta para comenzar a compartir, vender o descubrir arte.
        </p>
      </div>

      {/* Contenedor del formulario de registro */}
      <div className="flex w-full justify-center md:justify-end items-center md:items-stretch z-10">
        <div className="w-full md:w-1/3 h-full">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
