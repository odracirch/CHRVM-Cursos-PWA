'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'

type Option = {
  id: string
  text: string
  correct: boolean
  position: number
}

type Question = {
  id: string
  question: string
  points: number
  position: number
  options: Option[]
}

type Evaluation = {
  id: string
  title: string
  description: string | null
  minimum_pass_percentage: number
}

export default function Page() {
  const params = useParams()
  const evaluationId = String(params.id)

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newPoints, setNewPoints] = useState(20)
  const [newOptions, setNewOptions] = useState([
    { text: '', correct: true },
    { text: '', correct: false },
    { text: '', correct: false },
    { text: '', correct: false },
  ])

  async function loadData() {
    setLoading(true)
    setError('')

    const { data: evaluationData, error: evaluationError } =
      await supabase
        .from('evaluations')
        .select(
          'id, title, description, minimum_pass_percentage'
        )
        .eq('id', evaluationId)
        .maybeSingle()

    if (evaluationError || !evaluationData) {
      console.error(
        'Error cargando evaluación:',
        evaluationError
      )
      setError('No se pudo cargar la evaluación.')
      setLoading(false)
      return
    }

    setEvaluation(evaluationData)

    const { data: questionsData, error: questionsError } =
      await supabase
        .from('evaluation_questions')
        .select(`
          id,
          question,
          points,
          position,
          evaluation_options (
            id,
            text,
            correct,
            position
          )
        `)
        .eq('evaluation_id', evaluationId)
        .order('position', { ascending: true })

    if (questionsError) {
      console.error(
        'Error cargando preguntas:',
        questionsError
      )
      setError('No se pudieron cargar las preguntas.')
      setLoading(false)
      return
    }

    const formatted: Question[] = (questionsData ?? []).map(
      (item: any) => ({
        id: item.id,
        question: item.question,
        points: item.points,
        position: item.position,
        options: (item.evaluation_options ?? [])
          .map((option: any) => ({
            id: option.id,
            text: option.text,
            correct: option.correct,
            position: option.position,
          }))
          .sort(
            (a: Option, b: Option) =>
              a.position - b.position
          ),
      })
    )

    setQuestions(formatted)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [evaluationId])

  function updateQuestion(
    questionId: string,
    field: 'question' | 'points',
    value: string
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              [field]:
                field === 'points'
                  ? Number(value)
                  : value,
            }
          : question
      )
    )
  }

  function updateOption(
    questionId: string,
    optionId: string,
    value: string
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId
                  ? { ...option, text: value }
                  : option
              ),
            }
          : question
      )
    )
  }

  function selectCorrectOption(
    questionId: string,
    optionId: string
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) => ({
                ...option,
                correct: option.id === optionId,
              })),
            }
          : question
      )
    )
  }

  function updateNewOption(index: number, value: string) {
    setNewOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index
          ? { ...option, text: value }
          : option
      )
    )
  }

  function selectNewCorrectOption(index: number) {
    setNewOptions((current) =>
      current.map((option, optionIndex) => ({
        ...option,
        correct: optionIndex === index,
      }))
    )
  }

  function resetNewQuestion() {
    setNewQuestion('')
    setNewPoints(20)
    setNewOptions([
      { text: '', correct: true },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
    ])
  }

  async function addQuestion() {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (!newQuestion.trim()) {
        throw new Error('La pregunta no puede estar vacía.')
      }

      if (newPoints <= 0) {
        throw new Error('Los puntos deben ser mayores que 0.')
      }

      if (newOptions.some((option) => !option.text.trim())) {
        throw new Error('Todas las opciones deben tener texto.')
      }

      const correctOptions = newOptions.filter(
        (option) => option.correct
      )

      if (correctOptions.length !== 1) {
        throw new Error(
          'Debe existir exactamente una opción correcta.'
        )
      }

      const nextPosition =
        questions.length > 0
          ? Math.max(
              ...questions.map((question) => question.position)
            ) + 1
          : 1

      const { data: questionData, error: questionError } =
        await supabase
          .from('evaluation_questions')
          .insert({
            evaluation_id: evaluationId,
            question: newQuestion.trim(),
            points: newPoints,
            position: nextPosition,
          })
          .select('id')
          .single()

      if (questionError || !questionData) {
        throw questionError ?? new Error(
          'No se pudo crear la pregunta.'
        )
      }

      const optionsToInsert = newOptions.map((option, index) => ({
        question_id: questionData.id,
        text: option.text.trim(),
        correct: option.correct,
        position: index + 1,
      }))

      const { error: optionsError } = await supabase
        .from('evaluation_options')
        .insert(optionsToInsert)

      if (optionsError) {
        await supabase
          .from('evaluation_questions')
          .delete()
          .eq('id', questionData.id)

        throw optionsError
      }

      resetNewQuestion()
      setAdding(false)
      setMessage('Pregunta agregada correctamente.')
      await loadData()
    } catch (error) {
      console.error('Error agregando pregunta:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo agregar la pregunta.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteQuestion(question: Question) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la pregunta ${question.position}? Esta acción también eliminará sus opciones.`
    )

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const { error: optionsError } = await supabase
        .from('evaluation_options')
        .delete()
        .eq('question_id', question.id)

      if (optionsError) {
        throw optionsError
      }

      const { error: questionError } = await supabase
        .from('evaluation_questions')
        .delete()
        .eq('id', question.id)

      if (questionError) {
        throw questionError
      }

      if (editingId === question.id) {
        setEditingId(null)
      }

      setMessage('Pregunta eliminada correctamente.')
      await loadData()
    } catch (error) {
      console.error('Error eliminando pregunta:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar la pregunta.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function saveQuestion(question: Question) {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (!question.question.trim()) {
        throw new Error('La pregunta no puede estar vacía.')
      }

      if (question.points <= 0) {
        throw new Error('Los puntos deben ser mayores que 0.')
      }

      if (question.options.length === 0) {
        throw new Error('La pregunta debe tener opciones.')
      }

      const correctOptions = question.options.filter(
        (option) => option.correct
      )

      if (correctOptions.length !== 1) {
        throw new Error(
          'Debe existir exactamente una opción correcta.'
        )
      }

      const { error: questionError } = await supabase
        .from('evaluation_questions')
        .update({
          question: question.question.trim(),
          points: question.points,
        })
        .eq('id', question.id)

      if (questionError) {
        throw questionError
      }

      for (const option of question.options) {
        const { error: optionError } = await supabase
          .from('evaluation_options')
          .update({
            text: option.text.trim(),
            correct: option.correct,
            position: option.position,
          })
          .eq('id', option.id)

        if (optionError) {
          throw optionError
        }
      }

      setEditingId(null)
      setMessage('Pregunta actualizada correctamente.')
      await loadData()
    } catch (error) {
      console.error('Error guardando pregunta:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la pregunta.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-5">
          <AdminBackButton />
        </div>

        {loading && (
          <div className="card p-7">
            <p className="text-slate-500">
              Cargando evaluación...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="card p-7">
            <p className="text-red-600 font-semibold">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && evaluation && (
          <>
            <div className="card p-7 mb-6">
              <h1 className="text-3xl font-black">
                {evaluation.title}
              </h1>

              {evaluation.description && (
                <p className="text-slate-600 mt-3">
                  {evaluation.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-5 text-sm">
                <span className="bg-slate-100 px-3 py-1.5 rounded-full">
                  Preguntas: {questions.length}
                </span>

                <span className="bg-slate-100 px-3 py-1.5 rounded-full">
                  Mínimo: {evaluation.minimum_pass_percentage}%
                </span>
              </div>
            </div>

            {message && (
              <div className="mb-5 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700 font-semibold">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 font-semibold">
                {error}
              </div>
            )}

            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setMessage('')
                  resetNewQuestion()
                  setAdding(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
              >
                + Nueva pregunta
              </button>
            </div>

            {adding && (
              <div className="card p-6 mb-6 border-2 border-blue-200">
                <h2 className="text-xl font-bold">
                  Nueva pregunta
                </h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block font-semibold mb-2">
                      Pregunta
                    </label>

                    <textarea
                      value={newQuestion}
                      onChange={(event) =>
                        setNewQuestion(event.target.value)
                      }
                      rows={3}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3"
                      placeholder="Escribe la pregunta..."
                    />
                  </div>

                  <div className="max-w-xs">
                    <label className="block font-semibold mb-2">
                      Puntos
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={newPoints}
                      onChange={(event) =>
                        setNewPoints(Number(event.target.value))
                      }
                      className="w-full border border-slate-300 rounded-xl px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Opciones
                    </label>

                    <div className="space-y-3">
                      {newOptions.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3"
                        >
                          <input
                            type="radio"
                            name="new-question-correct"
                            checked={option.correct}
                            onChange={() =>
                              selectNewCorrectOption(index)
                            }
                            className="mt-3"
                          />

                          <input
                            type="text"
                            value={option.text}
                            onChange={(event) =>
                              updateNewOption(
                                index,
                                event.target.value
                              )
                            }
                            placeholder={`Opción ${index + 1}`}
                            className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-slate-500 mt-2">
                      Selecciona cuál es la respuesta correcta.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={addQuestion}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                      {saving
                        ? 'Guardando...'
                        : 'Agregar pregunta'}
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        resetNewQuestion()
                        setAdding(false)
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {questions.map((question) => {
                const editing =
                  editingId === question.id

                return (
                  <div
                    key={question.id}
                    className="card p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-semibold">
                          Pregunta {question.position}
                        </p>

                        {editing ? (
                          <div className="mt-3 space-y-4">
                            <div>
                              <label className="block font-semibold mb-2">
                                Pregunta
                              </label>

                              <textarea
                                value={question.question}
                                onChange={(event) =>
                                  updateQuestion(
                                    question.id,
                                    'question',
                                    event.target.value
                                  )
                                }
                                rows={3}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                              />
                            </div>

                            <div className="max-w-xs">
                              <label className="block font-semibold mb-2">
                                Puntos
                              </label>

                              <input
                                type="number"
                                min="1"
                                value={question.points}
                                onChange={(event) =>
                                  updateQuestion(
                                    question.id,
                                    'points',
                                    event.target.value
                                  )
                                }
                                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                              />
                            </div>
                          </div>
                        ) : (
                          <h2 className="text-xl font-bold mt-1">
                            {question.question}
                          </h2>
                        )}
                      </div>

                      {!editing && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                          {question.points} puntos
                        </span>
                      )}
                    </div>

                    <div className="mt-5 space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`rounded-xl border p-4 ${
                            option.correct
                              ? 'border-green-300 bg-green-50'
                              : 'border-slate-200'
                          }`}
                        >
                          {editing ? (
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={option.correct}
                                onChange={() =>
                                  selectCorrectOption(
                                    question.id,
                                    option.id
                                  )
                                }
                                className="mt-1"
                              />

                              <input
                                type="text"
                                value={option.text}
                                onChange={(event) =>
                                  updateOption(
                                    question.id,
                                    option.id,
                                    event.target.value
                                  )
                                }
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
                              />
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <span className="font-bold">
                                {option.position}.
                              </span>

                              <span className="flex-1">
                                {option.text}
                              </span>

                              {option.correct && (
                                <span className="text-green-600 font-bold text-sm">
                                  ✓ Correcta
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {editing ? (
                        <>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              saveQuestion(question)
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                          >
                            {saving
                              ? 'Guardando...'
                              : 'Guardar cambios'}
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => {
                              setEditingId(null)
                              loadData()
                            }}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                        <button
                          type="button"
                          onClick={() => {
                            setError('')
                            setMessage('')
                            setEditingId(question.id)
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                        >
                          Editar pregunta
                        </button>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => deleteQuestion(question)}
                          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
                        >
                          Eliminar pregunta
                        </button>
                      </>
                    )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  )
}
