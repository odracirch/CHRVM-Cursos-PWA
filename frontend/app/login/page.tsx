'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const API =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
      /*
       * 1. Autenticación de Supabase
       */
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.session) {
        throw new Error('No se pudo iniciar la sesión.')
      }

      /*
       * 2. Obtener JWT de Django
       *
       * Django utiliza SimpleJWT para proteger
       * la API de certificados, cursos, progreso, etc.
       */
      const djangoResponse = await fetch(
        `${API}/api/auth/login/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      if (!djangoResponse.ok) {
        let message =
          'No se pudo autenticar con el servidor.'

        try {
          const errorData =
            await djangoResponse.json()

          message =
            errorData.detail ||
            JSON.stringify(errorData)
        } catch {}

        throw new Error(message)
      }

      const djangoData =
        await djangoResponse.json()

      /*
       * 3. Guardar JWT de Django
       *
       * api.ts utilizará este token para enviar:
       *
       * Authorization: Bearer <token>
       */
      localStorage.setItem(
        'chrvm_access',
        djangoData.access
      )

      localStorage.setItem(
        'chrvm_refresh',
        djangoData.refresh
      )

      /*
       * Guardamos también los tokens de Supabase
       * para mantener compatible el resto del proyecto.
       */
      localStorage.setItem(
        'supabase_access',
        data.session.access_token
      )

      localStorage.setItem(
        'supabase_refresh',
        data.session.refresh_token
      )

      router.push('/dashboard')
    } catch (error) {
      console.error(error)

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
          <p className="text-red-600 text-sm mt-4">
            {err}
          </p>
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
