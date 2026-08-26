'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EnrollButton({
  courseId,
}: {
  courseId: string
}) {
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    async function checkEnrollment() {
      setLoading(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setEnrolled(false)
        setLoading(false)
        return
      }

      const { data: existing, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()

      if (error) {
        setError(error.message)
        setEnrolled(false)
      } else {
        setEnrolled(!!existing)
      }

      setLoading(false)
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

    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (existing) {
      setEnrolled(true)
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        progress_percentage: 0,
        completed: false,
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setEnrolled(true)
    setMessage('¡Te has inscrito correctamente!')
    setLoading(false)
  }

  function continueCourse() {
    router.push('/mis-cursos')
  }

  if (loading) {
    return (
      <div className="mt-8">
        <button
          disabled
          className="bg-slate-300 text-slate-600 px-6 py-3 rounded-xl font-semibold"
        >
          Comprobando inscripción...
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8">
      {enrolled ? (
        <button
          onClick={continueCourse}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Continuar curso
        </button>
      ) : (
        <button
          onClick={enroll}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          Inscribirme al curso
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
