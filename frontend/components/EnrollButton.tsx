'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Props = {
  courseId: string
}

type Enrollment = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string | null
  progress_percentage: number | null
  completed: boolean | null
  completed_at: string | null
}

export default function EnrollButton({ courseId }: Props) {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  const router = useRouter()

  useEffect(() => {
    async function checkEnrollment() {
      setChecking(true)
      setError('')

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (!user) {
          setEnrolled(false)
          return
        }

        const { data, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(
            'id, user_id, course_id, enrolled_at, progress_percentage, completed, completed_at'
          )
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle()

        if (enrollmentError) {
          throw enrollmentError
        }

        if (data) {
          setEnrolled(true)
          setProgress(Number(data.progress_percentage) || 0)
        } else {
          setEnrolled(false)
          setProgress(0)
        }
      } catch (err) {
        console.error('No se pudo consultar la inscripción:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo consultar la inscripción.'
        )
      } finally {
        setChecking(false)
      }
    }

    checkEnrollment()
  }, [courseId])

  async function enroll() {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        router.push('/login')
        return
      }

      const { data: existing, error: existingError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()

      if (existingError) {
        throw existingError
      }

      if (existing) {
        setEnrolled(true)
        setMessage('Ya estás inscrito en este curso.')
        router.push(`/cursos/${courseId}`)
        return
      }

      const { data, error: insertError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress_percentage: 0,
          completed: false,
          enrolled_at: new Date().toISOString(),
        })
        .select(
          'id, user_id, course_id, enrolled_at, progress_percentage, completed, completed_at'
        )
        .single()

      if (insertError) {
        throw insertError
      }

      setEnrolled(true)
      setProgress(Number(data?.progress_percentage) || 0)
      setMessage('¡Te has inscrito correctamente!')

      setTimeout(() => {
        router.push(`/cursos/${courseId}`)
        router.refresh()
      }, 700)
    } catch (err) {
      console.error('Error al inscribirse:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo realizar la inscripción.'
      )
    } finally {
      setLoading(false)
    }
  }

  function continueCourse() {
    router.push(`/curso/${courseId}`)
  }

  if (checking) {
    return (
      <div className="mt-8">
        <button
          disabled
          className="bg-slate-400 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Verificando inscripción...
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {enrolled ? (
        <div>
          <button
            onClick={continueCourse}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Continuar curso
          </button>

          <p className="text-slate-300 mt-3 text-sm">
            Progreso: {progress}%
          </p>
        </div>
      ) : (
        <button
          onClick={enroll}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? 'Inscribiendo...' : 'Inscribirme al curso'}
        </button>
      )}

      {message && (
        <p className="text-green-400 font-semibold mt-3">
          {message}
        </p>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-3">
          {error}
        </p>
      )}
    </div>
  )
}
