'use client';

import Categorias from '@/app/components/Categorias';
import NavbarCombined from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

export default function CategoriasPage() {
  return (
    <>
      <NavbarCombined />
      
      <Categorias />
      <Footer />
    </>
  );
}
