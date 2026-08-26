'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import { api } from '@/lib/api'

type Certificate = {
  id: number
  student_name: string
  course_title: string
  folio: string
  issue_date: string
  percentage: number
  hours: number
  pdf_file: string | null
  verification_code: string
}

function CertificatesContent() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCertificates() {
      try {
        setLoading(true)
        setError('')

        const response = await api('/api/certificates/')

        const data = Array.isArray(response)
          ? response
          : response?.results ?? []

        setCertificates(data)
      } catch (err) {
        console.error(err)

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
          Consulta y descarga los certificados de los cursos que has completado.
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
            const issueDate = new Date(
              certificate.issue_date
            ).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })

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
                    {certificate.course_title}
                  </h2>

                  <p className="text-slate-300 mt-3">
                    Curso completado satisfactoriamente
                  </p>
                </div>

                <div className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Alumno
                      </span>

                      <span className="font-semibold text-right">
                        {certificate.student_name}
                      </span>
                    </div>

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

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Porcentaje
                      </span>

                      <span className="font-semibold text-green-600">
                        {certificate.percentage}%
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Duración
                      </span>

                      <span className="font-semibold">
                        {certificate.hours} horas
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mt-7">
                    {certificate.pdf_file && (
                      <a
                        href={certificate.pdf_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold"
                      >
                        📄 Ver certificado
                      </a>
                    )}

                    <Link
                      href={`/verificar-certificado/${certificate.folio}`}
                      className="text-center border border-slate-300 hover:bg-slate-50 px-4 py-3 rounded-xl font-semibold"
                    >
                      🔎 Verificar
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
    <AuthGuard roles={['student']}>
      <CertificatesContent />
    </AuthGuard>
  )
}
