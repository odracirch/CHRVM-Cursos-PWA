'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EnrollButton({
  courseId,
}: {
  courseId: string
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()

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
      router.push('/mis-cursos')
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

    setMessage('¡Te has inscrito correctamente!')
    setLoading(false)

    setTimeout(() => {
      router.push('/mis-cursos')
    }, 800)
  }

  return (
    <div className="mt-8">
      <button
        onClick={enroll}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {loading ? 'Inscribiendo...' : 'Inscribirme al curso'}
      </button>

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
