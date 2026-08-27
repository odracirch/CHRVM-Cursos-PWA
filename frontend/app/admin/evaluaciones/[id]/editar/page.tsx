'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'

type Evaluation = {
  id: string
  title: string
  description: string | null
  minimum_pass_percentage: number
}

export default function Page() {
  const params = useParams()
  const evaluationId = String(params.id)

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [minimumPassPercentage, setMinimumPassPercentage] =
    useState(70)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadEvaluation() {
    setLoading(true)
    setError('')
    setMessage('')

    const { data, error } = await supabase
      .from('evaluations')
      .select(
        'id, title, description, minimum_pass_percentage'
      )
      .eq('id', evaluationId)
      .maybeSingle()

    if (error || !data) {
      console.error(
        'Error cargando evaluación:',
        error
      )

      setError('No se pudo cargar la evaluación.')
      setLoading(false)
      return
    }

    setEvaluation(data)
    setTitle(data.title)
    setDescription(data.description ?? '')
    setMinimumPassPercentage(
      data.minimum_pass_percentage
    )

    setLoading(false)
  }

  useEffect(() => {
    loadEvaluation()
  }, [evaluationId])

  async function saveEvaluation() {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (!title.trim()) {
        throw new Error(
          'El título no puede estar vacío.'
        )
      }

      if (
        minimumPassPercentage < 0 ||
        minimumPassPercentage > 100
      ) {
        throw new Error(
          'El porcentaje debe estar entre 0 y 100.'
        )
      }

      const { error } = await supabase
        .from('evaluations')
        .update({
          title: title.trim(),
          description:
            description.trim() || null,
          minimum_pass_percentage:
            minimumPassPercentage,
        })
        .eq('id', evaluationId)

      if (error) {
        throw error
      }

      setMessage(
        'Evaluación actualizada correctamente.'
      )

      await loadEvaluation()
    } catch (error) {
      console.error(
        'Error guardando evaluación:',
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la evaluación.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-5">
          <AdminBackButton />
        </div>

        <div className="card p-7">
          <h1 className="text-3xl font-black">
            Editar evaluación
          </h1>

          <p className="text-slate-600 mt-2">
            Modifica los datos generales de la evaluación.
          </p>

          {loading && (
            <p className="text-slate-500 mt-8">
              Cargando evaluación...
            </p>
          )}

          {!loading && evaluation && (
            <div className="mt-8 space-y-6">
              {message && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 font-semibold">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold mb-2">
                  Título
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Descripción
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={4}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                />
              </div>

              <div className="max-w-xs">
                <label className="block font-semibold mb-2">
                  Mínimo para aprobar (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minimumPassPercentage}
                  onChange={(event) =>
                    setMinimumPassPercentage(
                      Number(event.target.value)
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveEvaluation}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {saving
                    ? 'Guardando...'
                    : 'Guardar cambios'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
