'use client'

import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Course = {
  id: string
  title: string
  published: boolean | null
}

export default function Page() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    async function loadCourses() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('courses')
        .select('id, title, published')
        .eq('instructor_id', user.id)
        .order('title', { ascending: true })

      setCourses(data ?? [])
      setLoading(false)
    }

    loadCourses()
  }, [])

  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div>
          <h1 className="text-3xl font-black">
            Panel de instructor
          </h1>

          <p className="text-slate-600 mt-2">
            Gestiona tus cursos, módulos, lecciones, evaluaciones y alumnos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          <Link
            href="/instructor/cursos"
            className="card p-6 hover:border-blue-300 transition"
          >
            <h2 className="text-xl font-bold">📚 Mis cursos</h2>
            <p className="text-slate-500 mt-2">
              Consulta y administra tus cursos.
            </p>

            <p className="text-blue-600 font-bold mt-4">
              {loading ? '...' : `${courses.length} curso(s)`}
            </p>
          </Link>

          <Link
            href="/instructor/cursos/nuevo"
            className="card p-6 hover:border-blue-300 transition"
          >
            <h2 className="text-xl font-bold">➕ Nuevo curso</h2>
            <p className="text-slate-500 mt-2">
              Crea un nuevo curso.
            </p>
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-black">
            Mis cursos
          </h2>

          {loading ? (
            <div className="card p-6 mt-4">
              <p className="text-slate-500">
                Cargando...
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="card p-6 mt-4">
              <p className="text-slate-500">
                No tienes cursos asignados.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/instructor/cursos/${course.id}`}
                  className="card p-5 flex items-center justify-between gap-4 hover:border-blue-300 transition"
                >
                  <div>
                    <h3 className="font-bold">
                      {course.title}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {course.published ? 'Publicado' : 'Borrador'}
                    </p>
                  </div>

                  <span className="text-blue-600 font-semibold">
                    Administrar →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </AuthGuard>
  )
}
