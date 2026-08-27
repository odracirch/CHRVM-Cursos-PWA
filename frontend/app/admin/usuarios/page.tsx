'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  nombre: string
  apellidos: string | null
  email: string | null
  rol: string | null
  avatar_url: string | null
  activo: boolean | null
  created_at: string | null
}

export default function Page() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id,nombre,apellidos,email,rol,avatar_url,activo,created_at'
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando usuarios:', error)
        setError(error.message)
        setLoading(false)
        return
      }

      setUsers(data ?? [])
      setLoading(false)
    }

    loadUsers()
  }, [])

  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="card p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black">
                Admin · Usuarios
              </h1>

              <p className="text-slate-600 mt-2">
                Usuarios registrados en CHRVM Cursos.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              {users.length} usuario{users.length === 1 ? '' : 's'}
            </div>
          </div>

          {loading && (
            <div className="py-10 text-center text-slate-500">
              Cargando usuarios...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-3 py-3 font-semibold">
                      Nombre
                    </th>
                    <th className="px-3 py-3 font-semibold">
                      Email
                    </th>
                    <th className="px-3 py-3 font-semibold">
                      Rol
                    </th>
                    <th className="px-3 py-3 font-semibold">
                      Estado
                    </th>
                    <th className="px-3 py-3 font-semibold">
                      Registro
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-3 py-4">
                        <div className="font-semibold">
                          {user.nombre}{' '}
                          {user.apellidos ?? ''}
                        </div>

                        <div className="text-xs text-slate-400 mt-1">
                          {user.id}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        {user.email ?? 'Sin email'}
                      </td>

                      <td className="px-3 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                          {user.rol ?? 'Sin rol'}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        {user.activo === false ? (
                          <span className="text-red-600 font-semibold">
                            Inactivo
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">
                            Activo
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-4 text-slate-500">
                        {user.created_at
                          ? new Date(
                              user.created_at
                            ).toLocaleDateString('es-MX')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="py-10 text-center text-slate-500">
                  No hay usuarios registrados.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
