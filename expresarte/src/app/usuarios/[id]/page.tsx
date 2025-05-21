'use client';

import React from 'react';
import NavbarCombined from '@/app/components/Navbar';
import UsuarioPublicoId from '@/app/components/UsuarioPublicoId';
import Footer from '@/app/components/Footer';

export default function UsuarioPerfilPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <NavbarCombined />

      <main className="flex-grow">
        <UsuarioPublicoId />
      </main>
      <Footer />
    </div>
  );
}
