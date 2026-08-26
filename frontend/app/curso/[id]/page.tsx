import Link from 'next/link'
import { notFound } from 'next/navigation'
import EnrollButton from '@/components/EnrollButton'

export const dynamic = 'force-dynamic'

const API_URL =
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
  short_description: string
  category: number
  category_name: string
  level: string
  duration: number
  image: string | null
  price: string
  published: boolean
  instructor: number
  instructor_name: string
  modules_count: number
}

async function getCourse(id: string) {
  const response = await fetch(
    `${API_URL}/api/courses/${id}/`,
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    return null
  }

  return (await response.json()) as Course
}

async function getModules(courseId: number) {
  const response = await fetch(
    `${API_URL}/api/modules/?course=${courseId}`,
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    return []
  }

  const data = await response.json()

  if (Array.isArray(data)) {
    return data as Module[]
  }

  return (data.results ?? []) as Module[]
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const curso = await getCourse(id)

  if (!curso) {
    notFound()
  }

  const modulos = await getModules(curso.id)

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
                  {modulo.lessons?.length > 0 ? (
                    modulo.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/curso/${curso.id}/leccion/${lesson.id}`}
                        className="block border border-slate-200 rounded-xl p-4 hover:bg-blue-50 transition"
                      >
                        <span className="font-semibold">
                          {lesson.title}
                        </span>

                        {lesson.duration > 0 && (
                          <span className="text-sm text-slate-500 ml-3">
                            ⏱️ {lesson.duration} min
                          </span>
                        )}
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
