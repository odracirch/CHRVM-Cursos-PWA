'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import { FormEvent, useEffect, useState } from 'react'

type Course = {
  id: string
  title: string
  published: boolean
}

type Module = {
  id: string
  course_id: string
  title: string
  description: string | null
  position: number
}

const emptyForm = {
  title: '',
  description: '',
  position: '1',
}

export default function Page() {
  const params = useParams()
  const courseId = String(params.id)

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('No se pudo identificar al usuario autenticado.')
        setCourse(null)
        setModules([])
        return
      }

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title, published')
        .eq('id', courseId)
        .eq('instructor_id', user.id)
        .single()

      if (courseError) {
        console.error(courseError)
        setError(courseError.message)
        setCourse(null)
        setModules([])
        return
      }

      setCourse(courseData)

      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('id, course_id, title, description, position')
        .eq('course_id', courseId)
        .order('position', { ascending: true })

      if (moduleError) {
        console.error(moduleError)
        setError(moduleError.message)
        setModules([])
        return
      }

      setModules(moduleData ?? [])
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el curso.'
      )
      setCourse(null)
      setModules([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) {
      loadData()
    }
  }, [courseId])

  function startCreate() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      position: String(modules.length + 1),
    })
    setError('')
  }

  function startEdit(module: Module) {
    setEditingId(module.id)
    setForm({
      title: module.title,
      description: module.description ?? '',
      position: String(module.position ?? 1),
    })
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('El título del módulo es obligatorio.')
      return
    }

    const position = Number(form.position)

    if (!Number.isInteger(position) || position < 1) {
      setError('La posición debe ser un número entero mayor o igual a 1.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      course_id: courseId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      position,
    }


    const result = editingId
      ? await supabase
          .from('modules')
          .update(payload)
          .eq('id', editingId)
          .eq('course_id', courseId)
      : await supabase
          .from('modules')
          .insert(payload)

    if (result.error) {
      console.error(result.error)
      setError(result.error.message)
      setSaving(false)
      return
    }

    cancelEdit()
    await loadData()
    setSaving(false)
  }

  async function toggleCoursePublished() {
    if (!course) return

    const nextPublished = !course.published

    const confirmed = window.confirm(
      nextPublished
        ? '¿Quieres publicar este curso? Los alumnos podrán verlo.'
        : '¿Quieres ocultar este curso? Dejará de estar visible para los alumnos.'
    )

    if (!confirmed) return

    setSaving(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('No se pudo identificar al usuario autenticado.')
      setSaving(false)
      return
    }

    const { data, error } = await supabase
      .from('courses')
      .update({ published: nextPublished })
      .eq('id', courseId)
      .eq('instructor_id', user.id)
      .select('id, title, published')
      .single()

    if (error) {
      console.error(error)
      setError(error.message)
      setSaving(false)
      return
    }

    setCourse(data)
    setSaving(false)
  }

  async function deleteModule(module: Module) {
    const confirmed = window.confirm(
      `¿Eliminar el módulo "${module.title}"? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    setError('')

    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', module.id)
      .eq('course_id', courseId)

    if (error) {
      console.error(error)
      setError(error.message)
      return
    }

    if (editingId === module.id) {
      cancelEdit()
    }

    await loadData()
  }

  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <Link
            href={`/instructor/cursos/${courseId}`}
            className="inline-block font-semibold text-slate-700 hover:text-blue-600"
          >
            ← Volver al curso
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-black">
            {course ? course.title : 'Curso'} · Módulos
          </h1>

          <p className="text-slate-600 mt-2">
            Crea, edita y organiza los módulos de este curso.
          </p>

            {course && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span
                  className={
                    course.published
                      ? 'bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold'
                      : 'bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-semibold'
                  }
                >
                  {course.published
                    ? '🟢 Curso publicado'
                    : '🟡 Curso no publicado'}
                </span>

                <button
                  type="button"
                  onClick={toggleCoursePublished}
                  disabled={saving || loading}
                  className={
                    course.published
                      ? 'bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50'
                      : 'bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50'
                  }
                >
                  {saving
                    ? 'Guardando...'
                    : course.published
                      ? 'Ocultar curso'
                      : 'Publicar curso'}
                </button>
              </div>
            )}
        </div>

        <div className="card p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                {editingId ? 'Editar módulo' : 'Nuevo módulo'}
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
                placeholder="Ej. Fundamentos de programación"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />
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
                Posición
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={form.position}
                onChange={(event) =>
                  setForm({
                    ...form,
                    position: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                required
              />

              <p className="text-sm text-slate-500 mt-1">
                Define el orden del módulo dentro del curso.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || loading || !course}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-50"
            >
              {saving
                ? 'Guardando...'
                : editingId
                  ? 'Guardar cambios'
                  : 'Crear módulo'}
            </button>
          </form>
        </div>

        <div className="card p-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Módulos del curso
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {modules.length}{' '}
                {modules.length === 1 ? 'módulo' : 'módulos'}
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
              Cargando módulos...
            </p>
          ) : modules.length === 0 ? (
            <p className="text-slate-500">
              No hay módulos registrados para este curso.
            </p>
          ) : (
            <div className="space-y-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
                          #{module.position}
                        </span>

                        <h3 className="text-lg font-bold">
                          {module.title}
                        </h3>
                      </div>

                      {module.description && (
                        <p className="text-slate-600 mt-3 whitespace-pre-wrap">
                          {module.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(module)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteModule(module)}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
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
      </main>
    </AuthGuard>
  )
}
