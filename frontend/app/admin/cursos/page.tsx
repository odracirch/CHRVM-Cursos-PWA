'use client'

import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'
import { FormEvent, useEffect, useState } from 'react'

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  instructor_id: string | null
  category_id: number | null
  published: boolean | null
  created_at: string | null
  updated_at: string | null
}

type Category = {
  id: number
  name: string
}

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  image_url: '',
  category_id: '',
  published: true,
}

export default function Page() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function loadCourses() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setError(error.message)
      setCourses([])
    } else {
      setCourses(data ?? [])
    }

    setLoading(false)
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from('courses_category')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error(error)
      setError(error.message)
      setCategories([])
    } else {
      setCategories(data ?? [])
    }
  }

  useEffect(() => {
    loadCourses()
    loadCategories()
  }, [])

  function startCreate() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startEdit(course: Course) {
    setEditingId(course.id)
    setForm({
      title: course.title,
      slug: course.slug,
      description: course.description ?? '',
      image_url: course.image_url ?? '',
      category_id: course.category_id?.toString() ?? '',
      published: course.published ?? false,
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.title.trim() || !form.slug.trim()) {
      setError('El título y el slug son obligatorios.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      published: form.published,
    }

    const result = editingId
      ? await supabase
          .from('courses')
          .update(payload)
          .eq('id', editingId)
      : await supabase
          .from('courses')
          .insert(payload)

    if (result.error) {
      console.error(result.error)
      setError(result.error.message)
      setSaving(false)
      return
    }

    cancelEdit()
    await loadCourses()
    setSaving(false)
  }

  async function togglePublished(course: Course) {
    setError('')

    const { error } = await supabase
      .from('courses')
      .update({
        published: !course.published,
      })
      .eq('id', course.id)

    if (error) {
      console.error(error)
      setError(error.message)
      return
    }

    await loadCourses()
  }

  async function deleteCourse(course: Course) {
    const confirmed = window.confirm(
      `¿Eliminar el curso "${course.title}"? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    setError('')

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', course.id)

    if (error) {
      console.error(error)
      setError(error.message)
      return
    }

    if (editingId === course.id) {
      cancelEdit()
    }

    await loadCourses()
  }

  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <AdminBackButton />
        </div>


        <div>
          <h1 className="text-3xl font-black">
            Admin · Cursos
          </h1>

          <p className="text-slate-600 mt-2">
            Crea, edita, publica y administra los cursos de CHRVM Cursos.
          </p>
        </div>

        <div className="card p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                {editingId ? 'Editar curso' : 'Nuevo curso'}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Los cambios se guardan directamente en Supabase.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
              >
                Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold mb-2">
                Título
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="Ej. Introducción a la Programación"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Slug
              </label>

              <input
                value={form.slug}
                onChange={(event) =>
                  setForm({
                    ...form,
                    slug: event.target.value,
                  })
                }
                placeholder="introduccion-programacion"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
            </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Categoría
                </label>

                <select
                  value={form.category_id}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category_id: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Descripción
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                URL de imagen
              </label>

              <input
                value={form.image_url}
                onChange={(event) =>
                  setForm({
                    ...form,
                    image_url: event.target.value,
                  })
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  setForm({
                    ...form,
                    published: event.target.checked,
                  })
                }
                className="w-5 h-5"
              />

              <span className="font-semibold">
                Publicado
              </span>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-50"
            >
              {saving
                ? 'Guardando...'
                : editingId
                  ? 'Guardar cambios'
                  : 'Crear curso'}
            </button>

          </form>
        </div>

        <div className="card p-7">

          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Cursos registrados
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {courses.length}{' '}
                {courses.length === 1 ? 'curso' : 'cursos'}
              </p>
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
            >
              + Nuevo
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">
              Cargando cursos...
            </p>
          ) : courses.length === 0 ? (
            <p className="text-slate-500">
              No hay cursos registrados.
            </p>
          ) : (
            <div className="space-y-4">

              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-slate-200 rounded-2xl p-5"
                >

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                    <div className="min-w-0">
                      <h3 className="text-lg font-bold">
                        {course.title}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        /{course.slug}
                      </p>

                      {course.description && (
                        <p className="text-slate-600 mt-3">
                          {course.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            course.published
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {course.published
                            ? 'Publicado'
                            : 'Borrador'}
                        </span>

                        {course.created_at && (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                            {new Date(
                              course.created_at
                            ).toLocaleDateString('es-MX')}
                          </span>
                        )}

                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">

                      <button
                        type="button"
                        onClick={() => startEdit(course)}
                        className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          togglePublished(course)
                        }
                        className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                      >
                        {course.published
                          ? 'Despublicar'
                          : 'Publicar'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteCourse(course)
                        }
                        className="px-4 py-2 rounded-xl border border-red-300 text-red-700 font-semibold"
                      >
                        Eliminar
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </AuthGuard>
  )
}
