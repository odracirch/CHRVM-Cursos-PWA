'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'

type Course = {
  id: string
  title: string
  published: boolean | null
}

type Enrollment = {
  id: string
  user_id: string
  course_id: string
  progress_percentage: number | null
  completed: boolean | null
}

type Stats = {
  users: number
  students: number
  instructors: number
  courses: number
  publishedCourses: number
  enrollments: number
  certificates: number
  completedEnrollments: number
  activeEnrollments: number
}

function StatisticsContent() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    students: 0,
    instructors: 0,
    courses: 0,
    publishedCourses: 0,
    enrollments: 0,
    certificates: 0,
    completedEnrollments: 0,
    activeEnrollments: 0,
  })

  const [topCourses, setTopCourses] = useState<
    { id: string; title: string; enrollments: number }[]
  >([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadStatistics() {
      try {
        setLoading(true)
        setError('')

        const [
          profilesResult,
          coursesResult,
          enrollmentsResult,
          certificatesResult,
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, rol'),

          supabase
            .from('courses')
            .select('id, title, published'),

          supabase
            .from('enrollments')
            .select(
              'id, user_id, course_id, progress_percentage, completed'
            ),

          supabase
            .from('certificates')
            .select('id'),
        ])

        if (profilesResult.error) throw profilesResult.error
        if (coursesResult.error) throw coursesResult.error
        if (enrollmentsResult.error) throw enrollmentsResult.error
        if (certificatesResult.error) throw certificatesResult.error

        const profiles = profilesResult.data || []
        const courses = coursesResult.data || []
        const enrollments = enrollmentsResult.data || []
        const certificates = certificatesResult.data || []

        const students = profiles.filter(
          (profile) => profile.rol === 'estudiante'
        ).length

        const instructors = profiles.filter(
          (profile) => profile.rol === 'instructor'
        ).length

        const publishedCourses = courses.filter(
          (course) => course.published === true
        ).length

        const completedEnrollments = enrollments.filter(
          (enrollment) => enrollment.completed === true
        ).length

        const activeEnrollments =
          enrollments.length - completedEnrollments

        setStats({
          users: profiles.length,
          students,
          instructors,
          courses: courses.length,
          publishedCourses,
          enrollments: enrollments.length,
          certificates: certificates.length,
          completedEnrollments,
          activeEnrollments,
        })

        const enrollmentCounts: Record<string, number> = {}

        for (const enrollment of enrollments) {
          enrollmentCounts[enrollment.course_id] =
            (enrollmentCounts[enrollment.course_id] || 0) + 1
        }

        const courseRanking = courses
          .map((course) => ({
            id: course.id,
            title: course.title,
            enrollments: enrollmentCounts[course.id] || 0,
          }))
          .sort((a, b) => b.enrollments - a.enrollments)
          .slice(0, 5)

        setTopCourses(courseRanking)
      } catch (err) {
        console.error('Error cargando estadísticas:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las estadísticas.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()
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
              Admin · Estadísticas
            </h1>

            <p className="text-slate-600 mt-2">
              Resumen general de la actividad de CHRVM Cursos.
            </p>
          </div>
        </div>

        {loading && (
          <div className="py-10 text-center text-slate-500">
            Cargando estadísticas...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">👥</div>
                <p className="text-sm text-slate-500 mt-3">
                  Usuarios registrados
                </p>
                <p className="text-3xl font-black mt-1">
                  {stats.users}
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">👨‍🎓</div>
                <p className="text-sm text-slate-500 mt-3">
                  Estudiantes
                </p>
                <p className="text-3xl font-black mt-1">
                  {stats.students}
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">👨‍🏫</div>
                <p className="text-sm text-slate-500 mt-3">
                  Instructores
                </p>
                <p className="text-3xl font-black mt-1">
                  {stats.instructors}
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">📚</div>
                <p className="text-sm text-slate-500 mt-3">
                  Cursos
                </p>
                <p className="text-3xl font-black mt-1">
                  {stats.courses}
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">🟢</div>
                <p className="text-sm text-slate-500 mt-3">
                  Cursos publicados
                </p>
                <p className="text-3xl font-black mt-1">
                  {stats.publishedCourses}
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">📝</div>
                <p className="text-sm text-slate-500 mt-3">
                  Inscripciones
                </p>
                <p className="text-3xl font-black mt-1">
                  {stats.enrollments}
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">🏆</div>
                <p className="text-sm text-slate-500 mt-3">
                  Certificados
                </p>
                <p className="text-3xl font-black mt-1">
                  {stats.certificates}
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">✅</div>
                <p className="text-sm text-slate-500 mt-3">
                  Cursos completados
                </p>
                <p className="text-3xl font-black mt-1">
                  {stats.completedEnrollments}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <section className="border border-slate-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold">
                  Estado de inscripciones
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      En progreso
                    </span>
                    <span className="font-bold">
                      {stats.activeEnrollments}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Completadas
                    </span>
                    <span className="font-bold">
                      {stats.completedEnrollments}
                    </span>
                  </div>
                </div>
              </section>

              <section className="border border-slate-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold">
                  Cursos publicados
                </h2>

                <div className="mt-5">
                  <p className="text-4xl font-black">
                    {stats.publishedCourses}
                    <span className="text-lg text-slate-400">
                      {' '}
                      / {stats.courses}
                    </span>
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    Publicados frente al total de cursos.
                  </p>
                </div>
              </section>
            </div>

            <section className="border border-slate-200 rounded-2xl p-6 mt-6">
              <h2 className="text-xl font-bold">
                Cursos con más inscripciones
              </h2>

              {topCourses.length === 0 ? (
                <p className="text-slate-500 mt-4">
                  No hay cursos registrados.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {topCourses.map((course, index) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between border-b last:border-0 pb-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-400">
                          #{index + 1}
                        </span>

                        <span className="font-semibold">
                          {course.title}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-slate-500">
                        {course.enrollments}{' '}
                        {course.enrollments === 1
                          ? 'inscripción'
                          : 'inscripciones'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard roles={['admin']}>
      <StatisticsContent />
    </AuthGuard>
  )
}
