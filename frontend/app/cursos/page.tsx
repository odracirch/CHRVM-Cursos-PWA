import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function CursosPage() {
  const { data: cursos, error } = await supabase
    .from('courses')
    .select('id, title, slug, description, image_url')
    .eq('published', true)
    .order('created_at', { ascending: true });

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black">Cursos</h1>
        <p className="text-red-600 mt-4">
          No se pudieron cargar los cursos.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <Link
            href="/"
            className="text-blue-600 font-semibold"
          >
            ← Inicio
          </Link>

          <h1 className="text-4xl font-black mt-3">
            Cursos
          </h1>

          <p className="text-slate-600 mt-2">
            Explora nuestros cursos de demostración.
          </p>
        </div>

        <Link
          href="/login"
          className="hidden sm:block bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold"
        >
          Iniciar sesión
        </Link>
      </div>

      {cursos && cursos.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <article
              key={curso.id}
              className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
            >
              {curso.image_url ? (
                <img
                  src={curso.image_url}
                  alt={curso.title}
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="h-36 bg-gradient-to-br from-blue-700 to-slate-900 flex items-center justify-center">
                  <span className="text-white text-5xl font-black">
                    C
                  </span>
                </div>
              )}

              <div className="p-6">
                <span className="text-sm text-blue-600 font-semibold">
                  Curso de demostración
                </span>

                <h2 className="text-2xl font-bold mt-2">
                  {curso.title}
                </h2>

                <p className="text-slate-600 mt-3">
                  {curso.description}
                </p>

                <Link
                  href={`/cursos/${curso.slug}`}
                  className="block text-center bg-blue-600 text-white rounded-xl py-3 mt-5 font-semibold"
                >
                  Ver curso
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold">
            No hay cursos disponibles
          </h2>

          <p className="text-slate-600 mt-2">
            Próximamente habrá nuevos cursos.
          </p>
        </div>
      )}
    </main>
  );
}
