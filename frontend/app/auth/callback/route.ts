import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription =
    requestUrl.searchParams.get('error_description')

  if (error) {
    const loginUrl = new URL('/login', requestUrl.origin)

    loginUrl.searchParams.set(
      'error',
      errorDescription || error
    )

    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    const loginUrl = new URL('/login', requestUrl.origin)

    loginUrl.searchParams.set(
      'error',
      'El enlace de confirmación no es válido o ha expirado.'
    )

    return NextResponse.redirect(loginUrl)
  }

  const supabase = await createSupabaseServerClient()

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    const loginUrl = new URL('/login', requestUrl.origin)

    loginUrl.searchParams.set(
      'error',
      'El enlace de confirmación no es válido o ha expirado. Solicita un nuevo correo de confirmación.'
    )

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.redirect(
    new URL('/dashboard', requestUrl.origin)
  )
}
