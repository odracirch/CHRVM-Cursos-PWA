'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

type Props = {
  lessonId: string
  courseId: string
}

type Lesson = {
  id: string
  title: string
  order?: number
  position?: number
  module?: string
  module_id?: string
}

type Module = {
  id: string
  title: string
  order?: number
  position?: number
  lessons?: Lesson[]
}

export default function CompleteLessonButton({
  lessonId,
  courseId,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [message, setMessage] = useState('')
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    loadProgress()
  }, [lessonId, courseId])

  async function loadProgress() {
    try {
      const progress = await api(
        `/api/progress/?lesson=${encodeURIComponent(lessonId)}`
      )

      const items = Array.isArray(progress)
        ? progress
        : progress?.results ?? []

      const current = items.find(
        (item: any) =>
          String(item.lesson) === String(lessonId)
      )

      if (current?.completed) {
        setCompleted(true)
        await findNextLesson()
      }
    } catch (error) {
      console.error('Error cargando progreso:', error)
    }
  }

  async function findNextLesson() {
    try {
      const response = await api(
        `/api/modules/?course=${encodeURIComponent(courseId)}`
      )

      const modules: Module[] = Array.isArray(response)
        ? response
        : response?.results ?? []

      if (!modules.length) {
        setNextLesson(null)
        return
      }

      const orderedModules = [...modules].sort(
        (a, b) =>
          Number(a.position ?? a.order ?? 0) -
          Number(b.position ?? b.order ?? 0)
      )

      const orderedLessons: Lesson[] = orderedModules.flatMap(
        (module) =>
          [...(module.lessons ?? [])]
            .sort(
              (a, b) =>
                Number(a.position ?? a.order ?? 0) -
                Number(b.position ?? b.order ?? 0)
            )
            .map((lesson) => ({
              ...lesson,
              module_id: module.id,
            }))
      )

      const currentIndex = orderedLessons.findIndex(
        (lesson) => String(lesson.id) === String(lessonId)
      )

      if (
        currentIndex >= 0 &&
        currentIndex < orderedLessons.length - 1
      ) {
        setNextLesson(orderedLessons[currentIndex + 1])
      } else {
        setNextLesson(null)
      }
    } catch (error) {
      console.error('Error buscando siguiente lección:', error)
      setNextLesson(null)
    }
  }

  async function markCompleted() {
    if (loading || completed) return

    setLoading(true)
    setMessage('')

    try {
      const result = await api('/api/progress/complete/', {
        method: 'POST',
        body: JSON.stringify({
          lesson: lessonId,
        }),
      })

      const progress = Number(
        result?.progress_percentage ?? 0
      )

      setCompleted(true)

      if (progress >= 100) {
        setMessage(
          '🎉 ¡Felicidades! Has completado el curso y tu certificado ha sido generado.'
        )
        setNextLesson(null)
      } else {
        setMessage(
          `Lección completada. Tu progreso es ${progress}%.`
        )
        await findNextLesson()
      }
    } catch (error) {
      console.error('Error completando lección:', error)

      setMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo completar la lección.'
      )
    } finally {
      setLoading(false)
    }
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
        <p
          className={`font-semibold mt-3 ${
            message.includes('No se pudo') ||
            message.includes('expirada') ||
            message.includes('Error')
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
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

      {completed && !nextLesson && message.includes('certificado') && (
        <Link
          href="/certificados"
          className="inline-block mt-5 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          🏆 Ver mi certificado
        </Link>
      )}
    </div>
  )
}
