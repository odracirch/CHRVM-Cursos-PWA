'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
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
  const [actionLoading, setActionLoading] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')

  useEffect(() => {
    async function loadUsers() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      setCurrentUserId(currentUser?.id ?? '')
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

  async function updateRole(userId: string, role: string) {
    setActionLoading(`role-${userId}`)
    setError('')

    const { error } = await supabase.rpc('admin_update_user_role', {
      target_user_id: userId,
      new_role: role,
    })

    if (error) {
      console.error('Error cambiando rol:', error)
      setError(error.message)
      setActionLoading('')
      return
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, rol: role } : user
      )
    )

    setActionLoading('')
  }

  async function updateActive(userId: string, active: boolean) {
    setActionLoading(`active-${userId}`)
    setError('')

    const { error } = await supabase.rpc('admin_set_user_active', {
      target_user_id: userId,
      new_active: active,
    })

    if (error) {
      console.error('Error cambiando estado:', error)
      setError(error.message)
      setActionLoading('')
      return
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, activo: active } : user
      )
    )

    setActionLoading('')
  }

  async function deleteUser(user: Profile) {
    if (user.id === currentUserId) {
      setError('No puedes eliminar tu propia cuenta de administrador.')
      return
    }

    const displayName =
      `${user.nombre} ${user.apellidos ?? ''}`.trim()

    const confirmed = window.confirm(
      `¿Eliminar definitivamente a ${displayName}?\n\n` +
        `Correo: ${user.email ?? 'Sin email'}\n\n` +
        `Esta acción eliminará su cuenta y sus datos asociados de CHRVM Cursos.`
    )

    if (!confirmed) {
      return
    }

    setActionLoading(`delete-${user.id}`)
    setError('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('No hay una sesión activa.')
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error || 'No se pudo eliminar el usuario.'
        )
      }

      setUsers((current) =>
        current.filter((item) => item.id !== user.id)
      )
    } catch (error) {
      console.error('Error eliminando usuario:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el usuario.'
      )
    } finally {
      setActionLoading('')
    }
  }

  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-5">
          <AdminBackButton />
        </div>

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
              {users.length} usuario
              {users.length === 1 ? '' : 's'}
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

                    <th className="px-3 py-3 font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const rowLoading = actionLoading.endsWith(
                      `-${user.id}`
                    )

                    return (
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

                        <td className="px-3 py-4">
                          {user.id === currentUserId ? (
                            <span className="text-xs text-slate-500">
                              Cuenta actual
                            </span>
                          ) : (
                            <div className="flex flex-col gap-2 min-w-[190px]">
                              <select
                                value={user.rol ?? 'estudiante'}
                                onChange={(e) =>
                                  updateRole(
                                    user.id,
                                    e.target.value
                                  )
                                }
                                disabled={rowLoading}
                                className="border rounded-lg px-2 py-1 text-sm"
                              >
                                <option value="estudiante">
                                  Estudiante
                                </option>

                                <option value="instructor">
                                  Instructor
                                </option>

                                <option value="admin">
                                  Admin
                                </option>
                              </select>

                              <button
                                type="button"
                                onClick={() =>
                                  updateActive(
                                    user.id,
                                    user.activo === false
                                  )
                                }
                                disabled={rowLoading}
                                className="border rounded-lg px-3 py-1 text-sm font-semibold"
                              >
                                {actionLoading ===
                                `active-${user.id}`
                                  ? 'Procesando...'
                                  : user.activo === false
                                    ? 'Activar'
                                    : 'Desactivar'}
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteUser(user)}
                                disabled={rowLoading}
                                className="border border-red-300 text-red-700 rounded-lg px-3 py-1 text-sm font-semibold hover:bg-red-50"
                              >
                                {actionLoading ===
                                `delete-${user.id}`
                                  ? 'Eliminando...'
                                  : 'Eliminar'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
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
