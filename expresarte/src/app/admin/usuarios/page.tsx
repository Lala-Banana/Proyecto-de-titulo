'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Usuario {
  id: number
  nombre: string
  email: string
  foto_url: string
}

export default function UsuariosAdminPage() {
  const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Usuario>>({ nombre: '', email: '', foto_url: '' })
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const getToken = () => localStorage.getItem('access_token') ?? ''

  const fetchUsuarios = async () => {
    try {
      const token = getToken()
      const res = await fetch(`${BASE}/api/admin/usuarios/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUsuarios(data)
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error)
    }
  }

  const eliminarUsuario = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return
    const token = getToken()
    try {
      const res = await fetch(`${BASE}/api/admin/usuarios/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      fetchUsuarios()
      setMensaje('🗑️ Usuario eliminado exitosamente.')
      setTimeout(() => setMensaje(null), 3000)
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error)
    }
  }

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = getToken()
    const url = editandoId ? `${BASE}/api/admin/usuarios/${editandoId}/` : `${BASE}/api/admin/usuarios/`
    const method = editandoId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      fetchUsuarios()
      setMensaje(editandoId ? '✅ Usuario actualizado' : '✅ Usuario creado')
      setForm({ nombre: '', email: '', foto_url: '' })
      setEditandoId(null)
      setTimeout(() => setMensaje(null), 3000)
    } catch (error) {
      console.error('❌ Error al guardar usuario')
    }
  }

  const editarUsuario = (usuario: Usuario) => {
    setForm(usuario)
    setEditandoId(usuario.id)
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  return (
    <div className="p-4 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">Usuarios</h2>
      {mensaje && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow">{mensaje}</div>}

      <form onSubmit={guardarUsuario} className="space-y-4 bg-gray-100 p-4 rounded mb-8">
        <input value={form.nombre || ''} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="w-full p-2 rounded border" required />
        <input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Correo" className="w-full p-2 rounded border" required />
        <input value={form.foto_url || ''} onChange={(e) => setForm({ ...form, foto_url: e.target.value })} placeholder="Foto URL" className="w-full p-2 rounded border" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editandoId ? 'Actualizar' : 'Agregar'} Usuario
        </button>
      </form>

      <table className="w-full text-left bg-gray-100 rounded-lg overflow-hidden">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Correo</th>
            <th className="p-3">Foto</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id} className="border-b border-gray-300">
              <td className="p-3">{user.id}</td>
              <td className="p-3">{user.nombre}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">
                {user.foto_url ? (
                  <Image
                    src={user.foto_url}
                    alt={user.nombre}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Sin foto</span>
                )}
              </td>
              <td className="p-3 flex gap-2">
                <button onClick={() => editarUsuario(user)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Editar</button>
                <button onClick={() => eliminarUsuario(user.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
