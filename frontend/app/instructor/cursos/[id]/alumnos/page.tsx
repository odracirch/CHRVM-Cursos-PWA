'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

type Course = {
  id: string
  title: string
}

type Enrollment = {
  id: string
  user_id: string
}

type Profile = {
  id: string
  email: string | null
  nombre: string | null
  apellidos: string | null
}

type Student = {
  enrollment: Enrollment
  profile: Profile | null
}

export default function Page() {
  const params = useParams()
  const courseId = String(params.id)

  const [course, setCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single()

    if (courseError) {
      console.error(courseError)
      setError(courseError.message)
      setCourse(null)
      setLoading(false)
      return
    }

    setCourse(courseData)

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, user_id')
      .eq('course_id', courseId)

    if (enrollmentError) {
      console.error(enrollmentError)
      setError(enrollmentError.message)
      setStudents([])
      setLoading(false)
      return
    }

    const enrollments = enrollmentData ?? []

    if (enrollments.length === 0) {
      setStudents([])
      setLoading(false)
      return
    }

    const userIds = enrollments.map((item) => item.user_id)

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, nombre, apellidos')
      .in('id', userIds)

    if (profileError) {
      console.error(profileError)

      setStudents(
        enrollments.map((enrollment) => ({
          enrollment,
          profile: null,
        })),
      )

      setError(profileError.message)
      setLoading(false)
      return
    }

    const profiles = profileData ?? []

    setStudents(
      enrollments.map((enrollment) => ({
        enrollment,
        profile:
          profiles.find((profile) => profile.id === enrollment.user_id) ?? null,
      })),
    )

    setLoading(false)
  }

  useEffect(() => {
    if (courseId) {
      loadData()
    }
  }, [courseId])

  function studentName(profile: Profile | null) {
    if (!profile) return 'Alumno'

    const fullName = [profile.nombre, profile.apellidos]
      .filter(Boolean)
      .join(' ')
      .trim()

    return fullName || profile.email || 'Alumno'
  }

  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <Link
            href={`/instructor/cursos/${courseId}`}
            className="inline-block font-semibold text-slate-700 hover:text-blue-600"
          >
            ← Volver al curso
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-black">
            {course?.title ?? 'Curso'} · Alumnos
          </h1>

          <p className="text-slate-600 mt-2">
            Consulta los alumnos inscritos en este curso.
          </p>
        </div>

        <div className="card p-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Alumnos inscritos
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {students.length}{' '}
                {students.length === 1 ? 'alumno' : 'alumnos'}
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-slate-500">
              Cargando alumnos...
            </p>
          ) : students.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 p-6">
              <p className="font-semibold">
                No hay alumnos inscritos.
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Cuando un estudiante se inscriba en este curso aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map(({ enrollment, profile }) => (
                <div
                  key={enrollment.id}
                  className="border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        {studentName(profile)}
                      </h3>

                      {profile?.email && (
                        <p className="text-slate-600 mt-1">
                          {profile.email}
                        </p>
                      )}

                      <p className="text-sm text-slate-500 mt-2">
                        Inscripción registrada
                      </p>
                    </div>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold w-fit">
                      Inscrito
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
