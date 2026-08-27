'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Certificate = {
  id: string
  user_id: string
  course_id: string
  folio: string
  issued_at: string | null
}

type Profile = {
  full_name: string | null
}

type Course = {
  title: string
}

export default function Verify() {
  const params = useParams()
  const folio = String(params.folio)

  const [certificate, setCertificate] =
    useState<Certificate | null>(null)

  const [student, setStudent] =
    useState<string>('')

  const [course, setCourse] =
    useState<string>('')

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    async function verifyCertificate() {
      setLoading(true)

      const { data, error } = await supabase
        .from('certificates')
        .select(
          'id, user_id, course_id, folio, issued_at'
        )
        .eq('folio', folio)
        .maybeSingle()

      if (error) {
        console.error(
          'Error verificando certificado:',
          error
        )
        setCertificate(null)
        setLoading(false)
        return
      }

      if (!data) {
        setCertificate(null)
        setLoading(false)
        return
      }

      setCertificate(data)

      const [
        { data: profileData },
        { data: courseData },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user_id)
          .maybeSingle(),

        supabase
          .from('courses')
          .select('title')
          .eq('id', data.course_id)
          .maybeSingle(),
      ])

      setStudent(
        profileData?.full_name ||
          'Estudiante'
      )

      setCourse(
        courseData?.title ||
          'Curso'
      )

      setLoading(false)
    }

    verifyCertificate()
  }, [folio])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-14">
        <div className="card p-8 text-center">
          <p className="text-slate-600">
            Verificando certificado...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-14">
      <div className="card p-8 text-center">

        {certificate ? (
          <>
            <div className="text-5xl">
              ✓
            </div>

            <h1 className="text-3xl font-black mt-3">
              Certificado válido
            </h1>

            <p className="mt-5">
              {student}
            </p>

            <p className="font-bold mt-2">
              {course}
            </p>

            <p className="text-sm text-slate-500 mt-4">
              Folio: {certificate.folio}
            </p>

            {certificate.issued_at && (
              <p className="text-sm text-slate-500 mt-2">
                Fecha de emisión:{' '}
                {new Date(
                  certificate.issued_at
                ).toLocaleDateString(
                  'es-MX'
                )}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="text-5xl">
              ✕
            </div>

            <h1 className="text-2xl font-black mt-3">
              Certificado no encontrado
            </h1>

            <p className="text-slate-500 mt-2">
              El folio no pudo verificarse.
            </p>
          </>
        )}

      </div>
    </div>
  )
}
