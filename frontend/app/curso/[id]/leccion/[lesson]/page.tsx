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
      module_id,
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

  const { data: leccionesModulo } = await supabase
    .from('lessons')
    .select('id, title, position')
    .eq('module_id', leccion.module_id)
    .eq('published', true)
    .order('position', { ascending: true })

  const lecciones = leccionesModulo ?? []

  const indiceActual = lecciones.findIndex(
    (item) => item.id === leccion.id
  )

  const leccionAnterior =
    indiceActual > 0
      ? lecciones[indiceActual - 1]
      : null

  const leccionSiguiente =
    indiceActual >= 0 && indiceActual < lecciones.length - 1
      ? lecciones[indiceActual + 1]
      : null

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

      <div className="flex justify-between items-center gap-4 mt-8">
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

      {(leccionAnterior || leccionSiguiente) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {leccionAnterior ? (
            <Link
              href={`/curso/${curso.id}/leccion/${leccionAnterior.id}`}
              className="border border-slate-300 bg-white hover:bg-slate-50 px-5 py-4 rounded-xl font-semibold"
            >
              <span className="block text-xs text-slate-500 mb-1">
                Lección anterior
              </span>

              ← {leccionAnterior.title}
            </Link>
          ) : (
            <div />
          )}

          {leccionSiguiente ? (
            <Link
              href={`/curso/${curso.id}/leccion/${leccionSiguiente.id}`}
              className="border border-blue-600 bg-blue-600 text-white hover:opacity-90 px-5 py-4 rounded-xl font-semibold text-right"
            >
              <span className="block text-xs opacity-80 mb-1">
                Siguiente lección
              </span>

              {leccionSiguiente.title} →
            </Link>
          ) : (
            <Link
              href={`/curso/${curso.id}/evaluacion`}
              className="border border-blue-600 bg-blue-600 text-white hover:opacity-90 px-5 py-4 rounded-xl font-semibold text-right"
            >
              <span className="block text-xs opacity-80 mb-1">
                Última lección
              </span>

              📝 Realizar evaluación →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
