'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  published: boolean | null
}

export default function Page() {
  const params = useParams()
  const courseId = String(params.id)

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCourse() {
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
          'id, title, slug, description, image_url, published'
        )
        .eq('id', courseId)
        .eq('instructor_id', user.id)
        .maybeSingle()

      if (error) {
        console.error(error)
        setError(error.message)
      } else if (!data) {
        setError('Curso no encontrado o no tienes acceso.')
      } else {
        setCourse(data)
      }

      setLoading(false)
    }

    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <Link
          href="/instructor/cursos"
          className="text-blue-600 font-semibold"
        >
          ← Mis cursos
        </Link>

        {loading ? (
          <div className="card p-7 mt-6">
            <p className="text-slate-500">
              Cargando curso...
            </p>
          </div>
        ) : !course ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-7">
            <h1 className="text-2xl font-black text-red-700">
              No se pudo cargar el curso
            </h1>

            <p className="text-red-600 mt-2">
              {error || 'Curso no encontrado.'}
            </p>
          </div>
        ) : (
          <>
            <section className="mt-6 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
              {course.image_url && (
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-64 object-cover"
                />
              )}

              <div className="p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black">
                      {course.title}
                    </h1>

                    <p className="text-slate-500 mt-2">
                      /cursos/{course.slug}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
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
                  <p className="text-slate-600 text-lg mt-5">
                    {course.description}
                  </p>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-black">
                Administración del curso
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                <Link
                  href={`/instructor/cursos/${course.id}/modulos`}
                  className="card p-6 hover:border-blue-300 transition"
                >
                  <h3 className="text-xl font-bold">
                    Módulos
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Organiza los módulos del curso.
                  </p>
                </Link>

                <Link
                  href={`/instructor/cursos/${course.id}/lecciones`}
                  className="card p-6 hover:border-blue-300 transition"
                >
                  <h3 className="text-xl font-bold">
                    Lecciones
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Crea y administra las lecciones.
                  </p>
                </Link>

                <Link
                  href={`/instructor/cursos/${course.id}/evaluaciones`}
                  className="card p-6 hover:border-blue-300 transition"
                >
                  <h3 className="text-xl font-bold">
                    Evaluaciones
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Administra las evaluaciones.
                  </p>
                </Link>

                <Link
                  href={`/instructor/cursos/${course.id}/alumnos`}
                  className="card p-6 hover:border-blue-300 transition"
                >
                  <h3 className="text-xl font-bold">
                    Alumnos
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Consulta los alumnos inscritos.
                  </p>
                </Link>

                <Link
                  href={`/instructor/cursos/${course.id}/progreso`}
                  className="card p-6 hover:border-blue-300 transition"
                >
                  <h3 className="text-xl font-bold">
                    Progreso
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Consulta el avance de los alumnos.
                  </p>
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </AuthGuard>
  )
}
