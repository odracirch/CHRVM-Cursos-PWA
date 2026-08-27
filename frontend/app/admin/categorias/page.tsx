'use client'

import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'
import { FormEvent, useEffect, useState } from 'react'

type Category = {
  id: number
  name: string
  description: string
  slug: string
  created_at: string
}

const emptyForm = {
  name: '',
  description: '',
  slug: '',
}

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadCategories() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('courses_category')
      .select('id, name, description, slug, created_at')
      .order('name', { ascending: true })

    if (error) {
      console.error(error)
      setError(error.message)
    } else {
      setCategories(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setForm({
      name: category.name,
      description: category.description,
      slug: category.slug,
    })
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setError('')

    const name = form.name.trim()
    const description = form.description.trim()
    const slug = form.slug.trim()

    if (!name || !description || !slug) {
      setError('Nombre, descripción y slug son obligatorios.')
      return
    }

    setSaving(true)

    try {
      if (editingId !== null) {
        const { error } = await supabase
          .from('courses_category')
          .update({
            name,
            description,
            slug,
          })
          .eq('id', editingId)

        if (error) {
          throw new Error(error.message)
        }
      } else {
        const { error } = await supabase
          .from('courses_category')
          .insert({
            name,
            description,
            slug,
          })

        if (error) {
          throw new Error(error.message)
        }
      }

      resetForm()
      await loadCategories()
    } catch (error) {
      console.error(error)
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la categoría.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `¿Eliminar la categoría "${category.name}"?`
    )

    if (!confirmed) {
      return
    }

    setError('')

    const { error } = await supabase
      .from('courses_category')
      .delete()
      .eq('id', category.id)

    if (error) {
      console.error(error)
      setError(error.message)
      return
    }

    if (editingId === category.id) {
      resetForm()
    }

    await loadCategories()
  }

  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <AdminBackButton />
        </div>

        <div>
          <h1 className="text-3xl font-black">
            Administración de categorías
          </h1>

          <p className="text-slate-600 mt-2">
            Crea y organiza las categorías utilizadas por los cursos.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="card p-6">
          <h2 className="text-xl font-bold">
            {editingId !== null
              ? 'Editar categoría'
              : 'Nueva categoría'}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 mt-5"
          >
            <div>
              <label className="block text-sm font-semibold mb-1">
                Nombre
              </label>

              <input
                className="w-full border rounded-lg p-3"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Ej. Desarrollo web"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Descripción
              </label>

              <textarea
                className="w-full border rounded-lg p-3 min-h-28"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="Describe esta categoría..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Slug
              </label>

              <input
                className="w-full border rounded-lg p-3"
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value,
                  })
                }
                placeholder="desarrollo-web"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {saving
                  ? 'Guardando...'
                  : editingId !== null
                    ? 'Guardar cambios'
                    : 'Crear categoría'}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">
              Categorías existentes
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-slate-500">
              Cargando categorías...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-slate-500">
              Todavía no hay categorías.
            </div>
          ) : (
            <div className="divide-y">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-bold text-lg">
                      {category.name}
                    </h3>

                    <p className="text-sm text-slate-600 mt-1">
                      {category.description}
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      Slug: {category.slug}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCategory(category)}
                      className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Eliminar
                    </button>
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
