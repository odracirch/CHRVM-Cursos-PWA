import Link from 'next/link'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import EnrollButton from '@/components/EnrollButton'

export const dynamic = 'force-dynamic'

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://chrvm-cursos-backend.onrender.com'

type Lesson = {
  id: number
  title: string
  description: string
  content: string
  video_url: string
  file: string | null
  duration: number
  order: number
  published: boolean
  module: number
}

type Module = {
  id: number
  course: number
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

type Course = {
  id: number
  title: string
  slug: string
  description: string
  short_description?: string
  category?: number | null
  category_name?: string
  level?: string
  duration?: number
  image?: string | null
  price?: number
  published: boolean
  instructor?: number | null
  instructor_name?: string
  created_at?: string
  updated_at?: string
  modules_count?: number
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let curso: Course | null = null
  let modulos: Module[] = []

  try {
    /*
     * El frontend puede recibir el UUID de Supabase en la URL.
     * El backend Django utiliza IDs numéricos.
     *
     * Primero obtenemos los cursos públicos de Django
     * y buscamos el curso correspondiente.
     */
    const courseResponse = await fetch(
      `${API}/api/courses/`,
      {
        cache: 'no-store',
      }
    )

    if (!courseResponse.ok) {
      notFound()
    }

    const courseData = await courseResponse.json()

    const courses: Course[] = Array.isArray(courseData)
      ? courseData
      : courseData.results || []

    /*
     * Intentamos encontrar el curso por ID.
     * Si la URL ya contiene el ID numérico de Django,
     * funciona directamente.
     */
    curso =
      courses.find(
        (item) => String(item.id) === String(id)
      ) || null

    /*
     * Si no encontramos el curso por ID Django,
     * usamos Supabase únicamente para identificarlo.
     */
    if (!curso) {
      const { supabase } = await import('@/lib/supabase')

      const { data: supabaseCourse } = await supabase
        .from('courses')
        .select('id, title, slug, description, published')
        .eq('id', id)
        .eq('published', true)
        .single()

      if (supabaseCourse) {
        curso =
          courses.find(
            (item) =>
              item.title === supabaseCourse.title
          ) || null
      }
    }

    if (!curso) {
      notFound()
    }

    /*
     * Obtener los módulos y sus lecciones desde Django.
     */
    const modulesResponse = await fetch(
      `${API}/api/modules/?course=${curso.id}`,
      {
        cache: 'no-store',
      }
    )

    if (modulesResponse.ok) {
      const modulesData = await modulesResponse.json()

      modulos = Array.isArray(modulesData)
        ? modulesData
        : modulesData.results || []
    }
  } catch (error) {
    console.error(
      'Error al cargar el curso:',
      error
    )

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

        <EnrollButton
          courseId={String(curso.id)}
        />

      </section>

      <section className="mt-10">

        <h2 className="text-3xl font-black">
          Contenido del curso
        </h2>

        {modulos.length > 0 ? (

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

                  {modulo.description && (
                    <p className="text-slate-600 mt-1">
                      {modulo.description}
                    </p>
                  )}

                </div>

                <div className="p-4 space-y-2">

                  {modulo.lessons &&
                  modulo.lessons.length > 0 ? (

                    modulo.lessons.map((lesson) => (

                      <Link
                        key={lesson.id}
                        href={`/curso/${curso.id}/leccion/${lesson.id}`}
                        className="block border border-slate-200 rounded-xl p-4 hover:bg-blue-50 transition"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <span className="font-semibold">
                            {lesson.title}
                          </span>

                          {lesson.duration > 0 && (
                            <span className="text-sm text-slate-500">
                              ⏱️ {lesson.duration} min
                            </span>
                          )}

                        </div>

                        {lesson.description && (
                          <p className="text-sm text-slate-500 mt-1">
                            {lesson.description}
                          </p>
                        )}

                      </Link>

                    ))

                  ) : (

                    <p className="text-slate-500 p-2">
                      Este módulo todavía no tiene
                      lecciones.
                    </p>

                  )}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="bg-slate-100 rounded-2xl p-6 mt-6">

            <p className="text-slate-600">
              Este curso todavía no tiene módulos
              disponibles.
            </p>

          </div>

        )}

      </section>

    </main>
  )
}
