'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const slides = [
  {
    id: 1,
    title: 'Arte para el Alma',
    subtitle: 'ExpresArte Gallery',
    description: 'Explora emociones a través de cada pincelada y textura.',
    imageUrl: 'https://images.unsplash.com/photo-1534511902651-6ab0ce131f2a?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3',
    link: '/categorias/Emocional',
  },
  {
    id: 2,
    title: 'Colores de la Tierra',
    subtitle: 'Arte Natural',
    description: 'Conecta con la naturaleza a través de nuestras obras.',
    imageUrl: 'https://images.unsplash.com/photo-1605429523419-d828acb941d9?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3',
    link: '/categorias/Naturaleza',
  },
  {
    id: 3,
    title: 'Visiones Urbanas',
    subtitle: 'Ciudad y Cultura',
    description: 'Descubre la belleza oculta en lo cotidiano.',
    imageUrl: 'https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    link: '/categorias/Urbano',
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

  const goToSlide = (index: number) => setCurrent(index);
  const goToNext = () => setCurrent((prev) => (prev + 1) % slides.length);
  const goToPrev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[350px] sm:h-[450px] md:h-[600px] overflow-hidden rounded-xl shadow-lg">
      {slides.map((slide, index) => (
        <Link
          href={slide.link}
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-opacity-30 z-10" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center z-20 px-4 w-full">
            <p className="text-xs sm:text-sm font-light text-gray-300 mb-2">{slide.subtitle}</p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold drop-shadow text-glitch">
              {slide.title}
            </h2>
            <p className="mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-gray-200 px-2 sm:px-6 md:px-0">
              {slide.description}
            </p>
            <div className="mt-3 md:mt-4 flex justify-center">
              <button className="border border-white px-4 md:px-6 py-1 md:py-2 rounded hover:bg-white transition text-sm md:text-base">
                Ver más
              </button>
            </div>
          </div>
        </Link>
      ))}

      {/* Flechas */}
      <button
        onClick={goToPrev}
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-30 text-white p-2 md:p-3 rounded-full"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-30 text-white p-2 md:p-3 rounded-full"
      >
        <FaChevronRight />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
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
