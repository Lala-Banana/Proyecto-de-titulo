// src/app/components/Footer.tsx
export default function Footer() {
    return (
      <footer className="p-4 bg-white md:p-8 lg:p-10 dark:bg-gray-800">
        <div className="mx-auto max-w-screen-xl text-center">
          <a href="#" className="flex justify-center items-center text-2xl font-semibold text-gray-900 dark:text-white">
            <svg
              className="mr-2 h-8"
              viewBox="0 0 33 33"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Aquí puedes dejar los <path> y <defs> como los tenías, no requieren cambios */}
            </svg>
            ExpresArte
          </a>
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2025 <a href="#" className="hover:underline">ExpresArte™</a>. All Rights Reserved.
          </span>
        </div>
      </footer>
    );
  }
  