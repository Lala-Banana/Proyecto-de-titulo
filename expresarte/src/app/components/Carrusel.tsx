// ✅ Carrusel con transición infinita suave y botones
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
    imageUrl: 'https://images.unsplash.com/photo-1534511902651-6ab0ce131f2a?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3',
    link: '/categoria/emocional',
    discount: '50% Off',
  },
  {
    id: 2,
    title: 'Colores de la Tierra',
    subtitle: 'Arte Natural',
    description: 'Conecta con la naturaleza a través de nuestras obras.',
    imageUrl: 'https://images.unsplash.com/photo-1605429523419-d828acb941d9?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    link: '/categoria/naturaleza',
    discount: '30% Off',
  },
  {
    id: 3,
    title: 'Visiones Urbanas',
    subtitle: 'Ciudad y Cultura',
    description: 'Descubre la belleza oculta en lo cotidiano.',
    imageUrl: 'https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    link: '/categoria/urbano',
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
    <div className="relative w-full h-screen overflow-hidden">
      <div className="w-full h-full relative">
        {slides.map((slide, index) => (
          <Link
            key={slide.id}
            href={slide.link}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-20' : 'opacity-0 z-10'}`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-opacity-30 z-10" />
            <div className="absolute top-1/2 left-10 transform -translate-y-1/2 text-white max-w-md z-20">
              <p className="text-sm font-light mb-2">{slide.subtitle}</p>
              <h2 className="text-5xl font-bold drop-shadow-lg">{slide.title}</h2>
              <p className="mt-4 text-lg drop-shadow">{slide.description}</p>
              <div className="mt-4 flex items-center space-x-4">
                <button className="border border-white px-4 py-2 rounded hover:bg-white hover:text-black transition">
                  Ver más
                </button>
              </div>
              <p className="absolute top-0 right-10 font-bold text-white">
                {`Descuento ${slide.discount}`}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full"
      >
        <FaChevronRight />
      </button>

      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === current ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
