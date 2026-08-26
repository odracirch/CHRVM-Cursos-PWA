import Link from 'next/link'
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
    .select('id, title, slug, description, image_url, published')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-2xl font-black text-red-700">
            Error de Supabase
          </h1>

          <p className="mt-3 text-red-600">
            {error.message}
          </p>

          <p className="mt-3 text-sm text-slate-600">
            Slug recibido: {slug}
          </p>
        </div>
      </main>
    )
  }

  if (!curso) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8">
          <h1 className="text-2xl font-black">
            Curso no encontrado
          </h1>

          <p className="mt-3 text-slate-600">
            Slug recibido:
          </p>

          <p className="font-mono mt-1">
            {slug}
          </p>

          <Link
            href="/cursos"
            className="inline-block mt-6 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Volver a cursos
          </Link>
        </div>
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

      <section className="mt-6 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">

        {curso.image_url && (
          <img
            src={curso.image_url}
            alt={curso.title}
            className="w-full h-64 object-cover"
          />
        )}

        <div className="p-8">

          <span className="text-blue-600 font-semibold">
            Curso
          </span>

          <h1 className="text-4xl font-black mt-2">
            {curso.title}
          </h1>

          <p className="text-slate-600 text-lg mt-4">
            {curso.description}
          </p>

          <EnrollButton courseId={curso.id} />

        </div>

      </section>

    </main>
  )
}
