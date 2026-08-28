'use client'

import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  instructor_id: string | null
  published: boolean | null
}

export default function Page() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCourses() {
      setLoading(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('No hay una sesión activa.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('courses')
        .select(
          'id, title, slug, description, image_url, instructor_id, published'
        )
        .eq('instructor_id', user.id)
        .order('title', { ascending: true })

      if (error) {
        console.error(error)
        setError(error.message)
        setCourses([])
      } else {
        setCourses(data ?? [])
      }

      setLoading(false)
    }

    loadCourses()
  }, [])

  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <Link
          href="/instructor"
          className="text-blue-600 font-semibold"
        >
          ← Panel de instructor
        </Link>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              Instructor · Mis cursos
            </h1>

            <p className="text-slate-600 mt-2">
              Administra los cursos que tienes asignados.
            </p>
          </div>

          <Link
            href="/instructor/cursos/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold text-center"
          >
            + Nuevo curso
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="card p-7 mt-6">
            <p className="text-slate-500">
              Cargando cursos...
            </p>
          </div>
        ) : courses.length === 0 ? (
          <div className="card p-7 mt-6">
            <h2 className="text-xl font-bold">
              No tienes cursos asignados
            </h2>

            <p className="text-slate-500 mt-2">
              Cuando un administrador te asigne un curso aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="card overflow-hidden"
              >
                {course.image_url && (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-bold">
                      {course.title}
                    </h2>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        course.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {course.published
                        ? 'Publicado'
                        : 'Borrador'}
                    </span>
                  </div>

                  {course.description && (
                    <p className="text-slate-600 mt-3">
                      {course.description}
                    </p>
                  )}

                  <Link
                    href={`/instructor/cursos/${course.id}`}
                    className="inline-flex mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                  >
                    Administrar curso →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AuthGuard>
  )
}
