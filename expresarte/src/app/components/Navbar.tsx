// ✅ NAVBAR ADAPTADO CON CAMBIO DE COLOR
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/context/UserContext';

const Navbar = () => {
  const { user, loading, logout } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return null;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled ? 'bg-white shadow text-black' : 'bg-transparent text-white'
    }`}> 
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="https://plus.unsplash.com/premium_vector-1718634329496-83c7a9db4913?q=80&w=2650&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Logo" width={36} height={36} />
          <span className="text-2xl font-bold">ExpresArte</span>
        </Link>
        <div className="flex items-center gap-4" ref={dropdownRef}>
          {user ? (
            <>
              <Image
                src={user.foto_url || '/default-avatar.png'}
                alt="User"
                width={36}
                height={36}
                className="rounded-full cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-4 mt-14 w-48 bg-white rounded-md shadow-lg text-black z-50">
                  <div className="p-4 border-b">
                    <p className="text-sm font-semibold">{user.nombre}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <ul className="py-2">
                    <li>
                      <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                        Perfil
                      </Link>
                    </li>
                    <li>
                      <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Iniciar sesión
              </Link>
              <Link href="/register" className="border border-blue-600 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50">
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
