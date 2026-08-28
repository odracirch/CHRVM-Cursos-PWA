'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import { FormEvent, useEffect, useState } from 'react'

type Course = {
  id: string
  title: string
}

type Evaluation = {
  id: string
  course_id: string
  title: string
  description: string | null
  minimum_pass_percentage: number | null
  published: boolean
}

const emptyForm = {
  title: '',
  description: '',
  minimum_pass_percentage: '70',
  published: false,
}

export default function Page() {
  const params = useParams()
  const courseId = String(params.id)

  const [course, setCourse] = useState<Course | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function loadData() {
    setLoading(true)
    setError('')

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single()

    if (courseError) {
      console.error(courseError)
      setError(courseError.message)
      setCourse(null)
      setLoading(false)
      return
    }

    setCourse(courseData)

    const { data: evaluationData, error: evaluationError } = await supabase
      .from('evaluations')
      .select(
        'id, course_id, title, description, minimum_pass_percentage, published'
      )
      .eq('course_id', courseId)

    if (evaluationError) {
      console.error(evaluationError)
      setError(evaluationError.message)
      setEvaluations([])
    } else {
      setEvaluations(evaluationData ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (courseId) loadData()
  }, [courseId])

  function startCreate() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setError('')
  }

  function startEdit(evaluation: Evaluation) {
    setEditingId(evaluation.id)
    setForm({
      title: evaluation.title,
      description: evaluation.description ?? '',
      minimum_pass_percentage: String(evaluation.minimum_pass_percentage ?? 70),
      published: evaluation.published ?? false,
    })
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('El título de la evaluación es obligatorio.')
      return
    }

    const passingScore = Number(form.minimum_pass_percentage)

    if (
      !Number.isInteger(passingScore) ||
      passingScore < 0 ||
      passingScore > 100
    ) {
      setError('El porcentaje mínimo debe ser un número entero entre 0 y 100.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      course_id: courseId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      minimum_pass_percentage: passingScore,
    published: form.published,
    }

    const result = editingId
      ? await supabase
          .from('evaluations')
          .update(payload)
          .eq('id', editingId)
          .eq('course_id', courseId)
      : await supabase
          .from('evaluations')
          .insert(payload)

    if (result.error) {
      console.error(result.error)
      setError(result.error.message)
      setSaving(false)
      return
    }

    cancelEdit()
    await loadData()
    setSaving(false)
  }

  async function deleteEvaluation(evaluation: Evaluation) {
    const confirmed = window.confirm(
      `¿Eliminar la evaluación "${evaluation.title}"? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    setError('')

    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', evaluation.id)
      .eq('course_id', courseId)

    if (error) {
      console.error(error)
      setError(error.message)
      return
    }

    if (editingId === evaluation.id) {
      cancelEdit()
    }

    await loadData()
  }

  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <Link
            href={`/instructor/cursos/${courseId}`}
            className="inline-block font-semibold text-slate-700 hover:text-blue-600"
          >
            ← Volver al curso
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-black">
            {course ? course.title : 'Curso'} · Evaluaciones
          </h1>

          <p className="text-slate-600 mt-2">
            Crea, edita, publica y administra las evaluaciones de este curso.
          </p>
        </div>

        <div className="card p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                {editingId ? 'Editar evaluación' : 'Nueva evaluación'}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Los cambios se guardan directamente en Supabase.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Título
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="Ej. Evaluación final"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Descripción
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                rows={4}
                placeholder="Describe la evaluación..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Porcentaje mínimo para aprobar
              </label>

              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.minimum_pass_percentage}
                onChange={(event) =>
                  setForm({
                    ...form,
                    minimum_pass_percentage: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <p className="text-sm text-slate-500 mt-1">
                Porcentaje necesario para aprobar la evaluación.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                                            type="checkbox"
                                            checked={form.published}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    published: event.target.checked,
                                                })
                                            }
                                            className="w-5 h-5"
              />

              <span className="font-semibold">
                Publicada
              </span>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !course}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-50"
            >
              {saving
                ? 'Guardando...'
                : editingId
                  ? 'Guardar cambios'
                  : 'Crear evaluación'}
            </button>
          </form>
        </div>

        <div className="card p-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Evaluaciones del curso
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {evaluations.length}{' '}
                {evaluations.length === 1
                  ? 'evaluación'
                  : 'evaluaciones'}
              </p>
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
            >
              + Nueva
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">
              Cargando evaluaciones...
            </p>
          ) : evaluations.length === 0 ? (
            <p className="text-slate-500">
              No hay evaluaciones registradas para este curso.
            </p>
          ) : (
            <div className="space-y-4">
              {evaluations.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold">
                          {evaluation.title}
                        </h3>


                      </div>

                      <p className="text-sm text-slate-500 mt-2">
                        Mínimo para aprobar:{' '}
                        {evaluation.minimum_pass_percentage ?? 70}%
                      </p>

                      {evaluation.description && (
                        <p className="text-slate-600 mt-3 whitespace-pre-wrap">
                          {evaluation.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(evaluation)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteEvaluation(evaluation)}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
}
