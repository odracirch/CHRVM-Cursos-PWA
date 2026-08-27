import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const { data: categorias } = await supabase
    .from('courses_category')
    .select('id, name, slug')
    .order('name', { ascending: true })

  const categoriaSeleccionada = categoria
    ? (categorias ?? []).find((item) => item.slug === categoria)
    : null

  let cursosQuery = supabase
    .from('courses')
    .select('id, title, slug, description, image_url, published, category_id')
    .eq('published', true)

  if (categoriaSeleccionada) {
    cursosQuery = cursosQuery.eq('category_id', categoriaSeleccionada.id)
  }

  const { data: cursos, error } = await cursosQuery
    .order('created_at', { ascending: true })

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black">Cursos</h1>
        <p className="text-red-600 mt-4">
          No se pudieron cargar los cursos.
        </p>
      </main>
    )
  }

    const categoriasMap = new Map(
      (categorias ?? []).map((categoria) => [categoria.id, categoria.name])
    )

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
            Explora nuestros cursos y comienza a aprender.
          </p>
        </div>

        <Link
          href="/login"
          className="hidden sm:block bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold"
        >
          Iniciar sesión
        </Link>
      </div>

              <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/cursos"
            className={`rounded-xl px-4 py-2 font-semibold transition ${
              !categoria
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Todas
          </Link>

          {(categorias ?? []).map((item) => (
            <Link
              key={item.id}
              href={`/cursos?categoria=${item.slug}`}
              className={`rounded-xl px-4 py-2 font-semibold transition ${
                categoria === item.slug
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {cursos && cursos.length === 0 ? (
        <div className="border border-slate-200 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold">
            No hay cursos publicados
          </h2>

          <p className="text-slate-500 mt-2">
            Próximamente habrá nuevos cursos disponibles.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {cursos?.map((curso) => (
            <article
              key={curso.id}
              className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition"
            >
              <div className="h-44 bg-slate-900">
                {curso.image_url ? (
                  <img
                    src={curso.image_url}
                    alt={curso.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-white text-5xl font-black">
                      C
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <span className="text-sm text-blue-600 font-semibold">
                    {curso.category_id
                      ? categoriasMap.get(curso.category_id) ?? 'Sin categoría'
                      : 'Sin categoría'}

                </span>

                <h2 className="text-2xl font-bold mt-2">
                  {curso.title}
                </h2>

                <p className="text-slate-600 mt-3">
                  {curso.description}
                </p>

                <Link
                  href={`/cursos/${curso.slug}`}
                  className="block text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 mt-5 font-semibold"
                >
                  Ver curso
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
