'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'
import { supabase } from '@/lib/supabase'

type Certificate = {
  id: string
  user_id: string
  course_id: string
  folio: string
  issued_at: string | null
}

type Profile = {
  id: string
  nombre: string | null
  apellidos: string | null
  email: string | null
}

type Course = {
  id: string
  title: string
}

function CertificatesAdminContent() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCertificates() {
      try {
        setLoading(true)
        setError('')

        const { data, error: certificateError } = await supabase
          .from('certificates')
          .select('id, user_id, course_id, folio, issued_at')
          .order('issued_at', { ascending: false })

        if (certificateError) throw certificateError

        const certificateList = data || []
        setCertificates(certificateList)

        if (certificateList.length === 0) {
          return
        }

        const userIds = [
          ...new Set(certificateList.map((certificate) => certificate.user_id)),
        ]

        const courseIds = [
          ...new Set(certificateList.map((certificate) => certificate.course_id)),
        ]

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, nombre, apellidos, email')
          .in('id', userIds)

        if (profileError) throw profileError

        const profileMap: Record<string, Profile> = {}

        for (const profile of profileData || []) {
          profileMap[profile.id] = profile
        }

        setProfiles(profileMap)

        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, title')
          .in('id', courseIds)

        if (courseError) throw courseError

        const courseMap: Record<string, Course> = {}

        for (const course of courseData || []) {
          courseMap[course.id] = course
        }

        setCourses(courseMap)
      } catch (err) {
        console.error('Error cargando certificados:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar los certificados.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadCertificates()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-5">
        <AdminBackButton />
      </div>

      <div className="card p-7">
        <h1 className="text-3xl font-black">
          Admin · Certificados
        </h1>

        <p className="text-slate-600 mt-3">
          Consulta y administra los certificados emitidos en CHRVM Cursos.
        </p>

        {loading && (
          <div className="mt-8 border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-slate-500">
              Cargando certificados...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 border border-red-200 bg-red-50 rounded-2xl p-6">
            <h2 className="font-bold text-red-700">
              No se pudieron cargar los certificados
            </h2>

            <p className="text-red-600 mt-2 text-sm">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && certificates.length === 0 && (
          <div className="mt-8 border border-slate-200 rounded-2xl p-8 text-center">
            <div className="text-5xl">🏆</div>

            <h2 className="text-xl font-bold mt-4">
              No hay certificados emitidos
            </h2>

            <p className="text-slate-500 mt-2">
              Los certificados generados por los alumnos aparecerán aquí.
            </p>
          </div>
        )}

        {!loading && !error && certificates.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-3 py-3 font-semibold">
                    Alumno
                  </th>

                  <th className="px-3 py-3 font-semibold">
                    Curso
                  </th>

                  <th className="px-3 py-3 font-semibold">
                    Folio
                  </th>

                  <th className="px-3 py-3 font-semibold">
                    Emisión
                  </th>

                  <th className="px-3 py-3 font-semibold">
                    Verificación
                  </th>
                </tr>
              </thead>

              <tbody>
                {certificates.map((certificate) => {
                  const profile = profiles[certificate.user_id]
                  const course = courses[certificate.course_id]

                  const fullName =
                    [profile?.nombre, profile?.apellidos]
                      .filter(Boolean)
                      .join(' ') ||
                    profile?.email ||
                    'Usuario'

                  const issueDate = certificate.issued_at
                    ? new Date(
                        certificate.issued_at
                      ).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Sin fecha'

                  return (
                    <tr
                      key={certificate.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-3 py-4">
                        <div className="font-semibold">
                          {fullName}
                        </div>

                        {profile?.email && (
                          <div className="text-xs text-slate-400 mt-1">
                            {profile.email}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-4">
                        {course?.title || 'Curso'}
                      </td>

                      <td className="px-3 py-4 font-semibold">
                        {certificate.folio}
                      </td>

                      <td className="px-3 py-4 text-slate-500">
                        {issueDate}
                      </td>

                      <td className="px-3 py-4">
                        <Link
                          href={`/verificar-certificado/${certificate.folio}`}
                          className="inline-block border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg font-semibold"
                        >
                          🔎 Verificar
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard roles={['admin']}>
      <CertificatesAdminContent />
    </AuthGuard>
  )
}
