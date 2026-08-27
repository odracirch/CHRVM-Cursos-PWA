'use client'

import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'
import { FormEvent, useEffect, useState } from 'react'

type Course = {
  id: string
  title: string
}

type Module = {
  id: string
  course_id: string
  title: string
  description: string | null
  position: number
}

const emptyForm = {
  course_id: '',
  title: '',
  description: '',
  position: '1',
}

export default function Page() {
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function loadCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title')
      .order('title', { ascending: true })

    if (error) {
      console.error(error)
      setError(error.message)
      setCourses([])
      return
    }

    setCourses(data ?? [])
  }

  async function loadModules() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('modules')
      .select('id, course_id, title, description, position')
      .order('position', { ascending: true })

    if (error) {
      console.error(error)
      setError(error.message)
      setModules([])
    } else {
      setModules(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCourses()
    loadModules()
  }, [])

  function startCreate() {
    setEditingId(null)

    setForm({
      ...emptyForm,
      course_id: courses[0]?.id ?? '',
    })

    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startEdit(module: Module) {
    setEditingId(module.id)

    setForm({
      course_id: module.course_id,
      title: module.title,
      description: module.description ?? '',
      position: String(module.position ?? 1),
    })

    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.course_id) {
      setError('Debes seleccionar un curso.')
      return
    }

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
      course_id: form.course_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      position,
    }

    const result = editingId
      ? await supabase
          .from('modules')
          .update(payload)
          .eq('id', editingId)
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
    await loadModules()
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

    if (error) {
      console.error(error)
      setError(error.message)
      return
    }

    if (editingId === module.id) {
      cancelEdit()
    }

    await loadModules()
  }

  function courseTitle(courseId: string) {
    return courses.find((course) => course.id === courseId)?.title ?? 'Curso desconocido'
  }

  const groupedModules = courses.map((course) => ({
    course,
    modules: modules
      .filter((module) => module.course_id === course.id)
      .sort((a, b) => a.position - b.position),
  }))

  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <AdminBackButton />
        </div>

        <div>
          <h1 className="text-3xl font-black">
            Admin · Módulos
          </h1>

          <p className="text-slate-600 mt-2">
            Crea, edita y organiza los módulos de tus cursos.
          </p>
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
                Curso
              </label>

              <select
                value={form.course_id}
                onChange={(event) =>
                  setForm({
                    ...form,
                    course_id: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white"
                required
              >
                <option value="">Selecciona un curso</option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

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
                Define el orden en que aparecerá el módulo dentro del curso.
              </p>
            </div>

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
                  : 'Crear módulo'}
            </button>
          </form>
        </div>

        <div className="card p-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Módulos registrados
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
              No hay módulos registrados.
            </p>
          ) : (
            <div className="space-y-8">
              {groupedModules
                .filter((group) => group.modules.length > 0)
                .map((group) => (
                  <div key={group.course.id}>
                    <h3 className="text-lg font-bold mb-3">
                      {group.course.title}
                    </h3>

                    <div className="space-y-4">
                      {group.modules.map((module) => (
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

                                <h4 className="text-lg font-bold">
                                  {module.title}
                                </h4>
                              </div>

                              <p className="text-sm text-slate-500 mt-2">
                                Curso: {courseTitle(module.course_id)}
                              </p>

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
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
