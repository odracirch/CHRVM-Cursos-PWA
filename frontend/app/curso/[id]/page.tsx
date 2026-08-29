'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CompleteLessonButton from '@/components/CompleteLessonButton'

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  published: boolean
  category_id: string | number | null
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
  const courseId = String(params.id)

  const [course, setCourse] = useState<Course | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadCourse() {
      try {
        setLoading(true)
        setError('')

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = '/login'
          return
        }

        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select(
            'id, title, slug, description, image_url, published, category_id'
          )
          .eq('id', courseId)
          .eq('published', true)
          .maybeSingle()

        if (courseError) throw courseError

        if (!courseData) {
          throw new Error('Curso no encontrado.')
        }

        if (!mounted) return

        setCourse(courseData)

        if (courseData.category_id) {
          const { data: categoryData } = await supabase
            .from('courses_category')
            .select('name')
            .eq('id', courseData.category_id)
            .maybeSingle()

          if (mounted) {
            setCategoryName(categoryData?.name ?? '')
          }
        }

        const { data: enrollment, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('id, progress_percentage, completed')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle()

        if (enrollmentError) {
          console.error('Error consultando inscripción:', enrollmentError)
        }

        if (enrollment) {
          const enrollmentData = enrollment as Enrollment

          if (mounted) {
            setEnrolled(true)
            setProgress(Number(enrollmentData.progress_percentage) || 0)
            setCompleted(enrollmentData.completed === true)
          }
        }

        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('id, title, description, position')
          .eq('course_id', courseId)
          .order('position', { ascending: true })

        if (moduleError) {
          throw moduleError
        }

        const loadedModules = moduleData || []

        if (mounted) {
          setModules(loadedModules)
        }

        if (loadedModules.length > 0) {
          const moduleIds = loadedModules.map((module) => module.id)

          const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .select('id, title, module_id, position')
            .in('module_id', moduleIds)
            .eq('published', true)
            .order('position', { ascending: true })

          if (lessonError) {
            throw lessonError
          }

          if (mounted) {
            setLessons(lessonData || [])
          }
        } else if (mounted) {
          setLessons([])
        }
      } catch (err) {
        console.error('Error al cargar curso:', err)

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

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/mis-cursos"
          className="text-blue-600 font-semibold"
        >
          ← Mis cursos
        </Link>

        <section className="mt-6 rounded-3xl bg-slate-950 text-white p-8 md:p-12">
          <p className="text-slate-300">
            Cargando curso...
          </p>
        </section>
      </main>
    )
  }

  if (error || !course) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/mis-cursos"
          className="text-blue-600 font-semibold"
        >
          ← Mis cursos
        </Link>

        <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-2xl font-black text-red-700">
            No se pudo cargar el curso
          </h1>

          <p className="text-red-600 mt-2">
            {error || 'Curso no encontrado.'}
          </p>
        </section>
      </main>
    )
  }

  const moduleCount = modules.length
  const lessonCount = lessons.length

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href="/mis-cursos"
        className="text-blue-600 font-semibold"
      >
        ← Mis cursos
      </Link>

      <section className="mt-6 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        {course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="h-32 bg-slate-950 flex items-center justify-center">
            <span className="text-white text-5xl font-black">
              C
            </span>
          </div>
        )}

        <div className="p-8">
          <span className="text-blue-600 font-semibold">
            {categoryName || 'Sin categoría'}
          </span>

          <h1 className="text-4xl font-black mt-2">
            {course.title}
          </h1>

          <p className="text-slate-600 text-lg mt-4">
            {course.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="font-semibold">
              Progreso: {progress}%
            </div>

            {completed && (
              <div className="text-green-600 font-semibold">
                ✓ Curso completado
              </div>
            )}
          </div>

          {enrolled && lessonCount > 0 && (
            <div className="mt-8">
              <CompleteLessonButton
                lessonId={lessons[0].id}
                courseId={course.id}
              />
            </div>
          )}

          {progress >= 100 && (
            <div className="mt-6">
              <Link
                href={`/curso/${course.id}/evaluacion`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
              >
                📝 Presentar evaluación
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-black">
          Contenido del curso
        </h2>

        <p className="text-slate-500 mt-2">
          {moduleCount} módulos · {lessonCount} lecciones
        </p>

        <div className="mt-6 space-y-5">
          {modules.map((module, index) => {
            const moduleLessons = lessons.filter(
              (lesson) => lesson.module_id === module.id
            )

            return (
              <article
                key={module.id}
                className="border border-slate-200 rounded-2xl p-6 bg-white"
              >
                <h3 className="text-xl font-bold">
                  Módulo {index + 1}
                </h3>

                <p className="font-semibold mt-2">
                  {module.title}
                </p>

                {module.description && (
                  <p className="text-slate-600 text-sm mt-2">
                    {module.description}
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  {moduleLessons.map((lesson, lessonIndex) => (
                    <Link
                      key={lesson.id}
                      href={`/curso/${course.id}/leccion/${lesson.id}`}
                      className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50"
                    >
                      <span>
                        {lessonIndex + 1}. {lesson.title}
                      </span>

                      <span>
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
