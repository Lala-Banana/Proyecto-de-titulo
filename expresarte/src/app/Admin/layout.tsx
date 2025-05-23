// app/admin/layout.tsx
import AdminSidebar from '@/app/components/AdminSidebar'
import '@/app/globals.css'
import Navbar from '../components/Navbar'
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  )
}