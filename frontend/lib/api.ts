import { supabase } from '@/lib/supabase'

export const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://chrvm-cursos-backend.onrender.com'

export async function api(
  path: string,
  options: RequestInit = {}
) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

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
        JSON.stringify(data)
    } catch {
      message =
        `Error de API (${res.status})`
    }

    throw new Error(message)
  }

  return res.status === 204
    ? null
    : res.json()
}

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

    throw new Error(
      error.message
    )
  }

  if (!data.session) {
    throw new Error(
      'Supabase no creó una sesión.'
    )
  }

  console.log(
    'SUPABASE LOGIN OK:',
    data.user?.email
  )

  return data
}

export async function logout() {
  const { error } =
    await supabase.auth.signOut()

  if (error) {
    throw new Error(
      error.message
    )
  }
}
