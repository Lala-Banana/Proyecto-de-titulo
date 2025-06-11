'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthUniversal } from '@/hooks/useAuthUniversal';
import { FaBars } from 'react-icons/fa';

interface Props {
  onToggleSidebar?: () => void; // solo se usa en el admin
}

const Navbar = ({ onToggleSidebar }: Props) => {
  const { user, logout, loading } = useAuthUniversal();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Cierra el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  if (loading) return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Botón sidebar en admin (solo se muestra si existe prop) */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden text-gray-700 text-xl focus:outline-none"
            >
              <FaBars />
            </button>
          )}

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="https://plus.unsplash.com/premium_vector-1718634329496-83c7a9db4913?q=80&w=2650&auto=format&fit=crop"
              alt="Logo"
              width={36}
              height={36}
            />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-black">ExpresArte</span>
          </Link>
        </div>

        {/* enlaces + buscador (solo en pantallas ≥ md) */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/categorias" className="text-black hover:underline text-sm">
            Categorías
          </Link>
          <Link href="/publicaciones" className="text-black hover:underline text-sm">
            Publicaciones
          </Link>
          <Link href="/usuarios" className="text-black hover:underline text-sm">
            Usuarios
          </Link>
        </div>

        {/* Usuario o botones de sesión */}
        <div className="relative flex items-center gap-4 bg-gray-100 rounded-full px-2 py-1">
          {user ? (
            <>
              <Image
                src={
                  user.foto_url ||
                  'https://us.123rf.com/450wm/tuktukdesign/tuktukdesign1608/tuktukdesign160800036/61010819-icono-de-usuario-hombre-perfil-hombre-de-negocios-avatar-ilustraci%C3%B3n-vectorial-persona-glifo.jpg?ver=6'
                }
                alt="User"
                width={36}
                height={36}
                className="rounded-full cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-56 bg-white border rounded-md shadow-lg text-black z-50"
                >
                  {/* Info usuario */}
                  <div className="p-4 border-b">
                    <p className="text-sm font-semibold">{user.nombre}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <ul className="py-2">
                    <li>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-200 text-sm"
                      >
                        Perfil
                      </Link>
                    </li>
                    {user.is_staff && (
                      <li>
                        <Link
                          href="/admin/obras"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 hover:bg-gray-200 text-sm"
                        >
                          Admin
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-200"
                      >
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>

                  {/* Enlaces + buscador (solo móviles) */}
                  <div className="md:hidden px-4 py-3 flex flex-col gap-2">
                    <Link href="/categorias" onClick={() => setDropdownOpen(false)} className="text-sm hover:underline">
                      Categorías
                    </Link>
                    <Link href="/publicaciones" onClick={() => setDropdownOpen(false)} className="text-sm hover:underline">
                      Publicaciones
                    </Link>
                    <Link href="/usuarios" onClick={() => setDropdownOpen(false)} className="text-sm hover:underline">
                      Usuarios
                    </Link>
                    <form
                      onSubmit={(e) => {
                        handleSearchSubmit(e);
                        setDropdownOpen(false);
                      }}
                      className="mt-2"
                    >
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="border border-blue-600 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
