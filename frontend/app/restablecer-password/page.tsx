'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RestablecerPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function prepararSesion() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError(
          'El enlace de recuperación no es válido o ya expiró.'
        )
        return
      }

      setReady(true)
    }

    prepararSesion()
  }, [])

  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault()

    setMessage('')
    setError('')

    if (password.length < 6) {
      setError(
        'La contraseña debe tener al menos 6 caracteres.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      setMessage(
        'Contraseña actualizada correctamente. Ahora puedes ingresar con tu nueva contraseña.'
      )

      setTimeout(() => {
        router.replace('/login')
      }, 2000)
    } catch (error) {
      console.error(
        'ERROR ACTUALIZANDO CONTRASEÑA:',
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la contraseña.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="card p-7">
        <h1 className="text-2xl font-black">
          Restablecer contraseña
        </h1>

        {!ready && !error && (
          <p className="text-slate-500 text-sm mt-3">
            Validando enlace de recuperación...
          </p>
        )}

        {ready && (
          <>
            <p className="text-slate-500 text-sm mt-2">
              Escribe tu nueva contraseña.
            </p>

            <form
              onSubmit={cambiarPassword}
              className="space-y-4 mt-6"
            >
              <input
                className="w-full border rounded-lg p-3"
                placeholder="Nueva contraseña"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="new-password"
                required
              />

              <input
                className="w-full border rounded-lg p-3"
                placeholder="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                autoComplete="new-password"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white rounded-lg p-3 font-semibold disabled:opacity-50"
              >
                {loading
                  ? 'Actualizando...'
                  : 'Cambiar contraseña'}
              </button>
            </form>
          </>
        )}

        {message && (
          <div className="text-green-600 text-sm mt-4">
            {message}
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
