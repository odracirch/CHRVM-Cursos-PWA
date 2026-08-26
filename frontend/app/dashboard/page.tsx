'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'

type Profile = {
  id: string
  nombre: string
  apellidos: string
  email: string
  rol: string
  avatar_url: string | null
  activo: boolean
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfile(data)
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem('chrvm_access')
    localStorage.removeItem('chrvm_refresh')
    router.replace('/login')
  }

  return (
    <AuthGuard roles={['admin', 'instructor', 'student']}>
      <div className="max-w-6xl mx-auto px-4 py-10">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              Hola, {loading ? '...' : profile?.nombre || 'estudiante'} 👋
            </h1>

            <p className="text-slate-600 mt-2">
              Continúa tu aprendizaje en CHRVM Cursos.
            </p>
          </div>

          <button
            onClick={logout}
            className="border border-slate-300 rounded-lg px-4 py-2 font-semibold hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-8">

          <div className="card p-5">
            <div className="text-sm text-slate-500">
              Usuario
            </div>

            <b className="text-lg">
              {profile?.email || 'Cargando...'}
            </b>
          </div>

          <div className="card p-5">
            <div className="text-sm text-slate-500">
              Rol
            </div>

            <b className="text-lg capitalize">
              {profile?.rol || 'estudiante'}
            </b>
          </div>

          <div className="card p-5">
            <Link
              href="/cursos"
              className="font-semibold text-brand-600"
            >
              Explorar catálogo →
            </Link>
          </div>

        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold">
            Mi aprendizaje
          </h2>

          <div className="card p-6 mt-4">
            <p className="text-slate-600">
              Todavía no tienes cursos inscritos.
            </p>

            <Link
              href="/cursos"
              className="inline-block mt-4 bg-brand-600 text-white rounded-lg px-5 py-3 font-semibold"
            >
              Explorar cursos
            </Link>
          </div>
        </section>

      </div>
    </AuthGuard>
  )
}
