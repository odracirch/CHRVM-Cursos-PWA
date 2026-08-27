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
  created_at: string | null
}

const emptyForm = {
  course_id: '',
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
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])

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
    const { data, error } = await supabase
      .from('modules')
      .select('id, course_id, title, position')
      .order('position', { ascending: true })

    if (error) {
      console.error(error)
      setError(error.message)
      setModules([])
      return
    }

    setModules(data ?? [])
  }

  async function loadLessons() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('lessons')
      .select(
        'id, module_id, title, description, content, video_url, position, duration_minutes, published, created_at'
      )
      .order('position', { ascending: true })

    if (error) {
      console.error(error)
      setError(error.message)
      setLessons([])
    } else {
      setLessons(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCourses()
    loadModules()
    loadLessons()
  }, [])

  function modulesForCourse(courseId: string) {
    return modules
      .filter((module) => module.course_id === courseId)
      .sort((a, b) => a.position - b.position)
  }

  function startCreate() {
    setEditingId(null)

    const firstCourse = courses[0]
    const firstModule = firstCourse
      ? modulesForCourse(firstCourse.id)[0]
      : undefined

    setForm({
      ...emptyForm,
      course_id: firstCourse?.id ?? '',
      module_id: firstModule?.id ?? '',
    })

    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startEdit(lesson: Lesson) {
    const module = modules.find((item) => item.id === lesson.module_id)

    setEditingId(lesson.id)

    setForm({
      course_id: module?.course_id ?? '',
      module_id: lesson.module_id,
      title: lesson.title,
      description: lesson.description ?? '',
      content: lesson.content ?? '',
      video_url: lesson.video_url ?? '',
      position: String(lesson.position ?? 0),
      duration_minutes: String(lesson.duration_minutes ?? 0),
      published: lesson.published ?? false,
    })

    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setError('')
  }

  function handleCourseChange(courseId: string) {
    const firstModule = modulesForCourse(courseId)[0]

    setForm({
      ...form,
      course_id: courseId,
      module_id: firstModule?.id ?? '',
    })
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
      setError(
        'La posición debe ser un número entero mayor o igual a 1.'
      )
      return
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 0) {
      setError(
        'La duración debe ser un número entero mayor o igual a 0.'
      )
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
    await loadLessons()
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
      console.error(error)
      setError(error.message)
      return
    }

    if (editingId === lesson.id) {
      cancelEdit()
    }

    await loadLessons()
  }

  function moduleTitle(moduleId: string) {
    return (
      modules.find((module) => module.id === moduleId)?.title ??
      'Módulo desconocido'
    )
  }

  function courseTitleFromModule(moduleId: string) {
    const module = modules.find((item) => item.id === moduleId)

    if (!module) return 'Curso desconocido'

    return (
      courses.find((course) => course.id === module.course_id)?.title ??
      'Curso desconocido'
    )
  }

  const groupedLessons = courses.map((course) => ({
    course,
    modules: modules
      .filter((module) => module.course_id === course.id)
      .sort((a, b) => a.position - b.position)
      .map((module) => ({
        module,
        lessons: lessons
          .filter((lesson) => lesson.module_id === module.id)
          .sort(
            (a, b) =>
              (a.position ?? 0) - (b.position ?? 0)
          ),
      })),
  }))

  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <AdminBackButton />
        </div>

        <div>
          <h1 className="text-3xl font-black">
            Admin · Lecciones
          </h1>

          <p className="text-slate-600 mt-2">
            Crea, edita, publica y organiza las lecciones de tus cursos.
          </p>
        </div>

        <div className="card p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                {editingId ? 'Editar lección' : 'Nueva lección'}
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
                  handleCourseChange(event.target.value)
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
                Módulo
              </label>

              <select
                value={form.module_id}
                onChange={(event) =>
                  setForm({
                    ...form,
                    module_id: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-white"
                required
              >
                <option value="">Selecciona un módulo</option>

                {modulesForCourse(form.course_id).map((module) => (
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
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
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
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
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
                  setForm({
                    ...form,
                    content: event.target.value,
                  })
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
                  setForm({
                    ...form,
                    video_url: event.target.value,
                  })
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
                    setForm({
                      ...form,
                      position: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  required
                />

                <p className="text-sm text-slate-500 mt-1">
                  Orden de la lección dentro del módulo.
                </p>
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
                  : 'Crear lección'}
            </button>
          </form>
        </div>

        <div className="card p-7">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Lecciones registradas
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
            <p className="text-slate-500">
              Cargando lecciones...
            </p>
          ) : lessons.length === 0 ? (
            <p className="text-slate-500">
              No hay lecciones registradas.
            </p>
          ) : (
            <div className="space-y-8">
              {groupedLessons
                .filter((group) =>
                  group.modules.some(
                    (item) => item.lessons.length > 0
                  )
                )
                .map((group) => (
                  <div key={group.course.id}>
                    <h3 className="text-xl font-bold mb-4">
                      {group.course.title}
                    </h3>

                    <div className="space-y-6">
                      {group.modules
                        .filter(
                          (item) => item.lessons.length > 0
                        )
                        .map(({ module, lessons: moduleLessons }) => (
                          <div
                            key={module.id}
                            className="border border-slate-200 rounded-2xl p-5"
                          >
                            <h4 className="text-lg font-bold mb-4">
                              Módulo #{module.position} · {module.title}
                            </h4>

                            <div className="space-y-4">
                              {moduleLessons.map((lesson) => (
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

                                        <h5 className="text-lg font-bold">
                                          {lesson.title}
                                        </h5>

                                        <span
                                          className={
                                            lesson.published
                                              ? 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold'
                                              : 'bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold'
                                          }
                                        >
                                          {lesson.published
                                            ? 'Publicado'
                                            : 'Borrador'}
                                        </span>
                                      </div>

                                      <p className="text-sm text-slate-500 mt-2">
                                        Curso: {courseTitleFromModule(lesson.module_id)}
                                      </p>

                                      <p className="text-sm text-slate-500 mt-1">
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
