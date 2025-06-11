// app/admin/layout.tsx
'use client'

import AdminSidebar from '@/app/components/AdminSidebar'
import Navbar from '../components/Navbar'
import '@/app/globals.css'
import { useState } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      {/* Navbar fijo arriba en móviles */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar oculto en móviles, visible en md+ */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-50 p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
