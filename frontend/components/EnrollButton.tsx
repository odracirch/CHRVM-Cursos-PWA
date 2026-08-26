'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type Props = {
  courseId: string
}

type Enrollment = {
  id: number
  student: number
  student_name: string
  course: number
  course_title: string
  enrolled_at: string
  status: 'active' | 'completed' | 'cancelled'
  progress_percentage: number
  completed_at: string | null
}

export default function EnrollButton({
  courseId,
}: Props) {
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
        const data = await api('/api/enrollments/')

        if (!Array.isArray(data)) {
          setEnrolled(false)
          setChecking(false)
          return
        }

        const current = data.find(
          (item: Enrollment) =>
            String(item.course) === String(courseId)
        )

        if (current) {
          setEnrolled(true)
          setProgress(
            Number(current.progress_percentage) || 0
          )
        } else {
          setEnrolled(false)
        }
      } catch (error) {
        console.error(
          'No se pudo consultar la inscripción:',
          error
        )

        setEnrolled(false)
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
      const response = (await api(
        '/api/enrollments/enroll/',
        {
          method: 'POST',
          body: JSON.stringify({
            course: Number(courseId),
          }),
        }
      )) as Enrollment

      setEnrolled(true)
      setProgress(
        Number(response.progress_percentage) || 0
      )

      setMessage(
        '¡Te has inscrito correctamente!'
      )

      setTimeout(() => {
        router.push(`/curso/${courseId}`)
        router.refresh()
      }, 800)
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
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
          {loading
            ? 'Inscribiendo...'
            : 'Inscribirme al curso'}
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
