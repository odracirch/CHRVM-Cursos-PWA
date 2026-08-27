'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'

type Evaluation = {
  id: string
  course_id: string
  title: string
  description: string | null
  minimum_pass_percentage: number
  course_title: string | null
  question_count: number
}

export default function Page() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadEvaluations() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        id,
        course_id,
        title,
        description,
        minimum_pass_percentage,
        courses (
          title
        ),
        evaluation_questions (
          id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando evaluaciones:', error)
      setError('No se pudieron cargar las evaluaciones.')
      setLoading(false)
      return
    }

    const formatted: Evaluation[] = (data ?? []).map((item: any) => ({
      id: item.id,
      course_id: item.course_id,
      title: item.title,
      description: item.description,
      minimum_pass_percentage: item.minimum_pass_percentage,
      course_title: item.courses?.title ?? null,
      question_count: item.evaluation_questions?.length ?? 0,
    }))

    setEvaluations(formatted)
    setLoading(false)
  }

  useEffect(() => {
    loadEvaluations()
  }, [])

  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-5">
          <AdminBackButton />
        </div>

        <div className="card p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">
                Admin · Evaluaciones
              </h1>

              <p className="text-slate-600 mt-2">
                Gestiona las evaluaciones de tus cursos.
              </p>
            </div>

            <button
              type="button"
              onClick={loadEvaluations}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-3 rounded-xl font-semibold"
            >
              Actualizar
            </button>
          </div>

          {loading && (
            <p className="text-slate-500 mt-8">
              Cargando evaluaciones...
            </p>
          )}

          {error && (
            <p className="text-red-600 font-semibold mt-8">
              {error}
            </p>
          )}

          {!loading && !error && evaluations.length === 0 && (
            <div className="mt-8 rounded-2xl bg-slate-100 p-6">
              <p className="text-slate-600">
                Todavía no hay evaluaciones creadas.
              </p>
            </div>
          )}

          {!loading && !error && evaluations.length > 0 && (
            <div className="mt-8 space-y-4">
              {evaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="border border-slate-200 rounded-2xl p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div>
                      <h2 className="text-xl font-bold">
                        {evaluation.title}
                      </h2>

                      <p className="text-slate-500 mt-1">
                        Curso:{' '}
                        <span className="font-semibold">
                          {evaluation.course_title ?? 'Sin curso'}
                        </span>
                      </p>

                      {evaluation.description && (
                        <p className="text-slate-600 mt-3">
                          {evaluation.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-4 text-sm">
                        <span className="bg-slate-100 px-3 py-1.5 rounded-full">
                          Preguntas: {evaluation.question_count}
                        </span>

                        <span className="bg-slate-100 px-3 py-1.5 rounded-full">
                          Mínimo: {evaluation.minimum_pass_percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                          href={`/admin/evaluaciones/${evaluation.id}/editar`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                        >
                          Editar
                        </Link>

                      <Link
                          href={`/admin/evaluaciones/${evaluation.id}`}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold"
                        >
                          Preguntas
                        </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
