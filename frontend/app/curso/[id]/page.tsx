import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import EnrollButton from '@/components/EnrollButton'

export const dynamic = 'force-dynamic'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Obtener el curso
  const { data: curso, error: cursoError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (cursoError || !curso) {
    notFound()
  }

  // Obtener módulos
  const { data: modulos, error: modulosError } = await supabase
    .from('modules')
    .select('id, title, position')
    .eq('course_id', id)
    .order('position', { ascending: true })

  // Obtener lecciones del curso mediante los módulos
  const moduleIds = (modulos ?? []).map((modulo) => modulo.id)

  const { data: lecciones, error: leccionesError } =
    moduleIds.length > 0
      ? await supabase
          .from('lessons')
          .select('id, title, position, module_id')
          .in('module_id', moduleIds)
          .eq('published', true)
          .order('position', { ascending: true })
      : { data: [], error: null }

  // Mostrar módulos con sus lecciones
  const modulosConLecciones = (modulos ?? []).map((modulo) => ({
    ...modulo,
    lessons: (lecciones ?? [])
      .filter((lesson) => lesson.module_id === modulo.id)
      .sort((a, b) => a.position - b.position),
  }))

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

        {modulosError || leccionesError ? (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 className="font-bold text-red-700">
              Error al cargar el contenido
            </h3>

            <p className="text-red-600 mt-2">
              No se pudo cargar correctamente el contenido del curso.
            </p>
          </div>
        ) : modulosConLecciones.length > 0 ? (

          <div className="mt-6 space-y-6">

            {modulosConLecciones.map((modulo) => (

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

                  {modulo.lessons.length > 0 ? (

                    modulo.lessons.map((lesson) => (

                      <Link
                        key={lesson.id}
                        href={`/curso/${curso.id}/leccion/${lesson.id}`}
                        className="block border border-slate-200 rounded-xl p-4 hover:bg-blue-50 transition"
                      >

                        <span className="font-semibold">
                          {lesson.title}
                        </span>

                      </Link>

                    ))

                  ) : (

                    <p className="text-slate-500 p-2">
                      Este módulo todavía no tiene lecciones.
                    </p>

                  )}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="bg-slate-100 rounded-2xl p-6 mt-6">

            <p className="text-slate-600">
              Este curso todavía no tiene módulos disponibles.
            </p>

          </div>

        )}

      </section>

    </main>
  )
}
