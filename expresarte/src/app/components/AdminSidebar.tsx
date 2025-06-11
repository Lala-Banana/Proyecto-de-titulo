'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaUser, FaTags, FaPaintBrush, FaFileAlt } from 'react-icons/fa'

const links = [
  { href: '/admin/usuarios', label: 'Usuarios', icon: <FaUser /> },
  { href: '/admin/categorias', label: 'Categorías', icon: <FaTags /> },
  { href: '/admin/obras', label: 'Obras', icon: <FaPaintBrush /> },
  { href: '/admin/logs', label: 'Logs', icon: <FaFileAlt /> },
]

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export default function AdminSidebar({ open, setOpen }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Fondo oscuro en móviles cuando el sidebar está abierto */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity ${
          open ? 'block' : 'hidden'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed z-50 inset-y-0 left-0 w-60 bg-gray-200 border-r px-4 py-6 flex flex-col justify-between
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block
        `}
      >
        <div>
          <h1 className="text-2xl text-black font-bold mb-6">🎨 Admin</h1>
          <nav className="flex flex-col text-black space-y-2">
            {links.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)} // cerrar menú en móviles
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition ${
                  pathname === href ? 'bg-gray-300 font-semibold' : ''
                }`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="text-sm text-gray-500 text-center">
          <p>© 2025 ExpresArte</p>
        </div>
      </aside>
    </>
  )
}
