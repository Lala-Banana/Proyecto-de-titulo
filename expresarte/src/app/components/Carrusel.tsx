'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const slides = [
  {
    id: 1,
    title: 'Arte para el Alma',
    subtitle: 'ExpresArte Gallery',
    description: 'Explora emociones a través de cada pincelada y textura.',
    imageUrl:
      'https://images.unsplash.com/photo-1534511902651-6ab0ce131f2a?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3',
    link: '/categoria/Emocional',
    discount: '50% Off',
  },
  {
    id: 2,
    title: 'Colores de la Tierra',
    subtitle: 'Arte Natural',
    description: 'Conecta con la naturaleza a través de nuestras obras.',
    imageUrl:
      'https://images.unsplash.com/photo-1605429523419-d828acb941d9?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    link: '/categoria/Naturaleza',
    discount: '30% Off',
  },
  {
    id: 3,
    title: 'Visiones Urbanas',
    subtitle: 'Ciudad y Cultura',
    description: 'Descubre la belleza oculta en lo cotidiano.',
    imageUrl:
      'https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    link: '/categoria/Urbano',
    discount: '20% Off',
  },
];

export default function Carrusel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-screen overflow-hidden">
      <div className="w-full h-full relative">
        {slides.map((slide, index) => (
          <Link
            key={slide.id}
            href={slide.link}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? ' z-20' : 'opacity-0 z-10'
            }`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover"
              priority
            />
            {/* Overlay semi-transparente */}
            <div className="absolute inset-0 bg-opacity-30 z-10" />
            {/* Texto centrado */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4">
              <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-1">
                {slide.subtitle}
              </p>
              <h2 className="text-lg sm:text-2xl md:text-4xl font-bold text-white whitespace-nowrap">
                {slide.title}
              </h2>
              <p className="mt-2 text-sm sm:text-base md:text-lg text-gray-200 max-w-lg">
                {slide.description}
              </p>
              <div className="mt-4">
                <button className="border border-white px-4 py-1 sm:px-6 sm:py-2 rounded text-xs sm:text-sm md:text-base hover:bg-white hover:text-black transition">
                  Ver más
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        onClick={goToPrev}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 sm:p-3 rounded-full"
      >
        <FaChevronLeft className="text-sm sm:text-base" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 sm:p-3 rounded-full"
      >
        <FaChevronRight className="text-sm sm:text-base" />
      </button>

      {/* Indicadores (dots) */}
      <div className="absolute bottom-2 sm:bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
              index === current ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
