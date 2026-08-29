'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'

type Option = {
  option_id: string
  option_text: string
  option_position: number
}

type Question = {
  question_id: string
  question: string
  points: number
  question_position: number
  options: Option[]
}

type Evaluation = {
  id: string
  title: string
  description: string | null
  minimum_pass_percentage: number
}

type Result = {
  attempt_id: string
  grade: number
  passed: boolean
}

function EvaluationContent() {
  const params = useParams()
  const router = useRouter()

  const courseId = String(params.id)

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [attemptsUsed, setAttemptsUsed] = useState(0)

  const MAX_ATTEMPTS = 3

  useEffect(() => {
    async function loadEvaluation() {
      setLoading(true)
      setError('')

      const { data: evaluationData, error: evaluationError } =
        await supabase
          .from('evaluations')
          .select(
            'id, title, description, minimum_pass_percentage'
          )
          .eq('course_id', courseId)
          .maybeSingle()

      if (evaluationError) {
        console.error(
          'Error cargando evaluación:',
          evaluationError
        )
        setError('No se pudo cargar la evaluación.')
        setLoading(false)
        return
      }

      if (!evaluationData) {
        setError(
          'Este curso todavía no tiene una evaluación disponible.'
        )
        setLoading(false)
        return
      }

      setEvaluation(evaluationData)

      const { data, error: questionsError } =
        await supabase.rpc(
          'get_evaluation_questions',
          {
            p_evaluation_id: evaluationData.id,
          }
        )

      if (questionsError) {
        console.error(
          'Error cargando preguntas:',
          questionsError
        )
        setError('No se pudieron cargar las preguntas.')
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setError(
          'La evaluación no tiene preguntas disponibles.'
        )
        setLoading(false)
        return
      }

      const grouped: Record<string, Question> = {}

      for (const row of data) {
        if (!grouped[row.question_id]) {
          grouped[row.question_id] = {
            question_id: row.question_id,
            question: row.question,
            points: row.points,
            question_position: row.question_position,
            options: [],
          }
        }

        grouped[row.question_id].options.push({
          option_id: row.option_id,
          option_text: row.option_text,
          option_position: row.option_position,
        })
      }

      const orderedQuestions =
        Object.values(grouped).sort(
          (a, b) =>
            a.question_position - b.question_position
        )

      for (const question of orderedQuestions) {
        question.options.sort(
          (a, b) =>
            a.option_position - b.option_position
        )
      }

      setQuestions(orderedQuestions)
      setLoading(false)
    }

    loadEvaluation()
  }, [courseId])

  function selectAnswer(
    questionId: string,
    optionId: string
  ) {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }))
  }

  async function submitEvaluation() {
    setError('')

    if (Object.keys(answers).length !== questions.length) {
      setError(
        'Debes responder todas las preguntas antes de enviar la evaluación.'
      )
      return
    }

    if (!evaluation) {
      setError('No se encontró la evaluación.')
      return
    }

    if (attemptsUsed >= MAX_ATTEMPTS) {
      setError(
        'Has alcanzado el máximo de 3 intentos para esta evaluación.'
      )
      return
    }

    setSending(true)

    const payload = questions.map((question) => ({
      question_id: question.question_id,
      option_id: answers[question.question_id],
    }))

    const { data, error } = await supabase.rpc(
      'submit_evaluation',
      {
        p_evaluation_id: evaluation.id,
        p_answers: payload,
      }
    )

    if (error) {
      console.error(
        'Error enviando evaluación:',
        error
      )
      setError(
        error.message ||
          'No se pudo enviar la evaluación.'
      )
      setSending(false)
      return
    }

    if (!data || data.length === 0) {
      setError(
        'No se recibió el resultado de la evaluación.'
      )
      setSending(false)
      return
    }

    setResult({
      attempt_id: data[0].attempt_id,
      grade: Number(data[0].grade),
      passed: data[0].passed === true,
    })

    setAttemptsUsed((current) => current + 1)
    setSending(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-600">
          Cargando evaluación...
        </p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">

          {result.passed ? (
            <>
              <div className="text-6xl mb-4">
                🎉
              </div>

              <h1 className="text-3xl font-black text-green-600">
                ¡Evaluación aprobada!
              </h1>

              <p className="text-slate-600 mt-4">
                Has aprobado satisfactoriamente la evaluación.
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">
                📚
              </div>

              <h1 className="text-3xl font-black text-red-600">
                Evaluación no aprobada
              </h1>

              <p className="text-slate-600 mt-4">
                Puedes revisar nuevamente el contenido del curso
                y volver a intentarlo.
              </p>
            </>
          )}

          <div className="mt-8 bg-slate-100 rounded-2xl p-6">
            <p className="text-slate-500 text-sm">
              Calificación
            </p>

            <p className="text-5xl font-black mt-2">
              {result.grade}%
            </p>

            <p className="text-slate-500 mt-2">
              Mínimo para aprobar:{' '}
              {evaluation?.minimum_pass_percentage}%
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">

            {result.passed && (
              <Link
                href="/certificados"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                🏆 Ver mi certificado
              </Link>
            )}

            <button
              onClick={() => router.push(`/curso/${courseId}`)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-xl font-semibold"
            >
              ← Volver al curso
            </button>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="mb-8">

        <Link
          href={`/curso/${courseId}`}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Volver al curso
        </Link>

        <h1 className="text-3xl md:text-4xl font-black mt-5">
          {evaluation?.title}
        </h1>

        {evaluation?.description && (
          <p className="text-slate-600 mt-3">
            {evaluation.description}
          </p>
        )}

        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-blue-800 font-medium">
            Responde las {questions.length} preguntas.
            Necesitas obtener al menos{' '}
            {evaluation?.minimum_pass_percentage}% para aprobar.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      <div className="space-y-6">

        {questions.map((question, index) => (
          <div
            key={question.question_id}
            className="card p-6"
          >
            <div className="flex gap-3">
              <span className="font-black text-blue-600">
                {index + 1}.
              </span>

              <h2 className="text-lg font-bold">
                {question.question}
              </h2>
            </div>

            <div className="mt-5 space-y-3">

              {question.options.map((option) => {
                const selected =
                  answers[question.question_id] ===
                  option.option_id

                return (
                  <button
                    key={option.option_id}
                    type="button"
                    onClick={() =>
                      selectAnswer(
                        question.question_id,
                        option.option_id
                      )
                    }
                    className={`w-full text-left border rounded-xl p-4 transition ${
                      selected
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium">
                      {option.option_text}
                    </span>
                  </button>
                )
              })}

            </div>
          </div>
        ))}

      </div>

      <div className="mt-8 card p-6">

        <p className="text-slate-600 mb-4">
          Preguntas respondidas:{' '}
          <strong>
            {Object.keys(answers).length}
          </strong>{' '}
          de {questions.length}
        </p>

        <button
          type="button"
          onClick={submitEvaluation}
          disabled={
            sending ||
            Object.keys(answers).length !== questions.length
          }
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending
            ? 'Enviando evaluación...'
            : 'Enviar evaluación'}
        </button>

      </div>

    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard roles={['estudiante']}>
      <EvaluationContent />
    </AuthGuard>
  )
}
