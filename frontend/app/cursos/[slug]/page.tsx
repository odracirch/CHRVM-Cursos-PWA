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
    .select('id, title, slug, description, image_url, published')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="border border-red-200 bg-red-50 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-red-700">
            Error al cargar el curso
          </h1>
          <p className="text-red-600 mt-2">
            {error.message}
          </p>
        </div>
      </main>
    )
  }

  if (!curso) {
    notFound()
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
