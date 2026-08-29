'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'

type Profile = {
  id: string
  nombre: string
  apellidos: string | null
  email: string | null
  rol: string | null
  avatar_url: string | null
  activo: boolean | null
}

export default function Page() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('No se encontró una sesión activa.')
        setLoading(false)
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id,nombre,apellidos,email,rol,avatar_url,activo')
        .eq('id', user.id)
        .single()

      if (profileError || !data) {
        console.error('Error cargando perfil:', profileError)
        setError(profileError?.message || 'No se pudo cargar el perfil.')
        setLoading(false)
        return
      }

      setProfile(data)
      setNombre(data.nombre || '')
      setApellidos(data.apellidos || '')
      setAvatarUrl(data.avatar_url || '')
      setLoading(false)
    }

    loadProfile()
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()

    setSaving(true)
    setMessage('')
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('No se encontró una sesión activa.')
      setSaving(false)
      return
    }

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        nombre: nombre.trim(),
        apellidos: apellidos.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      .eq('id', user.id)
      .select('id,nombre,apellidos,email,rol,avatar_url,activo')
      .single()

    if (updateError) {
      console.error('Error actualizando perfil:', updateError)
      setError(updateError.message)
      setSaving(false)
      return
    }

    setProfile(data)
    setNombre(data.nombre || '')
    setApellidos(data.apellidos || '')
    setAvatarUrl(data.avatar_url || '')
    setMessage('Perfil actualizado correctamente.')
    setSaving(false)
  }

  return (
    <AuthGuard roles={['estudiante', 'instructor', 'admin']}>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="card p-7">
          <div className="mb-8">
            <h1 className="text-3xl font-black">
              Mi perfil
            </h1>

            <p className="text-slate-600 mt-2">
              Actualiza tu información personal.
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-500">
              Cargando perfil...
            </div>
          ) : (
            <form onSubmit={saveProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nombre
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Apellidos
                </label>

                <input
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />

                <p className="text-xs text-slate-500 mt-2">
                  El correo de acceso se mantiene sin cambios.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  URL de avatar
                </label>

                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {avatarUrl.trim() && (
                <div>
                  <p className="text-sm font-semibold mb-2">
                    Vista previa
                  </p>

                  <img
                    src={avatarUrl}
                    alt="Vista previa del avatar"
                    className="h-24 w-24 rounded-full object-cover border border-slate-200"
                  />
                </div>
              )}

              <div className="border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-500">
                  Rol actual:{' '}
                  <span className="font-semibold capitalize">
                    {profile?.rol || 'Sin rol'}
                  </span>
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
