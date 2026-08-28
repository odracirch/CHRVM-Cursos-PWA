'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'

type Category = {
  id: string
  name: string
}

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string | null
  published: boolean | null
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function EditarCursoPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = String(params.id)

  const [course, setCourse] = useState<Course | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [published, setPublished] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError('')

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('No se pudo identificar al usuario autenticado.')
        setLoading(false)
        return
      }

      const [courseResult, categoriesResult] = await Promise.all([
        supabase
          .from('courses')
          .select(
            'id, title, slug, description, category_id, published',
          )
          .eq('id', courseId)
          .eq('instructor_id', user.id)
          .maybeSingle(),

        supabase
          .from('courses_category')
          .select('id, name')
          .order('name'),
      ])

      if (courseResult.error) {
        console.error(courseResult.error)
        setError(courseResult.error.message)
        setLoading(false)
        return
      }

      if (!courseResult.data) {
        setError('Curso no encontrado o no tienes acceso.')
        setLoading(false)
        return
      }

      if (categoriesResult.error) {
        console.error(categoriesResult.error)
        setError(categoriesResult.error.message)
        setLoading(false)
        return
      }

      const data = courseResult.data

      setCourse(data)
      setTitle(data.title)
      setSlug(data.slug)
      setDescription(data.description ?? '')
      setCategoryId(data.category_id ?? '')
      setPublished(data.published ?? false)
      setCategories(categoriesResult.data ?? [])

      setLoadingCategories(false)
      setLoading(false)
    }

    if (courseId) {
      loadData()
    }
  }, [courseId])

  function handleTitleChange(value: string) {
    setTitle(value)

    if (!slug || slug === createSlug(title)) {
      setSlug(createSlug(value))
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
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

    setSaving(true)

    try {
      const { error: updateError } = await supabase
        .from('courses')
        .update({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          category_id: categoryId || null,
          published,
        })
        .eq('id', courseId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccess('Curso actualizado correctamente.')

      setTimeout(() => {
        router.push(`/instructor/cursos/${courseId}`)
      }, 500)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el curso.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link
          href={`/instructor/cursos/${courseId}`}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Volver al curso
        </Link>
      </div>

      <div className="card p-7">
        <h1 className="text-3xl font-black">Editar curso</h1>

        <p className="text-slate-600 mt-2">
          Actualiza la información básica de este curso.
        </p>

        {loading ? (
          <div className="mt-8">
            <p className="text-slate-500">
              Cargando curso...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-bold mb-2">
                Título del curso
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  handleTitleChange(event.target.value)
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Slug
              </label>

              <input
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(createSlug(event.target.value))
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                disabled={saving}
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
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={5}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Categoría
              </label>

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                disabled={saving || loadingCategories}
              >
                <option value="">Sin categoría</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) =>
                  setPublished(event.target.checked)
                }
                className="mt-1"
                disabled={saving}
              />

              <span>
                <span className="block font-bold">
                  Publicar curso
                </span>

                <span className="block text-sm text-slate-500 mt-1">
                  Si está activado, el curso podrá aparecer para
                  los usuarios.
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
                disabled={saving}
                className="rounded-xl bg-slate-900 text-white px-6 py-3 font-bold hover:bg-slate-800 disabled:opacity-50"
              >
                {saving
                  ? 'Guardando cambios...'
                  : 'Guardar cambios'}
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/instructor/cursos/${courseId}`)
                }
                disabled={saving}
                className="rounded-xl border border-slate-300 px-6 py-3 font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <EditarCursoPage />
    </AuthGuard>
  )
}
