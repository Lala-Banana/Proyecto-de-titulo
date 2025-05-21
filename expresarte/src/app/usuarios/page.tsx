'use client';

import React from 'react';
import NavbarCombined from '@/app/components/Navbar';
import UsuariosPublicos from '@/app/components/UsuariosPublicos';
import Footer from '@/app/components/Footer';

export default function UsuariosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <NavbarCombined />

      <main className="flex-grow">
        <UsuariosPublicos />
      </main>

      <Footer />
    </div>
  );
}
