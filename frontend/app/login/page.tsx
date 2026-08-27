'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function go(e: React.FormEvent) {
    e.preventDefault()

    setErr('')
    setLoading(true)

    try {
      const result = await login(
        email.trim(),
        password
      )

      console.log(
        'LOGIN COMPLETO:',
        result.user?.email
      )

      if (!result.session) {
        throw new Error(
          'Supabase no creó una sesión.'
        )
      }

      router.replace('/dashboard')

    } catch (error) {
      console.error(
        'ERROR EN LOGIN:',
        error
      )

      setErr(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar sesión.'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="card p-7">

        <h1 className="text-2xl font-black">
          Ingresar
        </h1>

        <p className="text-slate-500 text-sm mt-2">
          Ingresa a tu cuenta de CHRVM Cursos.
        </p>

        <form
          onSubmit={go}
          className="space-y-4 mt-6"
        >

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
            required
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white rounded-lg p-3 font-semibold disabled:opacity-50"
          >
            {loading
              ? 'Ingresando...'
              : 'Entrar'}
          </button>

        </form>

        {err && (
          <div className="text-red-600 text-sm mt-4">
            {err}
          </div>
        )}

        <p className="text-sm mt-5">
          ¿No tienes cuenta?{' '}

          <Link
            className="text-brand-600 font-semibold"
            href="/registro"
          >
            Regístrate
          </Link>
        </p>

      </div>
    </div>
  )
}
