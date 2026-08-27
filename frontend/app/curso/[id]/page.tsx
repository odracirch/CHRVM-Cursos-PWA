'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  published: boolean
}

type Module = {
  id: string
  title: string
  description: string | null
  position: number
}

type Lesson = {
  id: string
  title: string
  module_id: string
  position?: number
}

type Enrollment = {
  id: string
  progress_percentage: number | null
  completed: boolean | null
}

export default function CursoPage() {
  const params = useParams()
  const router = useRouter()

  const courseId = String(params.id)

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadCourse() {
      setLoading(true)
      setError('')

      try {
        /*
         * 1. Obtener el curso directamente desde Supabase.
         */
        const {
          data: courseData,
          error: courseError,
        } = await supabase
          .from('courses')
          .select(
            'id, title, slug, description, image_url, published'
          )
          .eq('id', courseId)
          .eq('published', true)
          .maybeSingle()

        if (courseError) {
          throw courseError
        }

        if (!courseData) {
          if (mounted) {
            setError('Curso no encontrado.')
          }
          return
        }

        if (!mounted) {
          return
        }

        setCourse(courseData)

        /*
         * 2. Obtener módulos.
         */
        const {
          data: moduleData,
          error: moduleError,
        } = await supabase
          .from('modules')
          .select(
            'id, title, description, position'
          )
          .eq('course_id', courseId)
          .order('position', {
            ascending: true,
          })

        if (moduleError) {
          console.error(
            'Error al cargar módulos:',
            moduleError
          )
        } else if (mounted) {
          setModules(moduleData || [])
        }

        /*
         * 3. Obtener lecciones.
         */
        const {
          data: lessonData,
          error: lessonError,
        } = await supabase
          .from('lessons')
          .select(
            'id, title, module_id, position'
          )
          .in(
            'module_id',
            (moduleData || []).map((module) => module.id)
          )
          .eq('published', true)
          .order('position', {
            ascending: true,
          })

        if (lessonError) {
          console.error(
            'Error al cargar lecciones:',
            lessonError
          )
        } else if (mounted) {
          setLessons(lessonData || [])
        }

        /*
         * 4. Obtener usuario actual.
         */
        const {
          data: {
            user,
          },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error(
            'Error al obtener usuario:',
            userError
          )
        }

        /*
         * 5. Comprobar inscripción.
         */
        if (user) {
          const {
            data: enrollment,
            error: enrollmentError,
          } = await supabase
            .from('enrollments')
            .select(
              'id, progress_percentage, completed'
            )
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle()

          if (enrollmentError) {
            console.error(
              'Error al consultar inscripción:',
              enrollmentError
            )
          } else if (enrollment) {
            const enrollmentData =
              enrollment as Enrollment

            if (mounted) {
              setEnrolled(true)

              setProgress(
                Number(
                  enrollmentData.progress_percentage
                ) || 0
              )

              setCompleted(
                enrollmentData.completed === true
              )
            }
          } else if (mounted) {
            setEnrolled(false)
            setProgress(0)
            setCompleted(false)
          }
        } else if (mounted) {
          setEnrolled(false)
          setProgress(0)
          setCompleted(false)
        }
      } catch (err) {
        console.error(
          'Error al cargar curso:',
          err
        )

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el curso.'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (courseId) {
      loadCourse()
    }

    return () => {
      mounted = false
    }
  }, [courseId])

  /*
   * Cargando.
   */
  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/cursos"
          className="text-blue-600 font-semibold"
        >
          ← Volver a cursos
        </Link>

        <section className="mt-6 rounded-3xl bg-slate-950 text-white p-8 md:p-12">
          <p className="text-slate-300">
            Cargando curso...
          </p>
        </section>
      </main>
    )
  }

  /*
   * Error o curso inexistente.
   */
  if (!course) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/cursos"
          className="text-blue-600 font-semibold"
        >
          ← Volver a cursos
        </Link>

        <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-2xl font-black text-red-700">
            No se pudo cargar el curso
          </h1>

          <p className="mt-3 text-red-600">
            {error || 'Curso no encontrado.'}
          </p>
        </section>
      </main>
    )
  }

  /*
   * Aquí TypeScript ya sabe que course NO es null.
   */
  const currentCourse = course

  /*
   * Obtener lecciones de un módulo.
   */
  function getModuleLessons(moduleId: string) {
    return lessons.filter(
      (lesson) => lesson.module_id === moduleId
    )
  }

  /*
   * Continuar curso.
   */
  function continueCourse() {
    if (lessons.length > 0) {
      router.push(
        `/curso/${currentCourse.id}/leccion/${lessons[0].id}`
      )
    }
  }

  /*
   * Comenzar curso.
   */
  function startCourse() {
    if (lessons.length > 0) {
      router.push(
        `/curso/${currentCourse.id}/leccion/${lessons[0].id}`
      )
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">

      {/* Volver */}
      <Link
        href="/cursos"
        className="text-blue-600 font-semibold"
      >
        ← Volver a cursos
      </Link>

      {/* Información del curso */}
      <section className="mt-6 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">

        {currentCourse.image_url && (
          <img
            src={currentCourse.image_url}
            alt={currentCourse.title}
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-8 md:p-10">

          <span className="text-blue-600 font-semibold">
            Curso
          </span>

          <h1 className="text-4xl md:text-5xl font-black mt-2">
            {currentCourse.title}
          </h1>

          {currentCourse.description && (
            <p className="text-slate-600 text-lg mt-4">
              {currentCourse.description}
            </p>
          )}

          {/* Estado de inscripción */}
          <div className="mt-8">

            {enrolled ? (
              <div>

                <button
                  onClick={continueCourse}
                  disabled={lessons.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {completed
                    ? 'Ver curso →'
                    : 'Continuar curso →'}
                </button>

                <p className="text-slate-600 mt-3 text-sm">
                  Progreso: {progress}%
                </p>

                <button
                  onClick={() =>
                    router.push(
                      `/curso/${currentCourse.id}/evaluacion`
                    )
                  }
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  📝 Presentar evaluación
                </button>

                {progress >= 100 && (
                  <p className="text-green-600 font-semibold mt-2">
                    ✓ Curso completado
                  </p>
                )}

              </div>
            ) : (
              <button
                onClick={startCourse}
                disabled={lessons.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {lessons.length > 0
                  ? 'Comenzar curso →'
                  : 'Curso próximamente'}
              </button>
            )}

          </div>

        </div>
      </section>

      {/* Contenido del curso */}
      <section className="mt-10">

        <h2 className="text-3xl font-black">
          Contenido del curso
        </h2>

        <p className="text-slate-500 mt-2">
          {modules.length} módulos · {lessons.length} lecciones
        </p>

        {modules.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-slate-500">
              Este curso todavía no tiene módulos.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">

            {modules.map((module) => {
              const moduleLessons =
                getModuleLessons(module.id)

              return (
                <div
                  key={module.id}
                  className="border border-slate-200 rounded-2xl bg-white overflow-hidden"
                >

                  {/* Módulo */}
                  <div className="bg-slate-100 px-6 py-4">

                    <h3 className="text-xl font-bold">
                      {module.title}
                    </h3>

                    {module.description && (
                      <p className="text-slate-600 mt-1">
                        {module.description}
                      </p>
                    )}

                  </div>

                  {/* Lecciones */}
                  <div className="p-4 space-y-2">

                    {moduleLessons.length === 0 ? (
                      <p className="text-slate-500 px-2 py-3">
                        Este módulo no tiene lecciones.
                      </p>
                    ) : (
                      moduleLessons.map(
                        (lesson, index) => (
                          <Link
                            key={lesson.id}
                            href={
                              enrolled
                                ? `/curso/${currentCourse.id}/leccion/${lesson.id}`
                                : '#'
                            }
                            onClick={(event) => {
                              if (!enrolled) {
                                event.preventDefault()
                              }
                            }}
                            className={`block rounded-xl border px-4 py-4 transition ${
                              enrolled
                                ? 'hover:bg-slate-50 hover:border-blue-300'
                                : 'opacity-70 cursor-not-allowed'
                            }`}
                          >

                            <div className="flex items-center gap-4">

                              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                                {index + 1}
                              </div>

                              <div className="flex-1">

                                <p className="font-semibold text-slate-900">
                                  {lesson.title}
                                </p>

                                {!enrolled && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    Inscríbete para acceder
                                  </p>
                                )}

                              </div>

                              {enrolled && (
                                <span className="text-blue-600 font-semibold">
                                  →
                                </span>
                              )}

                            </div>

                          </Link>
                        )
                      )
                    )}

                  </div>

                </div>
              )
            })}

          </div>
        )}

      </section>

    </main>
  )
}
