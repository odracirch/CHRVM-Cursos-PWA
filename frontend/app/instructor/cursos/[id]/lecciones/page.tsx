'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
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
  position: number
}

type Lesson = {
  id: string
  module_id: string
  title: string
  description: string | null
  content: string | null
  video_url: string | null
  position: number | null
  duration_minutes: number | null
  published: boolean | null
}

const emptyForm = {
  module_id: '',
  title: '',
  description: '',
  content: '',
  video_url: '',
  position: '1',
  duration_minutes: '0',
  published: false,
}

export default function Page() {
  const params = useParams()
  const courseId = String(params.id)

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function loadData() {
    setLoading(true)
    setError('')

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single()

    if (courseError) {
      setError(courseError.message)
      setLoading(false)
      return
    }

    setCourse(courseData)

    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('id, course_id, title, position')
      .eq('course_id', courseId)
      .order('position', { ascending: true })

    if (moduleError) {
      setError(moduleError.message)
      setLoading(false)
      return
    }

    setModules(moduleData ?? [])

    const moduleIds = (moduleData ?? []).map((module) => module.id)

    if (moduleIds.length === 0) {
      setLessons([])
      setLoading(false)
      return
    }

    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select(
        'id, module_id, title, description, content, video_url, position, duration_minutes, published'
      )
      .in('module_id', moduleIds)
      .order('position', { ascending: true })

    if (lessonError) {
      setError(lessonError.message)
      setLessons([])
    } else {
      setLessons(lessonData ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (courseId) loadData()
  }, [courseId])

  function startCreate() {
    setEditingId(null)
    setForm({
      ...emptyForm,
      module_id: modules[0]?.id ?? '',
      position: '1',
    })
    setError('')
  }

  function startEdit(lesson: Lesson) {
    setEditingId(lesson.id)
    setForm({
      module_id: lesson.module_id,
      title: lesson.title,
      description: lesson.description ?? '',
      content: lesson.content ?? '',
      video_url: lesson.video_url ?? '',
      position: String(lesson.position ?? 1),
      duration_minutes: String(lesson.duration_minutes ?? 0),
      published: lesson.published ?? false,
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

    if (!form.module_id) {
      setError('Debes seleccionar un módulo.')
      return
    }

    if (!form.title.trim()) {
      setError('El título de la lección es obligatorio.')
      return
    }

    const position = Number(form.position)
    const durationMinutes = Number(form.duration_minutes)

    if (!Number.isInteger(position) || position < 1) {
      setError('La posición debe ser un número entero mayor o igual a 1.')
      return
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 0) {
      setError('La duración debe ser un número entero mayor o igual a 0.')
      return
    }

    const validModule = modules.some((module) => module.id === form.module_id)

    if (!validModule) {
      setError('El módulo seleccionado no pertenece a este curso.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      module_id: form.module_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      content: form.content.trim() || null,
      video_url: form.video_url.trim() || null,
      position,
      duration_minutes: durationMinutes,
      published: form.published,
    }

    const result = editingId
      ? await supabase
          .from('lessons')
          .update(payload)
          .eq('id', editingId)
          .eq('module_id', form.module_id)
      : await supabase
          .from('lessons')
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

  async function deleteLesson(lesson: Lesson) {
    const confirmed = window.confirm(
      `¿Eliminar la lección "${lesson.title}"? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    setError('')

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lesson.id)

    if (error) {
      setError(error.message)
      return
    }

    if (editingId === lesson.id) cancelEdit()

    await loadData()
  }

  function moduleTitle(moduleId: string) {
    return (
      modules.find((module) => module.id === moduleId)?.title ??
      'Módulo desconocido'
    )
  }

  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <Link
          href={`/instructor/cursos/${courseId}`}
          className="inline-block font-semibold text-slate-700 hover:text-blue-600"
        >
          ← Volver al curso
        </Link>

        <div>
          <h1 className="text-3xl font-black">
            {course?.title ?? 'Curso'} · Lecciones
          </h1>
          <p className="text-slate-600 mt-2">
            Crea, edita, publica y organiza las lecciones de este curso.
          </p>
        </div>

        <div className="card p-7">
          <h2 className="text-xl font-bold mb-6">
            {editingId ? 'Editar lección' : 'Nueva lección'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Módulo
              </label>

              <select
                value={form.module_id}
                onChange={(event) =>
                  setForm({ ...form, module_id: event.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white"
                required
              >
                <option value="">Selecciona un módulo</option>

                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    #{module.position} · {module.title}
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
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="Ej. Variables y tipos de datos"
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
                  setForm({ ...form, description: event.target.value })
                }
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Contenido
              </label>

              <textarea
                value={form.content}
                onChange={(event) =>
                  setForm({ ...form, content: event.target.value })
                }
                rows={10}
                placeholder="Escribe aquí el contenido de la lección..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                URL del video
              </label>

              <input
                value={form.video_url}
                onChange={(event) =>
                  setForm({ ...form, video_url: event.target.value })
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    setForm({ ...form, position: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Duración (minutos)
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.duration_minutes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      duration_minutes: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />
              </div>
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

              <span className="font-semibold">Publicado</span>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || !course}
                className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-50"
              >
                {saving
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Crear lección'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-3 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card p-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Lecciones del curso
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {lessons.length}{' '}
                {lessons.length === 1 ? 'lección' : 'lecciones'}
              </p>
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
            >
              + Nueva
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">Cargando lecciones...</p>
          ) : lessons.length === 0 ? (
            <p className="text-slate-500">
              No hay lecciones registradas para este curso.
            </p>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
                          #{lesson.position ?? 0}
                        </span>

                        <h3 className="text-lg font-bold">
                          {lesson.title}
                        </h3>

                        <span
                          className={
                            lesson.published
                              ? 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold'
                              : 'bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold'
                          }
                        >
                          {lesson.published ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 mt-2">
                        Módulo: {moduleTitle(lesson.module_id)}
                      </p>

                      {lesson.duration_minutes !== null && (
                        <p className="text-sm text-slate-500 mt-1">
                          ⏱️ {lesson.duration_minutes} minutos
                        </p>
                      )}

                      {lesson.description && (
                        <p className="text-slate-600 mt-3 whitespace-pre-wrap">
                          {lesson.description}
                        </p>
                      )}

                      {lesson.video_url && (
                        <p className="text-sm text-blue-600 mt-3 break-all">
                          Video: {lesson.video_url}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(lesson)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteLesson(lesson)}
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
