import Link from 'next/link'
import CompleteLessonButton from '@/components/CompleteLessonButton'

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

async function getLesson(lessonId: string) {
  const response = await fetch(
    `${API_URL}/api/lessons/${lessonId}/`,
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    return null
  }

  return (await response.json()) as Lesson
}

async function getModule(moduleId: number) {
  const response = await fetch(
    `${API_URL}/api/modules/${moduleId}/`,
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    return null
  }

  return (await response.json()) as Module
}

async function getCourse(courseId: number) {
  const response = await fetch(
    `${API_URL}/api/courses/${courseId}/`,
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    return null
  }

  return (await response.json()) as Course
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lesson: string }>
}) {
  const { id, lesson } = await params

  // La URL antigua puede traer el UUID de Supabase.
  // Django utiliza IDs numéricos, por lo que intentamos
  // utilizar directamente el ID si es numérico.
  const lessonId = Number(lesson)

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black">
          Lección no encontrada
        </h1>

        <p className="text-slate-600 mt-3">
          Esta URL todavía utiliza un identificador antiguo.
        </p>

        <Link
          href="/cursos"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-xl mt-6"
        >
          Volver a cursos
        </Link>
      </main>
    )
  }

  const leccion = await getLesson(lessonId)

  if (!leccion) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black">
          Lección no encontrada
        </h1>

        <p className="text-slate-600 mt-3">
          No pudimos encontrar esta lección en el servidor.
        </p>

        <Link
          href="/cursos"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-xl mt-6"
        >
          Volver a cursos
        </Link>
      </main>
    )
  }

  const modulo = await getModule(leccion.module)

  if (!modulo) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black">
          Módulo no encontrado
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

  const curso = await getCourse(modulo.course)

  if (!curso) {
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
    <main className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href={`/cursos/${curso.slug}`}
        className="text-blue-600 font-semibold"
      >
        ← Volver al curso
      </Link>

      <div className="mt-6">
        <p className="text-sm text-blue-600 font-semibold">
          {modulo.title}
        </p>

        <h1 className="text-4xl md:text-5xl font-black mt-2">
          {leccion.title}
        </h1>

        {leccion.duration > 0 && (
          <p className="text-slate-500 mt-3">
            ⏱️ {leccion.duration} minutos
          </p>
        )}
      </div>

      <article className="card p-7 md:p-10 mt-8">
        {leccion.description && (
          <p className="text-lg text-slate-600 mb-8">
            {leccion.description}
          </p>
        )}

        <div className="prose max-w-none">
          {leccion.content ? (
            <div className="whitespace-pre-wrap">
              {leccion.content}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold">
                Contenido de la lección
              </h2>

              <p className="text-slate-600 mt-3">
                El contenido detallado de la lección estará
                disponible próximamente.
              </p>
            </div>
          )}
        </div>
      </article>

      <div className="flex justify-between items-center mt-8">
        <Link
          href={`/cursos/${curso.slug}`}
          className="border border-slate-300 bg-white px-5 py-3 rounded-xl font-semibold"
        >
          ← Contenido del curso
        </Link>

        <CompleteLessonButton
          lessonId={String(leccion.id)}
          courseId={String(curso.id)}
        />
      </div>
    </main>
  )
}
