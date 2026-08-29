'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'

type Enrollment = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string | null
  progress_percentage: number | null
  completed: boolean | null
  completed_at: string | null
}

type Profile = {
  id: string
  nombre: string
  apellidos: string | null
  email: string | null
}

type Course = {
  id: string
  title: string
}

function EnrollmentsContent() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadEnrollments() {
      try {
        setLoading(true)
        setError('')

        const { data: enrollmentData, error: enrollmentError } =
          await supabase
            .from('enrollments')
            .select(
              'id, user_id, course_id, enrolled_at, progress_percentage, completed, completed_at'
            )
            .order('enrolled_at', { ascending: false })

        if (enrollmentError) throw enrollmentError

        const enrollmentList = enrollmentData || []
        setEnrollments(enrollmentList)

        if (enrollmentList.length === 0) {
          setProfiles({})
          setCourses({})
          return
        }

        const userIds = [
          ...new Set(
            enrollmentList.map((enrollment) => enrollment.user_id)
          ),
        ]

        const courseIds = [
          ...new Set(
            enrollmentList.map((enrollment) => enrollment.course_id)
          ),
        ]

        const [
          { data: profileData, error: profileError },
          { data: courseData, error: courseError },
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, nombre, apellidos, email')
            .in('id', userIds),

          supabase
            .from('courses')
            .select('id, title')
            .in('id', courseIds),
        ])

        if (profileError) throw profileError
        if (courseError) throw courseError

        const profileMap: Record<string, Profile> = {}

        for (const profile of profileData || []) {
          profileMap[profile.id] = profile
        }

        const courseMap: Record<string, Course> = {}

        for (const course of courseData || []) {
          courseMap[course.id] = course
        }

        setProfiles(profileMap)
        setCourses(courseMap)
      } catch (err) {
        console.error('Error cargando inscripciones:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las inscripciones.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadEnrollments()
  }, [])

  const completedCount = enrollments.filter(
    (enrollment) => enrollment.completed === true
  ).length

  const inProgressCount =
    enrollments.length - completedCount

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-5">
        <AdminBackButton />
      </div>

      <div className="card p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black">
              Admin · Inscripciones
            </h1>

            <p className="text-slate-600 mt-2">
              Inscripciones de alumnos en los cursos de CHRVM Cursos.
            </p>
          </div>

          {!loading && !error && (
            <div className="text-sm text-slate-500">
              {enrollments.length}{' '}
              {enrollments.length === 1
                ? 'inscripción'
                : 'inscripciones'}
            </div>
          )}
        </div>

        {loading && (
          <div className="py-10 text-center text-slate-500">
            Cargando inscripciones...
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">📝</div>

                <p className="text-sm text-slate-500 mt-3">
                  Total
                </p>

                <p className="text-3xl font-black mt-1">
                  {enrollments.length}
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">⏳</div>

                <p className="text-sm text-slate-500 mt-3">
                  En progreso
                </p>

                <p className="text-3xl font-black mt-1">
                  {inProgressCount}
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5">
                <div className="text-3xl">✅</div>

                <p className="text-sm text-slate-500 mt-3">
                  Completadas
                </p>

                <p className="text-3xl font-black mt-1">
                  {completedCount}
                </p>
              </div>
            </div>

            {enrollments.length === 0 ? (
              <div className="mt-8 border border-slate-200 rounded-2xl p-8 text-center">
                <div className="text-5xl">📝</div>

                <h2 className="text-xl font-bold mt-4">
                  No hay inscripciones
                </h2>

                <p className="text-slate-500 mt-2">
                  Las inscripciones de los alumnos aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-3 py-3 font-semibold">
                        Alumno
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Curso
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Inscripción
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Progreso
                      </th>

                      <th className="px-3 py-3 font-semibold">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {enrollments.map((enrollment) => {
                      const profile =
                        profiles[enrollment.user_id]

                      const course =
                        courses[enrollment.course_id]

                      const fullName =
                        [
                          profile?.nombre,
                          profile?.apellidos,
                        ]
                          .filter(Boolean)
                          .join(' ') ||
                        profile?.email ||
                        'Usuario'

                      const progress = Math.max(
                        0,
                        Math.min(
                          100,
                          Number(
                            enrollment.progress_percentage ?? 0
                          )
                        )
                      )

                      const enrolledDate =
                        enrollment.enrolled_at
                          ? new Date(
                              enrollment.enrolled_at
                            ).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'

                      return (
                        <tr
                          key={enrollment.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-3 py-4">
                            <div className="font-semibold">
                              {fullName}
                            </div>

                            {profile?.email && (
                              <div className="text-xs text-slate-400 mt-1">
                                {profile.email}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-4 font-semibold">
                            {course?.title || 'Curso'}
                          </td>

                          <td className="px-3 py-4 text-slate-500">
                            {enrolledDate}
                          </td>

                          <td className="px-3 py-4 min-w-[150px]">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-semibold">
                                {progress}%
                              </span>

                              <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-slate-700 rounded-full"
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            {enrollment.completed ? (
                              <span className="font-semibold text-green-600">
                                Completado
                              </span>
                            ) : (
                              <span className="font-semibold text-amber-600">
                                En progreso
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard roles={['admin']}>
      <EnrollmentsContent />
    </AuthGuard>
  )
}
