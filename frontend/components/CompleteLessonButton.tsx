'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

type Props = {
  lessonId: string
  djangoLessonId: number
  courseId: string
}

type ProgressResponse = {
  lesson: number | string
  progress_percentage: number
}

type ProgressItem = {
  lesson: number | string
  completed: boolean
}

export default function CompleteLessonButton({
  lessonId,
  djangoLessonId,
  courseId,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  async function markCompleted() {
    setLoading(true)
    setMessage('')

    try {
      const response = (await api('/api/progress/complete/', {
        method: 'POST',
        body: JSON.stringify({
          lesson: djangoLessonId,
        }),
      })) as ProgressResponse

      const currentProgress =
        Number(response.progress_percentage) || 0

      setProgress(currentProgress)
      setCompleted(true)

      if (currentProgress >= 100) {
        setMessage(
          '¡Felicidades! Has completado el curso y se generó tu certificado.'
        )
      } else {
        setMessage(
          `Lección completada. Tu progreso es ${currentProgress}%.`
        )
      }
    } catch (error) {
      console.error(error)

      setMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo completar la lección.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function checkProgress() {
      try {
        const data = await api('/api/progress/')

        if (!Array.isArray(data)) return

        const current = data.find(
          (item: ProgressItem) =>
            String(item.lesson) === String(djangoLessonId)
        )

        if (current?.completed) {
          setCompleted(true)
        }
      } catch (error) {
        console.error(
          'No se pudo consultar el progreso:',
          error
        )
      }
    }

    checkProgress()
  }, [djangoLessonId])

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
            message.toLowerCase().includes('error') ||
            message.toLowerCase().includes('no se')
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {message}
        </p>
      )}

      {progress !== null && progress >= 100 && (
        <Link
          href="/certificados"
          className="inline-block mt-5 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          🏆 Ver mi certificado
        </Link>
      )}

      {completed &&
        progress !== null &&
        progress < 100 && (
          <p className="text-slate-500 mt-3 text-sm">
            Continúa con la siguiente lección para aumentar tu progreso.
          </p>
        )}
    </div>
  )
}
