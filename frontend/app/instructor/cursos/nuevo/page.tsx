'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'

type Category = {
  id: string
  name: string
}

function NuevoCursoPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoadingCategories(true)

    const { data, error } = await supabase
      .from('courses_category')
      .select('id, name')
      .order('name')

    if (error) {
      setError(error.message)
    } else {
      setCategories(data ?? [])
    }

    setLoadingCategories(false)
  }

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function handleTitleChange(value: string) {
    setTitle(value)

    if (!slug || slug === createSlug(title)) {
      setSlug(createSlug(value))
    }
  }

  async function createCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError('El título del curso es obligatorio.')
      return
    }

    if (!slug.trim()) {
      setError('El slug del curso es obligatorio.')
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('No se pudo identificar al usuario autenticado.')
      }


      const { data, error: insertError } = await supabase
        .from('courses')
        .insert({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          category_id: categoryId || null,
          instructor_id: user.id,
          published,
        })
        .select('id')
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      setSuccess('Curso creado correctamente.')

      if (data?.id) {
        setTimeout(() => {
          router.push(`/instructor/cursos/${data.id}`)
        }, 500)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el curso.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push('/instructor/cursos')}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Volver a mis cursos
        </button>
      </div>

      <div className="card p-7">
        <h1 className="text-3xl font-black">Nuevo curso</h1>

        <p className="text-slate-600 mt-2">
          Crea un curso nuevo para comenzar a agregar módulos, lecciones y evaluaciones.
        </p>

        <form onSubmit={createCourse} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">
              Título del curso
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
              placeholder="Ej. Introducción a la seguridad"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(createSlug(event.target.value))}
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
              placeholder="introduccion-a-la-seguridad"
              disabled={loading}
            />

            <p className="text-xs text-slate-500 mt-2">
              Se utiliza para la dirección pública del curso.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Descripción
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
              placeholder="Describe brevemente el contenido y objetivo del curso."
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Categoría
            </label>

            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
              disabled={loading || loadingCategories}
            >
              <option value="">Sin categoría</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="mt-1"
              disabled={loading}
            />

            <span>
              <span className="block font-bold">
                Publicar curso
              </span>

              <span className="block text-sm text-slate-500 mt-1">
                Si está activado, el curso podrá aparecer para los usuarios.
              </span>
            </span>
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 text-white px-6 py-3 font-bold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? 'Creando curso...' : 'Crear curso'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/instructor/cursos')}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-6 py-3 font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <NuevoCursoPage />
    </AuthGuard>
  )
}
