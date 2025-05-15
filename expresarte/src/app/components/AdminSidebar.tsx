'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaUser, FaTags, FaPaintBrush, FaShoppingCart, FaEnvelope, FaBell, FaFileAlt } from 'react-icons/fa'

const links = [
  { href: '/admin/usuarios', label: 'Usuarios', icon: <FaUser /> },
  { href: '/admin/categorias', label: 'Categorías', icon: <FaTags /> },
  { href: '/admin/obras', label: 'Obras', icon: <FaPaintBrush /> },
  { href: '/admin/logs', label: 'Logs', icon: <FaFileAlt /> },

]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-white border-r px-4 py-6 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl text-black font-bold mb-6">🎨 Admin</h1>
        <nav className="flex flex-col text-black space-y-4">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 ${
                pathname === href ? 'bg-gray-200 font-semibold' : ''
              }`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="text-sm text-gray-500 text-center">
        <p>© 2025 Tu Sitio</p>
      </div>
    </aside>
  )
}