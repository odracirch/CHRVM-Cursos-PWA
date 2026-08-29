'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'

type Instructor = {
  id: string
  nombre: string
  apellidos: string | null
  email: string | null
  activo: boolean | null
}

type Course = {
  id: string
  title: string
  published: boolean | null
  instructor_id: string | null
}

function InstructorsContent() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInstructors() {
      try {
        setLoading(true)
        setError('')

        const { data: instructorData, error: instructorError } =
          await supabase
            .from('profiles')
            .select('id, nombre, apellidos, email, activo')
            .eq('rol', 'instructor')
            .order('nombre', { ascending: true })

        if (instructorError) throw instructorError

        const instructorList = instructorData || []
        setInstructors(instructorList)

        if (instructorList.length === 0) {
          setCourses([])
          return
        }

        const instructorIds = instructorList.map(
          (instructor) => instructor.id
        )

        const { data: courseData, error: courseError } =
          await supabase
            .from('courses')
            .select('id, title, published, instructor_id')
            .in('instructor_id', instructorIds)
            .order('title', { ascending: true })

        if (courseError) throw courseError

        setCourses(courseData || [])
      } catch (err) {
        console.error('Error cargando instructores:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los instructores.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadInstructors()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-5">
        <AdminBackButton />
      </div>

      <div className="card p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black">
              Admin · Instructores
            </h1>

            <p className="text-slate-600 mt-2">
              Instructores registrados y cursos asignados.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {instructors.length}{' '}
            {instructors.length === 1 ? 'instructor' : 'instructores'}
          </div>
        </div>

        {loading && (
          <div className="py-10 text-center text-slate-500">
            Cargando instructores...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && instructors.length === 0 && (
          <div className="mt-8 border border-slate-200 rounded-2xl p-8 text-center">
            <div className="text-5xl">👨‍🏫</div>

            <h2 className="text-xl font-bold mt-4">
              No hay instructores registrados
            </h2>

            <p className="text-slate-500 mt-2">
              Los usuarios con rol instructor aparecerán aquí.
            </p>
          </div>
        )}

        {!loading && !error && instructors.length > 0 && (
          <div className="mt-8 space-y-5">
            {instructors.map((instructor) => {
              const instructorCourses = courses.filter(
                (course) =>
                  course.instructor_id === instructor.id
              )

              const fullName =
                [instructor.nombre, instructor.apellidos]
                  .filter(Boolean)
                  .join(' ') || 'Instructor'

              return (
                <article
                  key={instructor.id}
                  className="border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold">
                        {fullName}
                      </h2>

                      <p className="text-sm text-slate-500 mt-1">
                        {instructor.email || 'Sin email'}
                      </p>

                      <div className="mt-3">
                        {instructor.activo === false ? (
                          <span className="text-sm font-semibold text-red-600">
                            Inactivo
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-green-600">
                            Activo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-slate-500">
                      {instructorCourses.length}{' '}
                      {instructorCourses.length === 1
                        ? 'curso asignado'
                        : 'cursos asignados'}
                    </div>
                  </div>

                  <div className="mt-5">
                    {instructorCourses.length === 0 ? (
                      <p className="text-sm text-slate-500 border-t pt-4">
                        No tiene cursos asignados.
                      </p>
                    ) : (
                      <div className="border-t pt-4 space-y-3">
                        {instructorCourses.map((course) => (
                          <div
                            key={course.id}
                            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-slate-100 rounded-xl p-4"
                          >
                            <div>
                              <h3 className="font-semibold">
                                {course.title}
                              </h3>

                              <p className="text-xs text-slate-500 mt-1">
                                {course.published
                                  ? 'Publicado'
                                  : 'Oculto'}
                              </p>
                            </div>

                            <Link
                              href={`/admin/cursos`}
                              className="inline-block border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-semibold text-center"
                            >
                              Administrar cursos
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard roles={['admin']}>
      <InstructorsContent />
    </AuthGuard>
  )
}
