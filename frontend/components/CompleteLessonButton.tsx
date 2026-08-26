'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Props = {
  lessonId: string
  courseId: string
}

type NextLesson = {
  id: string
  title: string
}

export default function CompleteLessonButton({
  lessonId,
  courseId,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [message, setMessage] = useState('')
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null)

  useEffect(() => {
    async function loadProgress() {
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
        await findNextLesson()
      }
    }

    loadProgress()
  }, [lessonId, courseId])

  async function findNextLesson() {
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, position')
      .eq('course_id', courseId)
      .order('position', { ascending: true })

    if (modulesError || !modules) return

    const moduleIds = modules.map((module) => module.id)

    if (moduleIds.length === 0) return

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, position, module_id')
      .in('module_id', moduleIds)
      .eq('published', true)

    if (lessonsError || !lessons) return

    const orderedLessons = modules.flatMap((module) =>
      lessons
        .filter((lesson) => lesson.module_id === module.id)
        .sort((a, b) => a.position - b.position)
    )

    const currentIndex = orderedLessons.findIndex(
      (lesson) => lesson.id === lessonId
    )

    if (
      currentIndex !== -1 &&
      currentIndex < orderedLessons.length - 1
    ) {
      const next = orderedLessons[currentIndex + 1]

      setNextLesson({
        id: next.id,
        title: next.title,
      })
    } else {
      setNextLesson(null)
    }
  }

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

    const {
      data: completedLessons,
      error: progressError,
    } = await supabase
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
      setMessage(
        `Lección completada. Tu progreso es ${progress}%.`
      )

      await findNextLesson()
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

      {completed && nextLesson && (
        <Link
          href={`/curso/${courseId}/leccion/${nextLesson.id}`}
          className="inline-block mt-5 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Siguiente lección →
          <span className="block text-sm font-normal mt-1">
            {nextLesson.title}
          </span>
        </Link>
      )}

      {completed && !nextLesson && message.includes('completado') && (
        <Link
          href="/mis-cursos"
          className="inline-block mt-5 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          🏆 Ver mis cursos
        </Link>
      )}
    </div>
  )
}
