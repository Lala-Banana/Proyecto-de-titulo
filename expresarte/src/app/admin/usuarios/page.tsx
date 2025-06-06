'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { fetchConAuth } from '@/lib/auth'

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
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<Usuario> & { password?: string }>({
    nombre: '',
    email: '',
    foto_url: '',
    password: '',
  })
  const [editandoId, setEditandoId] = useState<number | null>(null)

  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  const getToken = () => localStorage.getItem('access_token') ?? ''

  const fetchUsuarios = async () => {
    const token = getToken()
    const data = await fetchConAuth(`${BASE}/api/admin/usuarios/`, token, setError)
    if (data && Array.isArray(data)) setUsuarios(data)
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'expresarte_preset')

    const res = await fetch('https://api.cloudinary.com/v1_1/drb5jrimz/image/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error?.message || 'Error al subir imagen')
    }
    return data.secure_url
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

    let fotoURL = form.foto_url
    if (fotoArchivo) {
      setSubiendoFoto(true)
      try {
        const urlSubida = await uploadImageToCloudinary(fotoArchivo)
        fotoURL = urlSubida
        console.log('✅ Foto subida:', urlSubida)
      } catch (err) {
        console.error('❌ Error al subir foto:', err)
        setError('Error al subir la foto.')
        setSubiendoFoto(false)
        return
      }
      setSubiendoFoto(false)
    }

    const url = editandoId
      ? `${BASE}/api/admin/usuarios/${editandoId}/`
      : `${BASE}/api/admin/usuarios/`
    const method = editandoId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          foto_url: fotoURL,
          password: editandoId ? undefined : form.password, // solo al crear
        }),
      })
      if (!res.ok) throw new Error()
      fetchUsuarios()
      setMensaje(editandoId ? '✅ Usuario actualizado' : '✅ Usuario creado')
      setForm({ nombre: '', email: '', foto_url: '', password: '' })
      setFotoArchivo(null)
      setEditandoId(null)
      setTimeout(() => setMensaje(null), 3000)
    } catch (error) {
      console.error('❌ Error al guardar usuario')
      setError('No se pudo guardar el usuario.')
    }
  }

  const editarUsuario = (usuario: Usuario) => {
    setForm({ ...usuario, password: '' }) // no mostramos password al editar
    setEditandoId(usuario.id)
  }

  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen text-black">
        <div className="bg-red-100 text-red-800 p-4 rounded shadow">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">Usuarios</h2>
      {mensaje && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow">
          {mensaje}
        </div>
      )}

     <form onSubmit={guardarUsuario} className="space-y-4 bg-gray-100 p-4 rounded mb-8">
      <input
        value={form.nombre || ''}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        placeholder="Nombre"
        className="w-full p-2 rounded border"
        required
      />
      <input
        value={form.email || ''}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Correo"
        className="w-full p-2 rounded border"
        required
      />
      <input
        type="password"
        value={form.password || ''}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="Contraseña"
        className="w-full p-2 rounded border"
        required={!editandoId} // obligatorio solo al crear
      />

      {/* Botón subir foto */}
      <div className="flex items-center space-x-4 mb-2">
        <label className="bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-800 transition">
          Elegir foto
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFotoArchivo(e.target.files[0])
              }
            }}
          />
        </label>

        <span className="text-black text-sm">
          {fotoArchivo ? fotoArchivo.name : 'Ningún archivo seleccionado'}
        </span>
      </div>

      {/* Preview de imagen */}
      {fotoArchivo && (
        <div className="border rounded overflow-hidden mt-2 max-w-[150px]">
          <img
            src={URL.createObjectURL(fotoArchivo)}
            alt="Preview foto"
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {/* Botones Agregar + Limpiar */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={subiendoFoto}
        >
          {subiendoFoto
            ? 'Subiendo foto...'
            : editandoId
            ? 'Actualizar Usuario'
            : 'Agregar Usuario'}
        </button>

        <button
          type="button"
          onClick={() => {
            // limpiar formulario
            setForm({ nombre: '', email: '', foto_url: '', password: '' })
            setFotoArchivo(null)
            setEditandoId(null)
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          Limpiar
        </button>
      </div>
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
                  <a href={`/usuarios/${user.id}`}>
                    <Image
                      src={user.foto_url}
                      alt={user.nombre}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  </a>
                ) : (
                  <span className="text-gray-400">Sin foto</span>
                )}
              </td>
              <td className="p-3 flex gap-2">
                <button
                  onClick={() => editarUsuario(user)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarUsuario(user.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
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
