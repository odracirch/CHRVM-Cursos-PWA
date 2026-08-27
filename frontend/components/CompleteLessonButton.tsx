'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  const [progress, setProgress] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [certificateCreated, setCertificateCreated] = useState(false)

  async function loadProgress() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: current } = await supabase
      .from('lesson_progress')
      .select('completed')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle()

    setCompleted(!!current?.completed)

    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId)

    if (modulesError) {
      console.error('Error cargando módulos:', modulesError)
      return
    }

    const moduleIds = modules?.map((m) => m.id) ?? []

    if (!moduleIds.length) {
      setProgress(0)
      return
    }

    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds)
      .eq('published', true)

    if (lessonsError) {
      console.error('Error cargando lecciones:', lessonsError)
      return
    }

    const lessonIds = lessons?.map((l) => l.id) ?? []

    if (!lessonIds.length) {
      setProgress(0)
      return
    }

    const { data: completedLessons, error: progressError } =
      await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('lesson_id', lessonIds)

    if (progressError) {
      console.error(
        'Error cargando progreso:',
        progressError
      )
      return
    }

    const percentage = Math.round(
      ((completedLessons?.length ?? 0) /
        lessonIds.length) *
        100
    )

    setProgress(percentage)

    if (percentage >= 100) {
      await createCertificate(user.id)
    }
  }

  async function createCertificate(userId: string) {
    const { data: existing, error: existingError } =
      await supabase
        .from('certificates')
        .select('id, folio')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle()

    if (existingError) {
      console.error(
        'Error comprobando certificado:',
        existingError
      )
      return
    }

    if (existing) {
      setCertificateCreated(true)
      return
    }

    const folio =
      `CHRVM-${courseId.slice(0, 8).toUpperCase()}-` +
      `${Date.now().toString(36).toUpperCase()}`

    const { error: certificateError } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        course_id: courseId,
        folio,
        issued_at: new Date().toISOString(),
      })

    if (certificateError) {
      console.error(
        'Error creando certificado:',
        certificateError
      )
      return
    }

    setCertificateCreated(true)
  }

  async function markCompleted() {
    setLoading(true)
    setMessage('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Debes iniciar sesión.')
      }

      const { error } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,lesson_id',
          }
        )

      if (error) throw error

      await loadProgress()

      setCompleted(true)

      setMessage(
        'Lección completada correctamente.'
      )
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
    loadProgress()
  }, [lessonId, courseId])

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
        <p className="font-semibold mt-3 text-green-600">
          {message}
        </p>
      )}

      {progress !== null && (
        <p className="text-slate-500 mt-3">
          Progreso del curso: {progress}%
        </p>
      )}

      {progress !== null && progress >= 100 && (
        <div className="mt-5">
          {certificateCreated && (
            <p className="text-green-600 font-semibold mb-3">
              🏆 Certificado generado correctamente.
            </p>
          )}

          <Link
            href="/certificados"
            className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            🏆 Ver mi certificado
          </Link>
        </div>
      )}
    </div>
  )
}
