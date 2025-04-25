'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, loading, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Verifica si aún se está cargando el usuario
  if (loading) {
    console.log('⏳ Cargando usuario desde contexto...');
    return null; // o un spinner / navbar placeholder si lo deseas
  }

  console.log('👤 USER en Navbar:', user);

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image
            src="https://img.freepik.com/foto-gratis/hermosa-composicion-collage-vintage_23-2149479769.jpg"
            width={32}
            height={32}
            alt="ExpresArte Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            ExpresArte
          </span>
        </Link>

        {/* Links de navegación */}
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="text-blue-700 dark:text-blue-500 hover:underline">
            Home
          </Link>
          <Link href="/about" className="text-white hover:underline">
            About
          </Link>
        </div>

        {/* Menú del usuario */}
        <div className="relative" ref={dropdownRef}>
          {user ? (
            <>
              <Image
                className="rounded-full cursor-pointer"
                src={user.foto_url || "/default-avatar.png"}
                width={36}
                height={36}
                alt="User"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <div className="p-4 border-b">
                    <p className="text-sm font-medium text-gray-800">{user.nombre}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <ul className="py-2">
                    <li>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Perfil
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
