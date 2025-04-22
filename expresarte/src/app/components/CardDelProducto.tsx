'use client';

import Image from 'next/image';

export default function ProductGrid() {
  return (
    <div className="grid grid-rows-3 grid-flow-col gap-4 px-4 py-4 leading-10">
      {/* Tarjeta 1: Grande, vertical */}
      <div className="p-4 w-full bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700 row-span-3">
        <img
          src="https://www.artel.cl/wp-content/uploads/2022/07/tipos-de-pintura-de-la-historia-del-arte.jpg"
          alt="product image"
          className="rounded-lg"
        />

        <h5 className="mt-4 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Apple Watch Series 7
        </h5>
        <div className="mt-2 text-gray-500 text-sm dark:text-gray-400">
          Aluminium Case, Starlight Sport
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">$599</span>
          <a
            href="#"
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Add to cart
          </a>
        </div>
      </div>

      {/* Tarjeta 2 */}
      <div className="p-4 w-full bg-fuchsia-800 rounded-xl col-span-2 flex items-center justify-center text-white font-bold">
        Promo especial
      </div>

      {/* Tarjeta 3 */}
      <div className="p-4 w-full bg-fuchsia-700 rounded-xl row-span-2 col-span-2 flex items-center justify-center text-white font-bold">
        Lo más vendido
      </div>
    </div>
  );
}
