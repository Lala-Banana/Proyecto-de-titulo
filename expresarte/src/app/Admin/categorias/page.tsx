'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface Categoria {
  id: number
  nombre: string
  descripcion: string
  slug: string
  visible: boolean
  imagen_url: string
}

export default function CategoriasPage() {
  const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [slug, setSlug] = useState('')
  const [visible, setVisible] = useState(true)
  const [imagenUrl, setImagenUrl] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const formularioRef = useRef<HTMLDivElement | null>(null)

  const getToken = () => localStorage.getItem('access_token') ?? ''

  const fetchCategorias = async () => {
    try {
      const token = getToken()
      const res = await fetch(`${BASE}/api/admin/categorias/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        console.error(`❌ Error al obtener categorías: ${res.status}`)
        if (res.status === 401) console.warn('🔐 Token expirado o inválido')
        setCategorias([])
        return
      }
      const data = await res.json()
      if (Array.isArray(data)) setCategorias(data)
      else {
        console.error('❌ Respuesta inesperada del servidor:', data)
        setCategorias([])
      }
    } catch (error) {
      console.error('❌ Error de red al cargar categorías:', error)
      setCategorias([])
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { nombre, descripcion, slug, imagen_url: imagenUrl, visible }
    const token = getToken()
    const url = editandoId
      ? `${BASE}/api/admin/categorias/${editandoId}/`
      : `${BASE}/api/admin/categorias/`
    const method = editandoId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorText = await res.text()
        console.error(`❌ Error al guardar (${res.status}):`, errorText)
        return
      }
      // Limpiamos form y recargamos lista
      setNombre('')
      setDescripcion('')
      setSlug('')
      setImagenUrl('')
      setVisible(true)
      setEditandoId(null)
      fetchCategorias()
      setMensaje(editandoId ? '✅ Categoría actualizada exitosamente.' : '✅ Categoría creada exitosamente.')
      setTimeout(() => setMensaje(null), 3000)
    } catch (error) {
      console.error('❌ Error de red al guardar categoría:', error)
    }
  }

  const handleEditar = (cat: Categoria) => {
    setNombre(cat.nombre)
    setDescripcion(cat.descripcion)
    setSlug(cat.slug)
    setImagenUrl(cat.imagen_url)
    setVisible(cat.visible)
    setEditandoId(cat.id)
    formularioRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    const token = getToken()
    try {
      const res = await fetch(`${BASE}/api/admin/categorias/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        console.error(`❌ Error al eliminar (${res.status})`)
        return
      }
      fetchCategorias()
      setMensaje('🗑️ Categoría eliminada exitosamente.')
      setTimeout(() => setMensaje(null), 3000)
    } catch (error) {
      console.error('❌ Error de red al eliminar categoría:', error)
    }
  }

  return (
    <div className="p-4 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">Categorías</h2>

      {mensaje && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow">
          {mensaje}
        </div>
      )}

      <div ref={formularioRef}>
        <form onSubmit={handleSubmit} className="mb-8 space-y-3 bg-gray-100 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="bg-gray-200 text-black border border-gray-300 p-2 rounded"
              required
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug"
              className="bg-gray-200 text-black border border-gray-300 p-2 rounded"
              required
            />
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción"
              className="bg-gray-200 text-black border border-gray-300 p-2 rounded col-span-2"
            />
            <input
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="URL de la imagen"
              className="bg-gray-200 text-black border border-gray-300 p-2 rounded col-span-2"
            />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Visible</span>
            </label>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white"
            >
              {editandoId ? 'Actualizar' : 'Agregar'} Categoría
            </button>
          </div>
        </form>
      </div>

      <table className="w-full text-left bg-gray-100 rounded-lg overflow-hidden">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Imagen</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Slug</th>
            <th className="p-3">Visible</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border-b border-gray-300">
              <td className="p-3">{cat.id}</td>
              <td className="p-3">
                {cat.imagen_url ? (
                  <Image
                    src={cat.imagen_url}
                    alt={cat.nombre}
                    width={50}
                    height={50}
                    className="rounded object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Sin imagen</span>
                )}
              </td>
              <td className="p-3">{cat.nombre}</td>
              <td className="p-3">{cat.descripcion}</td>
              <td className="p-3">{cat.slug}</td>
              <td className="p-3">{cat.visible ? '✅' : '❌'}</td>
              <td className="p-3 flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  onClick={() => handleEditar(cat)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => handleEliminar(cat.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
