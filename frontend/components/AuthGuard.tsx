'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      if (active) {
        setOk(true)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login')
      } else if (active) {
        setOk(true)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
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
