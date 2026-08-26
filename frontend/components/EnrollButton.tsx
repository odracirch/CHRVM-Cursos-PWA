'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EnrollButton({
  courseId,
}: {
  courseId: string
}) {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    async function checkEnrollment() {
      setChecking(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setEnrolled(false)
        setChecking(false)
        return
      }

      const { data: existing, error: enrollmentError } =
        await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle()

      if (enrollmentError) {
        setError(enrollmentError.message)
      } else {
        setEnrolled(!!existing)
      }

      setChecking(false)
    }

    checkEnrollment()
  }, [courseId])

  async function enroll() {
    setLoading(true)
    setMessage('')
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: existing, error: checkError } =
      await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()

    if (checkError) {
      setError(checkError.message)
      setLoading(false)
      return
    }

    if (existing) {
      setEnrolled(true)
      setLoading(false)
      router.push(`/curso/${courseId}`)
      return
    }

    const { error: insertError } =
      await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress_percentage: 0,
          completed: false,
        })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setEnrolled(true)
    setMessage('¡Te has inscrito correctamente!')
    setLoading(false)

    setTimeout(() => {
      router.push(`/curso/${courseId}`)
    }, 800)
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
        <button
          onClick={continueCourse}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Continuar curso
        </button>
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
        <p className="text-green-600 font-semibold mt-3">
          {message}
        </p>
      )}

      {error && (
        <p className="text-red-600 text-sm mt-3">
          {error}
        </p>
      )}
    </div>
  )
}
