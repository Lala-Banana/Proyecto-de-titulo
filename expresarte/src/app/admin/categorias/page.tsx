'use client'

import { useEffect, useState } from 'react'

interface Categoria {
  id: number
  nombre: string
  descripcion: string
  slug: string
  visible: boolean
  imagen_url: string
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [slug, setSlug] = useState('')
  const [visible, setVisible] = useState(true)
  const [imagenUrl, setImagenUrl] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const fetchCategorias = async () => {
    const token = localStorage.getItem('access_token')
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
    const res = await fetch('http://localhost:8000/api/categorias/', { headers })
    const data = await res.json()
    setCategorias(data)
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { nombre, descripcion, slug, imagen_url: imagenUrl, visible }

    const token = localStorage.getItem('access_token')
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const url = editandoId
      ? `http://localhost:8000/api/categorias/${editandoId}/`
      : 'http://localhost:8000/api/categorias/'
    const method = editandoId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setNombre('')
      setDescripcion('')
      setSlug('')
      setImagenUrl('')
      setVisible(true)
      setEditandoId(null)
      fetchCategorias()
    } else {
      const errorText = await res.text()
      console.error(`❌ Error al guardar (${res.status}):`, errorText)
    }
  }

  const handleEditar = (cat: Categoria) => {
    setNombre(cat.nombre)
    setDescripcion(cat.descripcion || '')
    setSlug(cat.slug)
    setImagenUrl(cat.imagen_url || '')
    setVisible(cat.visible)
    setEditandoId(cat.id)
  }

  const handleEliminar = async (id: number) => {
    const token = localStorage.getItem('access_token')
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    if (!confirm('¿Eliminar esta categoría?')) return
    const res = await fetch(`http://localhost:8000/api/categorias/${id}/`, {
      method: 'DELETE',
      headers,
    })
    if (res.ok) fetchCategorias()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categorías</h2>

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          className="border p-2 rounded w-full"
          required
        />
        <input
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción"
          className="border p-2 rounded w-full"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug"
          className="border p-2 rounded w-full"
          required
        />
        <input
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          placeholder="URL de la imagen"
          className="border p-2 rounded w-full"
        />
        <label className="block">
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
          />{' '}
          Visible
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editandoId ? 'Actualizar' : 'Agregar'} Categoría
        </button>
      </form>

      <table className="w-full border rounded-md bg-white text-left">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2">Nombre</th>
            <th className="p-2">Slug</th>
            <th className="p-2">Visible</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="border-b">
              <td className="p-2">{cat.nombre}</td>
              <td className="p-2">{cat.slug}</td>
              <td className="p-2">{cat.visible ? '✅' : '❌'}</td>
              <td className="p-2 space-x-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEditar(cat)}
                >
                  Editar
                </button>
                <button
                  className="text-red-600 hover:underline"
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
