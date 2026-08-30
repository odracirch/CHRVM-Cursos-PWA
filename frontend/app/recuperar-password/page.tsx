'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function recuperar(e: React.FormEvent) {
    e.preventDefault()

    setMessage('')
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/restablecer-password`,
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      setMessage(
        'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.'
      )
    } catch (error) {
      console.error('ERROR RECUPERANDO CONTRASEÑA:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo procesar la solicitud.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="card p-7">
        <h1 className="text-2xl font-black">
          Recuperar contraseña
        </h1>

        <p className="text-slate-500 text-sm mt-2">
          Ingresa tu correo electrónico y te enviaremos un enlace
          para establecer una nueva contraseña.
        </p>

        <form
          onSubmit={recuperar}
          className="space-y-4 mt-6"
        >
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white rounded-lg p-3 font-semibold disabled:opacity-50"
          >
            {loading
              ? 'Enviando...'
              : 'Enviar enlace de recuperación'}
          </button>
        </form>

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

        <p className="text-sm mt-5">
          <Link
            className="text-brand-600 font-semibold"
            href="/login"
          >
            ← Volver a ingresar
          </Link>
        </p>
      </div>
    </div>
  )
}
