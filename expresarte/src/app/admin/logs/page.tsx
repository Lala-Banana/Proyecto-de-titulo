'use client'

import { useEffect, useState } from 'react'
import { fetchConAuth } from '@/lib/auth'

interface Log {
  id: number
  tabla: string
  id_registro: number
  accion: string
  descripcion?: string
  fecha: string
  usuario_nombre?: string
  usuario_email?: string
}

export default function LogsPage() {
  const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  const [logs, setLogs] = useState<Log[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const getToken = () => localStorage.getItem('access_token') ?? ''

  const fetchLogs = async () => {
    const token = getToken()
    const data = await fetchConAuth(`${BASE}/api/logs/`, token, setError)
    if (data && Array.isArray(data)) setLogs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // ✅ Si hay error (como no estar logueado), solo mostrar eso
  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen text-black">
        <div className="bg-red-100 text-red-800 p-4 rounded shadow">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">🗂️ Registros de Cambios (Logs)</h2>

      {loading && <p>Cargando registros...</p>}
      {!loading && logs.length === 0 && <p>No hay registros disponibles.</p>}

      {logs.length > 0 && (
        <table className="w-full bg-gray-100 rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Tabla</th>
              <th className="p-3">ID Registro</th>
              <th className="p-3">Acción</th>
              <th className="p-3">Descripción</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-300">
                <td className="p-3">{log.id}</td>
                <td className="p-3">{log.tabla}</td>
                <td className="p-3">{log.id_registro}</td>
                <td className="p-3 capitalize">{log.accion}</td>
                <td className="p-3">{log.descripcion || '—'}</td>
                <td className="p-3">
                  {log.usuario_nombre
                    ? `${log.usuario_nombre} (${log.usuario_email})`
                    : '—'}
                </td>
                <td className="p-3">{new Date(log.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
