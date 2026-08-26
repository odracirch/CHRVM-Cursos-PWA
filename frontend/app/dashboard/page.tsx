'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'

type Profile = {
  id: string
  nombre: string
  apellidos: string
  email: string
  rol: string
  avatar_url: string | null
  activo: boolean
}

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
  courses: Course[] | null
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setCoursesLoading(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileError && profileData) {
        setProfile(profileData)
      }

      setLoading(false)

      const { data: enrollmentData, error: enrollmentError } =
        await supabase
          .from('enrollments')
          .select(`
            id,
            course_id,
            progress_percentage,
            completed,
            courses (
              id,
              title,
              slug,
              description,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('enrolled_at', { ascending: false })

      if (enrollmentError) {
        setError(enrollmentError.message)
        setEnrollments([])
      } else {
        setEnrollments(
          (enrollmentData ?? []) as unknown as Enrollment[]
        )
      }

      setCoursesLoading(false)
    }

    loadDashboard()
  }, [router])

  async function logout() {
    await supabase.auth.signOut()

    localStorage.removeItem('chrvm_access')
    localStorage.removeItem('chrvm_refresh')

    router.replace('/login')
  }

  return (
    <AuthGuard roles={['admin', 'instructor', 'student']}>
      <div className="max-w-6xl mx-auto px-4 py-10">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-black">
              Hola, {loading ? '...' : profile?.nombre || 'estudiante'} 👋
            </h1>

            <p className="text-slate-600 mt-2">
              Continúa tu aprendizaje en CHRVM Cursos.
            </p>
          </div>

          <button
            onClick={logout}
            className="border border-slate-300 rounded-lg px-4 py-2 font-semibold hover:bg-slate-50"
          >
            Cerrar sesión
          </button>

        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-8">

          <div className="card p-5">
            <div className="text-sm text-slate-500">
              Usuario
            </div>

            <b className="text-lg">
              {profile?.email || 'Cargando...'}
            </b>
          </div>

          <div className="card p-5">
            <div className="text-sm text-slate-500">
              Rol
            </div>

            <b className="text-lg capitalize">
              {profile?.rol || 'estudiante'}
            </b>
          </div>

          <div className="card p-5">
            <Link
              href="/cursos"
              className="font-semibold text-brand-600"
            >
              Explorar catálogo →
            </Link>
          </div>

        </div>

        <section className="mt-10">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Mi aprendizaje
            </h2>

            <Link
              href="/mis-cursos"
              className="text-sm font-semibold text-blue-600"
            >
              Ver todos →
            </Link>

          </div>

          {coursesLoading && (
            <div className="card p-6 mt-4">
              <p className="text-slate-500">
                Cargando tus cursos...
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 border border-red-200 bg-red-50 rounded-xl p-5">

              <p className="font-semibold text-red-700">
                No se pudieron cargar tus cursos
              </p>

              <p className="text-red-600 text-sm mt-2">
                {error}
              </p>

            </div>
          )}

          {!coursesLoading &&
            !error &&
            enrollments.length === 0 && (
              <div className="card p-6 mt-4">

                <h3 className="text-lg font-bold">
                  Todavía no tienes cursos inscritos.
                </h3>

                <p className="text-slate-600 mt-2">
                  Explora el catálogo y comienza tu aprendizaje.
                </p>

                <Link
                  href="/cursos"
                  className="inline-block mt-4 bg-brand-600 text-white rounded-lg px-5 py-3 font-semibold"
                >
                  Explorar cursos
                </Link>

              </div>
            )}

          {!coursesLoading &&
            !error &&
            enrollments.length > 0 && (

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">

                {enrollments.map((enrollment) => {

                  const course = Array.isArray(enrollment.courses)
                    ? enrollment.courses[0]
                    : null

                  if (!course) {
                    return null
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

                      <div className="h-40 bg-slate-900">

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

                      <div className="p-5">

                        <span className="text-sm text-blue-600 font-semibold">
                          Mi curso
                        </span>

                        <h3 className="text-xl font-bold mt-2">
                          {course.title}
                        </h3>

                        <p className="text-slate-600 text-sm mt-2 line-clamp-3">
                          {course.description}
                        </p>

                        <div className="mt-5">

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
                              style={{
                                width: `${progress}%`,
                              }}
                            />

                          </div>

                        </div>

                        <Link
                          href={`/cursos/${course.slug}`}
                          className="inline-block mt-5 bg-blue-600 text-white rounded-lg px-5 py-3 font-semibold"
                        >
                          Continuar curso →
                        </Link>

                      </div>

                    </article>
                  )
                })}

              </div>
            )}

        </section>

      </div>
    </AuthGuard>
  )
}
