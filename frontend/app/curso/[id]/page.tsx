'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CursoPage() {
  const params = useParams()
  const router = useRouter()

  const courseId = String(params.id)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function redirectToCourse() {
      try {
        setError('')

        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('slug')
          .eq('id', courseId)
          .maybeSingle()

        if (courseError) {
          throw courseError
        }

        if (!course?.slug) {
          throw new Error('Curso no encontrado.')
        }

        if (mounted) {
          router.replace(`/cursos/${course.slug}`)
        }
      } catch (err) {
        console.error('Error redirigiendo al curso:', err)

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo abrir el curso.'
          )
        }
      }
    }

    if (courseId) {
      redirectToCourse()
    }

    return () => {
      mounted = false
    }
  }, [courseId, router])

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-black text-red-700">
            No se pudo abrir el curso
          </h1>

          <p className="text-red-600 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.replace('/mis-cursos')}
            className="mt-5 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-semibold"
          >
            ← Mis cursos
          </button>
        </section>
      ) : (
        <section className="rounded-3xl bg-slate-950 text-white p-8 md:p-12">
          <p className="text-slate-300">
            Abriendo curso...
          </p>
        </section>
      )}
    </main>
  )
}
