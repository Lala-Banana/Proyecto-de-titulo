'use client';

import Image from 'next/image';
import Navbar from './components/Navbar';
import CardDelProducto from './components/CardDelProducto';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="py-16 flex justify-center">
        <CardDelProducto />
      </div>
    </>
  );
}
