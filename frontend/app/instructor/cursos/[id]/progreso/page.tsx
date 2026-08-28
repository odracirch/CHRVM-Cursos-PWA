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

type Lesson = {
  id: string
  title: string
  module_id: string
}

type Module = {
  id: string
  title: string
}

type LessonProgress = {
  user_id: string
  lesson_id: string
  completed: boolean
}

type StudentProgress = {
  enrollment: Enrollment
  profile: Profile | null
  completed: number
  total: number
  percentage: number
  lessons: {
    id: string
    title: string
    moduleTitle: string
    completed: boolean
  }[]
}

export default function Page() {
  const params = useParams()
  const courseId = String(params.id)

  const [course, setCourse] = useState<Course | null>(null)
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .single()

      if (courseError) {
        console.error(courseError)
        setError(courseError.message)
        setCourse(null)
        setStudents([])
        setLoading(false)
        return
      }

      setCourse(courseData)

      const { data: enrollmentData, error: enrollmentError } =
        await supabase
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
        setError(profileError.message)
        setStudents([])
        setLoading(false)
        return
      }

      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('id, title')
        .eq('course_id', courseId)
        .order('position', { ascending: true })

      if (moduleError) {
        console.error(moduleError)
        setError(moduleError.message)
        setStudents([])
        setLoading(false)
        return
      }

      const modules = moduleData ?? []
      const moduleIds = modules.map((module) => module.id)

      let lessons: Lesson[] = []

      if (moduleIds.length > 0) {
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('id, title, module_id')
          .in('module_id', moduleIds)
          .order('position', { ascending: true })

        if (lessonError) {
          console.error(lessonError)
          setError(lessonError.message)
          setStudents([])
          setLoading(false)
          return
        }

        lessons = lessonData ?? []
      }

      const lessonIds = lessons.map((lesson) => lesson.id)

      let progressData: LessonProgress[] = []

      if (lessonIds.length > 0) {
        const { data, error: progressError } = await supabase
          .from('lesson_progress')
          .select('user_id, lesson_id, completed')
          .in('user_id', userIds)
          .in('lesson_id', lessonIds)

        if (progressError) {
          console.error(progressError)
          setError(progressError.message)
          setStudents([])
          setLoading(false)
          return
        }

        progressData = data ?? []
      }

      const profiles = profileData ?? []

      const result = enrollments.map((enrollment) => {
        const profile =
          profiles.find((item) => item.id === enrollment.user_id) ?? null

        const studentProgress = progressData.filter(
          (item) => item.user_id === enrollment.user_id,
        )

        const completed = lessons.filter((lesson) =>
          studentProgress.some(
            (progress) =>
              progress.lesson_id === lesson.id && progress.completed,
          ),
        ).length

        const total = lessons.length
        const percentage =
          total > 0 ? Math.round((completed / total) * 100) : 0

        const studentLessons = lessons.map((lesson) => {
          const module = modules.find(
            (item) => item.id === lesson.module_id,
          )

          return {
            id: lesson.id,
            title: lesson.title,
            moduleTitle: module?.title ?? 'Módulo',
            completed: studentProgress.some(
              (progress) =>
                progress.lesson_id === lesson.id && progress.completed,
            ),
          }
        })

        return {
          enrollment,
          profile,
          completed,
          total,
          percentage,
          lessons: studentLessons,
        }
      })

      setStudents(result)
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el progreso.',
      )
      setStudents([])
    } finally {
      setLoading(false)
    }
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
            {course?.title ?? 'Curso'} · Progreso
          </h1>

          <p className="text-slate-600 mt-2">
            Consulta el avance de los alumnos inscritos en este curso.
          </p>
        </div>

        <div className="card p-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Progreso de alumnos
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
              Cargando progreso...
            </p>
          ) : students.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 p-6">
              <p className="font-semibold">
                No hay alumnos inscritos.
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Cuando un estudiante se inscriba en este curso aparecerá
                aquí su progreso.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {students.map((student) => {
                const isExpanded =
                  expandedStudent === student.enrollment.user_id

                return (
                  <div
                    key={student.enrollment.id}
                    className="border border-slate-200 rounded-2xl p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold">
                          {studentName(student.profile)}
                        </h3>

                        {student.profile?.email && (
                          <p className="text-slate-600 mt-1">
                            {student.profile.email}
                          </p>
                        )}

                        <p className="text-sm text-slate-500 mt-2">
                          {student.completed} de {student.total}{' '}
                          {student.total === 1
                            ? 'lección completada'
                            : 'lecciones completadas'}
                        </p>

                        <div className="mt-3 w-full lg:w-96">
                          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full transition-all"
                              style={{
                                width: `${student.percentage}%`,
                              }}
                            />
                          </div>

                          <p className="text-sm font-semibold text-slate-700 mt-2">
                            {student.percentage}% completado
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedStudent(
                            isExpanded
                              ? null
                              : student.enrollment.user_id,
                          )
                        }
                        className="px-5 py-3 rounded-xl border border-slate-300 font-semibold"
                      >
                        {isExpanded
                          ? 'Ocultar detalle'
                          : 'Ver detalle'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <h4 className="font-bold mb-4">
                          Lecciones
                        </h4>

                        {student.lessons.length === 0 ? (
                          <p className="text-slate-500">
                            Este curso todavía no tiene lecciones.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {student.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm text-slate-500">
                                    {lesson.moduleTitle}
                                  </p>

                                  <p className="font-semibold">
                                    {lesson.title}
                                  </p>
                                </div>

                                <span
                                  className={
                                    lesson.completed
                                      ? 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap'
                                      : 'bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap'
                                  }
                                >
                                  {lesson.completed
                                    ? 'Completada'
                                    : 'Pendiente'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
