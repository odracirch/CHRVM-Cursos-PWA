import { supabase } from '@/lib/supabase'

export const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://chrvm-cursos-backend.onrender.com'

/**
 * Realiza peticiones autenticadas contra Django.
 *
 * La autenticación pertenece exclusivamente a Supabase.
 * Django recibe y valida el access_token de Supabase.
 */
export async function api(
  path: string,
  options: RequestInit = {}
) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('SUPABASE SESSION ERROR:', sessionError)
  }

  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (session?.access_token) {
    headers.set(
      'Authorization',
      `Bearer ${session.access_token}`
    )
  }

  console.log('API REQUEST:', {
    url: `${API}${path}`,
    hasToken: !!session?.access_token,
    tokenParts: session?.access_token
      ? session.access_token.split('.').length
      : 0,
  })

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    let message = `Error de API (${res.status})`

    try {
      const data = await res.json()

      message =
        data.detail ||
        data.message ||
        JSON.stringify(data)
    } catch {
      message = `Error de API (${res.status})`
    }

    console.error('API ERROR:', {
      status: res.status,
      url: `${API}${path}`,
      message,
    })

    throw new Error(message)
  }

  return res.status === 204
    ? null
    : res.json()
}

/**
 * Login exclusivamente mediante Supabase Auth.
 *
 * Django NO genera ningún JWT.
 */
export async function login(
  email: string,
  password: string
) {
  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    console.error(
      'SUPABASE LOGIN ERROR:',
      error
    )

    throw new Error(error.message)
  }

  if (!data.session) {
    throw new Error(
      'Supabase no creó una sesión.'
    )
  }

  console.log('SUPABASE LOGIN OK:', {
    email: data.user?.email,
    hasAccessToken: !!data.session.access_token,
    tokenParts: data.session.access_token
      ? data.session.access_token.split('.').length
      : 0,
  })

  return data
}

/**
 * Cierra la sesión únicamente en Supabase.
 */
export async function logout() {
  const { error } =
    await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}
