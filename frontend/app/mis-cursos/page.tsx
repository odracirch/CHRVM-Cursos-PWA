'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
}

type Enrollment = {
  id: string
  course_id: string
  progress_percentage: number
  completed: boolean
  course: Course | null
}

export default function MisCursosPage() {
  const [courses, setCourses] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        setError('')

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (!user) {
          window.location.href = '/login'
          return
        }

        const { data: enrollments, error: enrollmentsError } =
          await supabase
            .from('enrollments')
            .select(
              'id, course_id, progress_percentage, completed, enrolled_at'
            )
            .eq('user_id', user.id)
            .order('enrolled_at', { ascending: false })

        if (enrollmentsError) {
          throw enrollmentsError
        }

        if (!enrollments || enrollments.length === 0) {
          setCourses([])
          setLoading(false)
          return
        }

        const courseIds = enrollments.map(
          (enrollment) => enrollment.course_id
        )

        const { data: coursesData, error: coursesError } =
          await supabase
            .from('courses')
            .select(
              'id, title, slug, description, image_url'
            )
            .in('id', courseIds)

        if (coursesError) {
          throw coursesError
        }

        const result: Enrollment[] = enrollments.map(
          (enrollment) => ({
            id: enrollment.id,
            course_id: enrollment.course_id,
            progress_percentage:
              Number(enrollment.progress_percentage) || 0,
            completed: enrollment.completed,
            course:
              coursesData?.find(
                (course) => course.id === enrollment.course_id
              ) ?? null,
          })
        )

        setCourses(result)
      } catch (err) {
        console.error(err)

        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al cargar tus cursos.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">

      <Link
        href="/dashboard"
        className="text-blue-600 font-semibold"
      >
        ← Dashboard
      </Link>

      <div className="mt-5">
        <h1 className="text-4xl font-black">
          Mis cursos
        </h1>

        <p className="text-slate-600 mt-2">
          Continúa aprendiendo donde lo dejaste.
        </p>
      </div>

      {loading && (
        <div className="mt-10 border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-slate-500">
            Cargando tus cursos...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-10 border border-red-200 bg-red-50 rounded-2xl p-6">
          <h2 className="font-bold text-red-700">
            No se pudieron cargar tus cursos
          </h2>

          <p className="text-red-600 mt-2 text-sm">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="mt-10 border border-slate-200 rounded-2xl p-10 text-center">

          <h2 className="text-2xl font-bold">
            Todavía no tienes cursos inscritos
          </h2>

          <p className="text-slate-500 mt-2">
            Explora el catálogo y comienza tu aprendizaje.
          </p>

          <Link
            href="/cursos"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Explorar cursos
          </Link>

        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

          {courses.map((enrollment) => {

            const course = enrollment.course

            if (!course) {
              return (
                <article
                  key={enrollment.id}
                  className="border border-yellow-200 bg-yellow-50 rounded-2xl p-6"
                >
                  <h2 className="font-bold">
                    Curso no disponible
                  </h2>

                  <p className="text-sm text-yellow-700 mt-2">
                    No se encontró la información del curso.
                  </p>
                </article>
              )
            }

            const progress = Math.max(
              0,
              Math.min(
                100,
                Number(enrollment.progress_percentage) || 0
              )
            )

            return (
              <article
                key={enrollment.id}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
              >

                <div className="h-44 bg-slate-900">

                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-white text-5xl font-black">
                        C
                      </span>
                    </div>
                  )}

                </div>

                <div className="p-6">

                  <span className="text-sm text-blue-600 font-semibold">
                    Mi curso
                  </span>

                  <h2 className="text-2xl font-bold mt-2">
                    {course.title}
                  </h2>

                  <p className="text-slate-600 text-sm mt-3">
                    {course.description}
                  </p>

                  <div className="mt-6">

                    <div className="flex justify-between text-sm mb-2">

                      <span className="font-semibold">
                        Progreso
                      </span>

                      <span className="text-slate-500">
                        {progress}%
                      </span>

                    </div>

                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${progress}%` }}
                      />

                    </div>

                  </div>

                  <Link
                    href={`/curso/${course.id}`}
                    className="block text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 mt-6 font-semibold"
                  >
                    {enrollment.completed
                      ? 'Ver curso'
                      : 'Continuar curso'}
                  </Link>

                </div>

              </article>
            )
          })}

        </div>
      )}

    </main>
  )
}
