import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import EnrollButton from '@/components/EnrollButton'

export const dynamic = 'force-dynamic'

export default async function CursoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: curso, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !curso) {
    notFound()
  }

  const { data: modulos } = await supabase
    .from('modules')
    .select(`
      id,
      title,
      position,
      lessons (
        id,
        title,
        position
      )
    `)
    .eq('course_id', curso.id)
    .order('position')

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">

      <Link
        href="/cursos"
        className="text-blue-600 font-semibold"
      >
        ← Volver a cursos
      </Link>

      <section className="mt-6 bg-slate-950 text-white rounded-3xl p-8 md:p-12">

        <span className="text-blue-400 font-semibold">
          Curso
        </span>

        <h1 className="text-4xl md:text-5xl font-black mt-3">
          {curso.title}
        </h1>

        <p className="text-slate-300 text-lg mt-5">
          {curso.description}
        </p>

        <EnrollButton courseId={curso.id} />

      </section>

      <section className="mt-10">

        <h2 className="text-3xl font-black">
          Contenido del curso
        </h2>

        {modulos && modulos.length > 0 ? (
          <div className="mt-6 space-y-6">

            {modulos.map((modulo) => (
              <div
                key={modulo.id}
                className="border border-slate-200 rounded-2xl bg-white overflow-hidden"
              >

                <div className="bg-slate-100 px-6 py-4">
                  <h3 className="text-xl font-bold">
                    {modulo.title}
                  </h3>
                </div>

                <div className="p-4 space-y-2">

                  {modulo.lessons
                    ?.sort((a, b) => a.position - b.position)
                    .map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/curso/${curso.id}/leccion/${lesson.id}`}
                        className="block border border-slate-200 rounded-xl p-4 hover:bg-blue-50"
                      >
                        <span className="font-semibold">
                          {lesson.title}
                        </span>
                      </Link>
                    ))}

                </div>

              </div>
            ))}

          </div>
        ) : (
          <div className="bg-slate-100 rounded-2xl p-6 mt-6">
            <p className="text-slate-600">
              Este curso todavía no tiene lecciones disponibles.
            </p>
          </div>
        )}

      </section>

    </main>
  )
}
