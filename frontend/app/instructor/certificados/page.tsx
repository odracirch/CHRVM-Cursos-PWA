'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'

type CertificateRequest = {
  id: string
  user_id: string
  course_id: string
  instructor_id: string
  status: 'pending' | 'sent'
  requested_at: string | null
  sent_at: string | null
}

type Profile = {
  id: string
  email: string | null
  nombre: string | null
  apellidos: string | null
}

type Course = {
  id: string
  title: string
}

type RequestView = {
  request: CertificateRequest
  profile: Profile | null
  course: Course | null
}

function CertificadosContent() {
  const [requests, setRequests] = useState<RequestView[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadRequests() {
    try {
      setLoading(true)
      setError('')

      const {
        data: requestData,
        error: requestError,
      } = await supabase
        .from('certificate_requests')
        .select(
          'id, user_id, course_id, instructor_id, status, requested_at, sent_at'
        )
        .order('requested_at', { ascending: false })

      if (requestError) throw requestError

      const requestRows = requestData ?? []

      if (requestRows.length === 0) {
        setRequests([])
        return
      }

      const userIds = [
        ...new Set(requestRows.map((item) => item.user_id)),
      ]

      const courseIds = [
        ...new Set(requestRows.map((item) => item.course_id)),
      ]

      const [
        { data: profileData, error: profileError },
        { data: courseData, error: courseError },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, nombre, apellidos')
          .in('id', userIds),

        supabase
          .from('courses')
          .select('id, title')
          .in('id', courseIds),
      ])

      if (profileError) throw profileError
      if (courseError) throw courseError

      const profiles: Record<string, Profile> = {}

      for (const profile of profileData ?? []) {
        profiles[profile.id] = profile
      }

      const courses: Record<string, Course> = {}

      for (const course of courseData ?? []) {
        courses[course.id] = course
      }

      setRequests(
        requestRows.map((request) => ({
          request,
          profile: profiles[request.user_id] ?? null,
          course: courses[request.course_id] ?? null,
        }))
      )
    } catch (err) {
      console.error('Error cargando solicitudes:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las solicitudes.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function markAsSent(requestId: string) {
    try {
      setUpdatingId(requestId)
      setError('')

      const { error: updateError } = await supabase
        .from('certificate_requests')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      await loadRequests()
    } catch (err) {
      console.error('Error actualizando solicitud:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la solicitud.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  function formatDate(value: string | null) {
    if (!value) return 'Sin fecha'

    return new Date(value).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div>
        <h1 className="text-3xl font-black">
          Solicitudes de constancias
        </h1>

        <p className="text-slate-600 mt-2">
          Gestiona las solicitudes de constancias de tus alumnos.
        </p>
      </div>

      {loading && (
        <div className="card p-6 mt-8">
          <p className="text-slate-500">
            Cargando solicitudes...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-8 border border-red-200 bg-red-50 rounded-2xl p-5">
          <h2 className="font-bold text-red-700">
            Ocurrió un error
          </h2>

          <p className="text-red-600 text-sm mt-2">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="card p-8 mt-8 text-center">
          <div className="text-5xl">
            📜
          </div>

          <h2 className="text-xl font-bold mt-4">
            No hay solicitudes
          </h2>

          <p className="text-slate-500 mt-2">
            Cuando un alumno solicite su constancia,
            aparecerá aquí.
          </p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="space-y-5 mt-8">
          {requests.map(({ request, profile, course }) => {
            const studentName = [
              profile?.nombre,
              profile?.apellidos,
            ]
              .filter(Boolean)
              .join(' ') || 'Alumno'

            return (
              <article
                key={request.id}
                className="border border-slate-200 rounded-2xl bg-white shadow-sm p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-bold">
                      {studentName}
                    </h2>

                    <p className="text-slate-500 mt-1">
                      {profile?.email || 'Sin correo'}
                    </p>

                    <p className="font-semibold mt-4">
                      📚 {course?.title || 'Curso'}
                    </p>

                    <p className="text-sm text-slate-500 mt-2">
                      Solicitud: {formatDate(request.requested_at)}
                    </p>

                    {request.sent_at && (
                      <p className="text-sm text-slate-500 mt-1">
                        Enviado: {formatDate(request.sent_at)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-3">
                    {request.status === 'pending' ? (
                      <>
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-4 py-2 text-sm font-bold">
                          🟡 Pendiente
                        </span>

                        <button
                          type="button"
                          onClick={() => markAsSent(request.id)}
                          disabled={updatingId === request.id}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold transition"
                        >
                          {updatingId === request.id
                            ? 'Actualizando...'
                            : '✅ Marcar como enviado'}
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-bold">
                        ✅ Constancia enviada
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default function Page() {
  return (
    <AuthGuard roles={['instructor', 'admin']}>
      <CertificadosContent />
    </AuthGuard>
  )
}
