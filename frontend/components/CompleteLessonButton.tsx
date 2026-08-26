'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  lessonId: string
  courseId: string
}

export default function CompleteLessonButton({
  lessonId,
  courseId,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function checkProgress() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('lesson_progress')
        .select('completed')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle()

      if (data?.completed) {
        setCompleted(true)
      }
    }

    checkProgress()
  }, [lessonId])

  async function markCompleted() {
    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    // Registrar la lección como completada
    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('lesson_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }
    }

    // Obtener los módulos del curso
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId)

    if (modulesError) {
      setMessage(modulesError.message)
      setLoading(false)
      return
    }

    const moduleIds = (modules ?? []).map((module) => module.id)

    if (moduleIds.length === 0) {
      setMessage('No se encontraron módulos para este curso.')
      setLoading(false)
      return
    }

    // Obtener todas las lecciones del curso
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds)
      .eq('published', true)

    if (lessonsError) {
      setMessage(lessonsError.message)
      setLoading(false)
      return
    }

    const totalLessons = lessons?.length ?? 0

    if (totalLessons === 0) {
      setMessage('Este curso todavía no tiene lecciones publicadas.')
      setLoading(false)
      return
    }

    const lessonIds = lessons.map((lesson) => lesson.id)

    // Obtener las lecciones completadas por el alumno
    const { data: completedLessons, error: progressError } =
      await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('lesson_id', lessonIds)

    if (progressError) {
      setMessage(progressError.message)
      setLoading(false)
      return
    }

    const completedCount = completedLessons?.length ?? 0

    const progress = Math.min(
      100,
      Math.round((completedCount / totalLessons) * 100)
    )

    const isCourseCompleted = progress >= 100

    // Actualizar el progreso de la inscripción
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (!enrollment) {
      setMessage('No estás inscrito en este curso.')
      setLoading(false)
      return
    }

    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .update({
        progress_percentage: progress,
        completed: isCourseCompleted,
        completed_at: isCourseCompleted
          ? new Date().toISOString()
          : null,
      })
      .eq('id', enrollment.id)

    if (enrollmentError) {
      setMessage(enrollmentError.message)
      setLoading(false)
      return
    }

    setCompleted(true)

    if (isCourseCompleted) {
      setMessage('¡Felicidades! Has completado el curso.')
    } else {
      setMessage(`Lección completada. Tu progreso es ${progress}%.`)
    }

    setLoading(false)
  }

  return (
    <div className="mt-8">
      <button
        onClick={markCompleted}
        disabled={loading || completed}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {loading
          ? 'Guardando...'
          : completed
            ? '✓ Lección completada'
            : 'Marcar como completada'}
      </button>

      {message && (
        <p className="text-green-600 font-semibold mt-3">
          {message}
        </p>
      )}
    </div>
  )
}
