'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'

type Certificate = {
  id: string
  user_id: string
  course_id: string
  folio: string
  issued_at: string | null
}

type Course = {
  id: string
  title: string
}

function CertificatesContent() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [courses, setCourses] = useState<Record<string, Course>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCertificates() {
      try {
        setLoading(true)
        setError('')

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError

        if (!user) {
          setCertificates([])
          return
        }

        const { data, error: certificateError } = await supabase
          .from('certificates')
          .select('id, user_id, course_id, folio, issued_at')
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false })

        if (certificateError) throw certificateError

        setCertificates(data || [])

        if (data && data.length > 0) {
          const courseIds = [...new Set(data.map((c) => c.course_id))]

          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('id, title')
            .in('id', courseIds)

          if (courseError) throw courseError

          const map: Record<string, Course> = {}

          for (const course of courseData || []) {
            map[course.id] = course
          }

          setCourses(map)
        }
      } catch (err) {
        console.error('Error cargando certificados:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar tus certificados.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadCertificates()
  }, [])

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href="/dashboard"
        className="text-blue-600 font-semibold"
      >
        ← Dashboard
      </Link>

      <div className="mt-6">
        <h1 className="text-4xl font-black">
          Mis certificados
        </h1>

        <p className="text-slate-600 mt-2">
          Consulta tus certificados de los cursos completados.
        </p>
      </div>

      {loading && (
        <div className="mt-10 border border-slate-200 rounded-2xl p-8 text-center">
          <p className="text-slate-500">
            Cargando tus certificados...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-10 border border-red-200 bg-red-50 rounded-2xl p-6">
          <h2 className="font-bold text-red-700">
            No se pudieron cargar tus certificados
          </h2>

          <p className="text-red-600 mt-2 text-sm">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && certificates.length === 0 && (
        <div className="mt-10 border border-slate-200 rounded-2xl p-10 text-center">
          <div className="text-6xl">
            🏆
          </div>

          <h2 className="text-2xl font-bold mt-4">
            Todavía no tienes certificados
          </h2>

          <p className="text-slate-500 mt-2">
            Completa un curso al 100% para obtener tu certificado.
          </p>

          <Link
            href="/mis-cursos"
            className="inline-block mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Ver mis cursos
          </Link>
        </div>
      )}

      {!loading && !error && certificates.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {certificates.map((certificate) => {
            const issueDate = certificate.issued_at
              ? new Date(certificate.issued_at).toLocaleDateString(
                  'es-MX',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )
              : 'Sin fecha'

            return (
              <article
                key={certificate.id}
                className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden"
              >
                <div className="bg-slate-950 text-white p-7">
                  <div className="text-4xl">
                    🏆
                  </div>

                  <p className="text-blue-400 font-semibold mt-4">
                    CHRVM Cursos
                  </p>

                  <h2 className="text-2xl font-black mt-2">
                    {courses[certificate.course_id]?.title ||
                      'Curso'}
                  </h2>

                  <p className="text-slate-300 mt-3">
                    Curso completado satisfactoriamente
                  </p>
                </div>

                <div className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Folio
                      </span>

                      <span className="font-semibold text-right">
                        {certificate.folio}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Fecha de emisión
                      </span>

                      <span className="font-semibold text-right">
                        {issueDate}
                      </span>
                    </div>
                  </div>

                  <div className="mt-7">
                    <Link
                      href={`/verificar-certificado/${certificate.folio}`}
                      className="block text-center border border-slate-300 hover:bg-slate-50 px-4 py-3 rounded-xl font-semibold"
                    >
                      🔎 Verificar certificado
                    </Link>
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
    <AuthGuard roles={['estudiante']}>
      <CertificatesContent />
    </AuthGuard>
  )
}
