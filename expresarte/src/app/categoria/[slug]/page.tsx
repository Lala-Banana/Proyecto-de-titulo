// app/categoria/[slug]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import NavbarCombined from '@/app/components/Navbar'
import SidebarFiltros from '@/app/components/SidebarFiltros'
import ObrasGrid, { Obra } from '@/app/components/ObrasGrid'
import Footer from '@/app/components/Footer'

export default function CategoriaSlugPage() {
  const { slug } = useParams()
  const slugStr = Array.isArray(slug) ? slug[0] : slug

  // Ahora guardamos el slug de categoría o null
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null)

  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refetch cada vez que cambie slugStr o selectedCategorySlug
  useEffect(() => {
    setLoading(true)
    setError(null)

    // Si hay slug seleccionado, lo usamos, si no usamos el de la ruta, si tampoco usamos todas
    const url = selectedCategorySlug
      ? `http://localhost:8000/api/categorias/${selectedCategorySlug}/obras/`
      : slugStr
        ? `http://localhost:8000/api/categorias/${slugStr}/obras/`
        : `http://localhost:8000/api/obras/`

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then((data: Obra[]) => {
        setObras(data)
      })
      .catch(err => {
        console.error('[Page] fetch obras:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [slugStr, selectedCategorySlug])

  // Recibimos el slug de SidebarFiltros
  const handleAplicar = (slug: string | null) => {
    console.log('[Page] categoría activa:', slug)
    setSelectedCategorySlug(slug)
  }

  return (
    <>
      <NavbarCombined />

      <div className="flex bg-white min-h-screen">
        <aside className="w-64">
          <SidebarFiltros onAplicar={handleAplicar} />
        </aside>

        <main className="flex-1 p-6">
          <h1 className="text-4xl p-5 text-center font-serif italic font-bold tracking-wider text-black mb-6">
            OBRAS DE LA CATEGORÍA: {selectedCategorySlug ?? slugStr ?? 'Todas'}
          </h1>

          {loading && <p>Cargando obras…</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!loading && !error && <ObrasGrid obras={obras} />}
        </main>
      </div>

      <Footer />
    </>
  )
}
