import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function CursoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: curso, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      image_url,
      slug,
      modules (
        id,
        title,
        description,
        position,
        lessons (
          id,
          title,
          description,
          duration_minutes,
          position
        )
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !curso) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black">
          Curso no encontrado
        </h1>

        <p className="text-slate-600 mt-3">
          El curso que buscas no está disponible.
        </p>

        <Link
          href="/cursos"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-xl mt-6"
        >
          Volver a cursos
        </Link>
      </main>
    );
  }

  const modules = [...(curso.modules || [])].sort(
    (a, b) => a.position - b.position
  );

  const totalLecciones = modules.reduce(
    (total, modulo) => total + (modulo.lessons?.length || 0),
    0
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href="/cursos"
        className="text-blue-600 font-semibold"
      >
        ← Volver a cursos
      </Link>

      <div className="mt-6 bg-slate-950 text-white rounded-3xl overflow-hidden">
        {curso.image_url && (
          <img
            src={curso.image_url}
            alt={curso.title}
            className="w-full h-56 object-cover"
          />
        )}

        <div className="p-8 md:p-12">
          <span className="text-blue-400 font-semibold">
            Curso de demostración
          </span>

          <h1 className="text-4xl md:text-5xl font-black mt-3">
            {curso.title}
          </h1>

          <p className="text-slate-300 text-lg mt-5">
            {curso.description}
          </p>

          <div className="flex gap-6 mt-6 text-sm text-slate-300">
            <span>
              📚 {modules.length} módulos
            </span>

            <span>
              📖 {totalLecciones} lecciones
            </span>
          </div>

          <Link
            href="/registro"
            className="inline-block bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold mt-8"
          >
            Inscribirme al curso
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-3xl font-black">
          Contenido del curso
        </h2>

        {modules.length === 0 ? (
          <div className="border rounded-2xl p-6 mt-5">
            <p className="text-slate-600">
              Este curso todavía no tiene contenido disponible.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {modules.map((modulo, moduleIndex) => {
              const lessons = [...(modulo.lessons || [])].sort(
                (a, b) => a.position - b.position
              );

              return (
                <div
                  key={modulo.id}
                  className="border border-slate-200 rounded-2xl bg-white overflow-hidden"
                >
                  <div className="p-5 bg-slate-50">
                    <span className="text-sm text-blue-600 font-semibold">
                      Módulo {moduleIndex + 1}
                    </span>

                    <h3 className="text-xl font-bold mt-1">
                      {modulo.title}
                    </h3>

                    {modulo.description && (
                      <p className="text-slate-600 mt-2">
                        {modulo.description}
                      </p>
                    )}
                  </div>

                  <div className="divide-y">
                    {lessons.length === 0 ? (
                      <p className="p-5 text-slate-500">
                        Este módulo todavía no tiene lecciones.
                      </p>
                    ) : (
                      lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="p-5 flex items-center gap-4"
                        >
                          <span className="w-9 h-9 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            {lessonIndex + 1}
                          </span>

                          <div className="flex-1">
                            <p className="font-semibold">
                              {lesson.title}
                            </p>

                            {lesson.description && (
                              <p className="text-sm text-slate-500 mt-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>

                          {lesson.duration_minutes > 0 && (
                            <span className="text-sm text-slate-500">
                              {lesson.duration_minutes} min
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="bg-slate-100 rounded-2xl p-6 mt-10">
        <h3 className="font-bold text-xl">
          ¿Quieres comenzar?
        </h3>

        <p className="text-slate-600 mt-2">
          Crea una cuenta para inscribirte, guardar tu progreso y
          posteriormente obtener certificados.
        </p>

        <div className="flex gap-3 mt-5">
          <Link
            href="/registro"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Registrarme
          </Link>

          <Link
            href="/login"
            className="border border-slate-300 bg-white px-5 py-3 rounded-xl font-semibold"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
