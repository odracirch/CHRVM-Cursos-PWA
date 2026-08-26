import EnrollButton from '@/components/EnrollButton'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function CursoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: curso, error } = await supabase
    .from('courses')
    .select('id, title, slug, description, image_url, published')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !curso) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black">
          Curso no encontrado
        </h1>

        <Link
          href="/cursos"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-xl mt-6"
        >
          Volver a cursos
        </Link>
      </main>
    )
  }

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
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-8 md:p-12">
          <span className="text-blue-400 font-semibold">
            Curso
          </span>

          <h1 className="text-4xl md:text-5xl font-black mt-3">
            {curso.title}
          </h1>

          <p className="text-slate-300 text-lg mt-5">
            {curso.description}
          </p>

          <Link
            href={`/curso/${curso.id}`}
            className="inline-block bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold mt-8"
          >
            Ver contenido del curso
          </Link>
<EnrollButton courseId={curso.id} />
        </div>
      </div>

      <div className="bg-slate-100 rounded-2xl p-6 mt-10">
        <h2 className="font-bold text-xl">
          ¿Quieres comenzar este curso?
        </h2>

        <p className="text-slate-600 mt-2">
          Inicia sesión o crea una cuenta para poder inscribirte
          y guardar tu progreso.
        </p>

        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            href={`/login?redirect=/cursos/${curso.slug}`}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/registro"
            className="border border-slate-300 bg-white px-5 py-3 rounded-xl font-semibold"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  )
}
