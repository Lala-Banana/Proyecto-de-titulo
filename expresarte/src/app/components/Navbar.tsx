'use client';

import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="https://img.freepik.com/foto-gratis/hermosa-composicion-collage-vintage_23-2149479769.jpg" width={32} height={32} alt="ExpresArte Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            ExpresArte
          </span>
        </a>
        <div className="hidden md:flex space-x-4">
          <a href="/" className="text-blue-700 dark:text-blue-500 hover:underline">
            Home
          </a>
          <a href="/about" className="text-white hover:underline">
            About
          </a>
          <a href="/perfil" className="text-white hover:underline">
            Perfil
          </a>
        </div>
        <div className="flex items-center space-x-3">
          <Image
            className="rounded-full"
            src="/profile.jpg"
            width={32}
            height={32}
            alt="User"
          />
        </div>
      </div>
    </nav>
  );
}
