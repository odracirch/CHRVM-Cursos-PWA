'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Register() {
  const [v, setV] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  })

  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function go(e: React.FormEvent) {
    e.preventDefault()

    setMsg('')
    setErr('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: v.email,
        password: v.password,
        options: {
          data: {
            first_name: v.first_name,
            last_name: v.last_name,
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.session) {
        router.push('/dashboard')
        return
      }

      setMsg(
        'Cuenta creada. Revisa tu correo electrónico para confirmar tu cuenta.'
      )
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la cuenta.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="card p-7">
        <h1 className="text-2xl font-black">
          Crear cuenta
        </h1>

        <p className="text-slate-500 text-sm mt-2">
          Regístrate gratis en CHRVM Cursos.
        </p>

        <form
          onSubmit={go}
          className="space-y-3 mt-6"
        >
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Nombre"
            value={v.first_name}
            onChange={(e) =>
              setV({
                ...v,
                first_name: e.target.value,
              })
            }
            required
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Apellidos"
            value={v.last_name}
            onChange={(e) =>
              setV({
                ...v,
                last_name: e.target.value,
              })
            }
            required
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Correo electrónico"
            type="email"
            value={v.email}
            onChange={(e) =>
              setV({
                ...v,
                email: e.target.value,
              })
            }
            required
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Contraseña"
            type="password"
            value={v.password}
            onChange={(e) =>
              setV({
                ...v,
                password: e.target.value,
              })
            }
            minLength={8}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white rounded-lg p-3 font-semibold disabled:opacity-50"
          >
            {loading
              ? 'Creando cuenta...'
              : 'Registrarme'}
          </button>
        </form>

        {err && (
          <p className="text-red-600 text-sm mt-4">
            {err}
          </p>
        )}

        {msg && (
          <p className="text-green-600 text-sm mt-4">
            {msg}
          </p>
        )}

        <p className="text-sm mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link
            className="text-brand-600 font-semibold"
            href="/login"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
