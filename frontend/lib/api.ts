export const API =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://chrvm-cursos-backend.onrender.com'

export async function api(
  path: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('chrvm_access')
      : null

  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chrvm_access')
      localStorage.removeItem('chrvm_refresh')
    }

    throw new Error(
      'Sesión expirada. Inicia sesión nuevamente.'
    )
  }

  if (!res.ok) {
    let message = `Error de API (${res.status})`

    try {
      const data = await res.json()

      message =
        data.detail ||
        JSON.stringify(data)
    } catch (e) {
      message = `Error de API (${res.status}) - respuesta no JSON`
    }

    throw new Error(message)
  }

  return res.status === 204 ? null : res.json()
}

export async function login(
  email: string,
  password: string
) {
  const response = await api('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })

  localStorage.setItem(
    'chrvm_access',
    response.access
  )

  localStorage.setItem(
    'chrvm_refresh',
    response.refresh
  )

  return response
}
