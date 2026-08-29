'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'

type Course = {
  id: string
  title: string
  description: string | null
}

type Enrollment = {
  id: string
  course_id: string
  progress_percentage: number
  completed: boolean
}

type ProgressItem = Enrollment & {
  course: Course | null
  totalLessons: number
  completedLessons: number
}

type Evaluation = {
  id: string
  course_id: string
  title: string
  minimum_pass_percentage: number
}

type EvaluationAttempt = {
  id: string
  evaluation_id: string
  grade: number
  passed: boolean
  created_at: string
}

type EvaluationAttemptView = EvaluationAttempt & {
  evaluation: Evaluation | null
  course: Course | null
}

export default function Page() {
  const [items, setItems] = useState<ProgressItem[]>([])
  const [attempts, setAttempts] = useState<EvaluationAttemptView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true)
        setError('')

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError

        if (!user) {
          window.location.href = '/login'
          return
        }

        const { data: enrollments, error: enrollmentsError } =
          await supabase
            .from('enrollments')
            .select('id, course_id, progress_percentage, completed')
            .eq('user_id', user.id)

        if (enrollmentsError) throw enrollmentsError

        if (!enrollments || enrollments.length === 0) {
          setItems([])
          setAttempts([])
          return
        }

        const courseIds = enrollments.map((item) => item.course_id)

        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, description')
          .in('id', courseIds)

        if (coursesError) throw coursesError

        const { data: modules, error: modulesError } = await supabase
          .from('modules')
          .select('id, course_id')
          .in('course_id', courseIds)

        if (modulesError) throw modulesError

        const moduleIds = (modules ?? []).map((module) => module.id)

        let lessons: { id: string; module_id: string }[] = []

        if (moduleIds.length > 0) {
          const { data: lessonsData, error: lessonsError } =
            await supabase
              .from('lessons')
              .select('id, module_id')
              .in('module_id', moduleIds)

          if (lessonsError) throw lessonsError

          lessons = lessonsData ?? []
        }

        const lessonIds = lessons.map((lesson) => lesson.id)

        let progressRows: {
          lesson_id: string
          completed: boolean
        }[] = []

        if (lessonIds.length > 0) {
          const { data: progressData, error: progressError } =
            await supabase
              .from('lesson_progress')
              .select('lesson_id, completed')
              .eq('user_id', user.id)
              .in('lesson_id', lessonIds)

          if (progressError) throw progressError

          progressRows = progressData ?? []
        }

        const result: ProgressItem[] = enrollments.map((enrollment) => {
          const courseModules = (modules ?? [])
            .filter(
              (module) => module.course_id === enrollment.course_id,
            )
            .map((module) => module.id)

          const courseLessons = lessons.filter((lesson) =>
            courseModules.includes(lesson.module_id),
          )

          const completedLessons = courseLessons.filter((lesson) =>
            progressRows.some(
              (progress) =>
                progress.lesson_id === lesson.id &&
                progress.completed,
            ),
          ).length

          const totalLessons = courseLessons.length

          const calculatedProgress =
            totalLessons > 0
              ? Math.round(
                  (completedLessons / totalLessons) * 100,
                )
              : Number(enrollment.progress_percentage) || 0

          return {
            id: enrollment.id,
            course_id: enrollment.course_id,
            progress_percentage: calculatedProgress,
            completed:
              calculatedProgress >= 100 ||
              enrollment.completed,
            course:
              courses?.find(
                (course) => course.id === enrollment.course_id,
              ) ?? null,
            totalLessons,
            completedLessons,
          }
        })

        setItems(result)

        /*
         * Cargar evaluaciones de los cursos inscritos.
         */
        const { data: evaluations, error: evaluationsError } =
          await supabase
            .from('evaluations')
            .select(
              'id, course_id, title, minimum_pass_percentage',
            )
            .in('course_id', courseIds)

        if (evaluationsError) throw evaluationsError

        if (!evaluations || evaluations.length === 0) {
          setAttempts([])
          return
        }

        const evaluationIds = evaluations.map(
          (evaluation) => evaluation.id,
        )

        /*
         * RLS permite al alumno consultar solamente
         * sus propios intentos.
         */
        const { data: attemptsData, error: attemptsError } =
          await supabase
            .from('evaluation_attempts')
            .select(
              'id, evaluation_id, grade, passed, created_at',
            )
            .in('evaluation_id', evaluationIds)
            .order('created_at', {
              ascending: false,
            })

        if (attemptsError) throw attemptsError

        const attemptViews: EvaluationAttemptView[] = (
          attemptsData ?? []
        ).map((attempt) => {
          const evaluation =
            evaluations.find(
              (item) => item.id === attempt.evaluation_id,
            ) ?? null

          const course =
            courses?.find(
              (item) => item.id === evaluation?.course_id,
            ) ?? null

          return {
            ...attempt,
            grade: Number(attempt.grade),
            evaluation,
            course,
          }
        })

        setAttempts(attemptViews)
      } catch (err) {
        console.error(err)

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar tu progreso.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [])

  function formatDate(value: string) {
    return new Date(value).toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const bestGrade =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => Number(attempt.grade)))
      : 0

  return (
    <AuthGuard roles={['estudiante']}>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <Link
          href="/dashboard"
          className="text-blue-600 font-semibold"
        >
          ← Dashboard
        </Link>

        <div className="mt-5">
          <h1 className="text-4xl font-black">
            Mi progreso
          </h1>

          <p className="text-slate-600 mt-2">
            Consulta tu avance en los cursos y el historial de tus evaluaciones.
          </p>
        </div>

        {loading && (
          <div className="mt-10 border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-slate-500">
              Cargando tu progreso...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-10 border border-red-200 bg-red-50 rounded-2xl p-6">
            <h2 className="font-bold text-red-700">
              No se pudo cargar tu progreso
            </h2>

            <p className="text-red-600 mt-2 text-sm">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {items.length === 0 ? (
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
            ) : (
              <>
                <section className="grid gap-6 mt-10">
                  {items.map((item) => {
                    const progress = Math.max(
                      0,
                      Math.min(100, item.progress_percentage),
                    )

                    return (
                      <article
                        key={item.id}
                        className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h2 className="text-2xl font-bold">
                              {item.course?.title ??
                                'Curso no disponible'}
                            </h2>

                            {item.course?.description && (
                              <p className="text-slate-600 mt-2">
                                {item.course.description}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-3xl font-black">
                              {progress}%
                            </span>

                            <p className="text-sm text-slate-500">
                              {item.completed
                                ? 'Curso completado'
                                : 'En progreso'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <p className="text-sm text-slate-600">
                            {item.completedLessons} de{' '}
                            {item.totalLessons} lecciones completadas
                          </p>

                          <Link
                            href={`/curso/${item.course_id}`}
                            className="inline-block text-center bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-semibold"
                          >
                            {item.completed
                              ? 'Ver curso'
                              : 'Continuar curso'}
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </section>

                <section className="mt-12">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                      <h2 className="text-3xl font-black">
                        Mis evaluaciones
                      </h2>

                      <p className="text-slate-600 mt-2">
                        Consulta tus intentos y resultados.
                      </p>
                    </div>

                    {attempts.length > 0 && (
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-500">
                          Intentos realizados
                        </p>

                        <p className="text-2xl font-black">
                          {attempts.length}
                        </p>
                      </div>
                    )}
                  </div>

                  {attempts.length === 0 ? (
                    <div className="mt-6 border border-slate-200 rounded-2xl bg-white p-8 text-center">
                      <div className="text-4xl mb-3">
                        📝
                      </div>

                      <h3 className="text-xl font-bold">
                        Todavía no tienes intentos de evaluación
                      </h3>

                      <p className="text-slate-500 mt-2">
                        Cuando realices una evaluación, aquí aparecerá tu resultado.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border border-slate-200 rounded-2xl bg-white p-5">
                          <p className="text-sm text-slate-500">
                            Total de intentos
                          </p>

                          <p className="text-3xl font-black mt-1">
                            {attempts.length}
                          </p>
                        </div>

                        <div className="border border-slate-200 rounded-2xl bg-white p-5">
                          <p className="text-sm text-slate-500">
                            Mejor calificación
                          </p>

                          <p className="text-3xl font-black mt-1">
                            {bestGrade}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        {attempts.map((attempt, index) => (
                          <article
                            key={attempt.id}
                            className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm"
                          >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div>
                                <p className="text-sm text-slate-500">
                                  Intento {attempts.length - index}
                                </p>

                                <h3 className="text-xl font-bold mt-1">
                                  {attempt.evaluation?.title ??
                                    'Evaluación'}
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                  {attempt.course?.title ??
                                    'Curso'}
                                </p>

                                <p className="text-sm text-slate-400 mt-2">
                                  {formatDate(attempt.created_at)}
                                </p>
                              </div>

                              <div className="flex items-center gap-5">
                                <div className="text-right">
                                  <p className="text-sm text-slate-500">
                                    Calificación
                                  </p>

                                  <p className="text-3xl font-black">
                                    {Number(attempt.grade)}%
                                  </p>
                                </div>

                                <span
                                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                                    attempt.passed
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {attempt.passed
                                    ? '✓ Aprobado'
                                    : '✗ No aprobado'}
                                </span>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>
    </AuthGuard>
  )
}
