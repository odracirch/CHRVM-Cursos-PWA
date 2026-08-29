import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CompleteLessonButton from '@/components/CompleteLessonButton'

export const dynamic = 'force-dynamic'

export default async function LessonPage({
  params,
}: {
  params: Promise<{
    id: string
    lesson: string
  }>
}) {
  const { id, lesson } = await params

  const { data: leccion, error } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      duration_minutes,
      position,
      content,
      video_url,
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

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      <Link
        href={`/curso/${curso.id}`}
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

        {leccion.video_url && (
          <div className="mb-8">
            <video
              controls
              className="w-full rounded-xl"
              src={leccion.video_url}
            />
          </div>
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
          href={`/curso/${curso.id}`}
          className="border border-slate-300 bg-white px-5 py-3 rounded-xl font-semibold"
        >
          ← Contenido del curso
        </Link>

        <CompleteLessonButton
          lessonId={leccion.id}
          courseId={curso.id}
        />

      </div>

    </main>
  )
}
