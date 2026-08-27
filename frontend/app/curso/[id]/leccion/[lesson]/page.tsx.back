import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CompleteLessonButton from '@/components/CompleteLessonButton'

export const dynamic = 'force-dynamic'

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://chrvm-cursos-backend.onrender.com'

type DjangoLesson = {
  id: number
  title: string
  description: string
  content: string
  video_url: string
  file: string | null
  duration: number
  order: number
  published: boolean
  module: number
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{
    id: string
    lesson: string
  }>
}) {
  const { id, lesson } = await params

  // Obtener la lección desde Supabase
  const {
    data: leccion,
    error,
  } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      duration_minutes,
      position,
      content,
      published,
      modules (
        id,
        title,
        position,
        courses (
          id,
          title,
          slug
        )
      )
    `)
    .eq('id', lesson)
    .eq('published', true)
    .single()

  if (error || !leccion) {
    notFound()
  }

  const modulo = Array.isArray(leccion.modules)
    ? leccion.modules[0]
    : leccion.modules

  const curso = modulo?.courses
    ? Array.isArray(modulo.courses)
      ? modulo.courses[0]
      : modulo.courses
    : null

  if (!curso || curso.id !== id) {
    notFound()
  }

  // Buscar la lección equivalente en Django.
  // Supabase usa UUID y Django usa ID numérico.
  let djangoLesson: DjangoLesson | null = null

  try {
    const response = await fetch(
      `${API}/api/lessons/`,
      {
        cache: 'no-store',
      }
    )

    if (response.ok) {
      const data = await response.json()

      const lessons = Array.isArray(data)
        ? data
        : data.results

      if (Array.isArray(lessons)) {
        djangoLesson =
          lessons.find(
            (item: DjangoLesson) =>
              item.title === leccion.title &&
              item.published === true
          ) || null
      }
    }
  } catch (djangoError) {
    console.error(
      'No se pudo consultar Django:',
      djangoError
    )
  }

  if (!djangoLesson) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black">
          Lección no disponible
        </h1>

        <p className="text-slate-600 mt-3">
          No pudimos encontrar esta lección en el servidor.
        </p>

        <Link
          href={`/cursos/${curso.slug}`}
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-xl mt-6"
        >
          Volver al curso
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      <Link
        href={`/cursos/${curso.slug}`}
        className="text-blue-600 font-semibold"
      >
        ← Volver al curso
      </Link>

      <div className="mt-6">

        <p className="text-sm text-blue-600 font-semibold">
          {modulo.title}
        </p>

        <h1 className="text-4xl md:text-5xl font-black mt-2">
          {leccion.title}
        </h1>

        {leccion.duration_minutes > 0 && (
          <p className="text-slate-500 mt-3">
            ⏱️ {leccion.duration_minutes} minutos
          </p>
        )}

      </div>

      <article className="card p-7 md:p-10 mt-8">

        {leccion.description && (
          <p className="text-lg text-slate-600 mb-8">
            {leccion.description}
          </p>
        )}

        <div className="prose max-w-none">

          {leccion.content ? (
            <div className="whitespace-pre-wrap">
              {leccion.content}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6">

              <h2 className="text-2xl font-bold">
                Contenido de la lección
              </h2>

              <p className="text-slate-600 mt-3">
                El contenido detallado de esta lección estará
                disponible próximamente.
              </p>

            </div>
          )}

        </div>

      </article>

      <div className="flex justify-between items-center mt-8">

        <Link
          href={`/cursos/${curso.slug}`}
          className="border border-slate-300 bg-white px-5 py-3 rounded-xl font-semibold"
        >
          ← Contenido del curso
        </Link>

        <CompleteLessonButton
          lessonId={leccion.id}
          djangoLessonId={djangoLesson.id}
          courseId={curso.id}
        />

      </div>

    </main>
  )
}
