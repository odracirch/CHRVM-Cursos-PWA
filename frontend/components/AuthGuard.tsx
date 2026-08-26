'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: string[]
}) {
  const [ok, setOk] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let active = true

    async function checkSession() {
      const token = localStorage.getItem('chrvm_access')

      if (!token) {
        router.replace('/login')
        return
      }

      try {
        const profile = await api('/api/auth/profile/')

        if (
          roles &&
          roles.length > 0 &&
          !roles.includes(profile.role)
        ) {
          router.replace('/dashboard')
          return
        }

        if (active) {
          setOk(true)
        }
      } catch (error) {
        console.error(error)
        localStorage.removeItem('chrvm_access')
        localStorage.removeItem('chrvm_refresh')
        router.replace('/login')
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [router, roles])

  if (!ok) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center">
        Verificando sesión...
      </div>
    )
  }

  return <>{children}</>
}
