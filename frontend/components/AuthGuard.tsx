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
  const [checking, setChecking] = useState(true)

  const router = useRouter()

  useEffect(() => {
    let active = true

    async function checkSession() {
      setChecking(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        if (active) {
          setOk(false)
          setChecking(false)
        }

        router.replace('/login')
        return
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('rol, activo')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        console.error(
          'Error obteniendo perfil:',
          profileError
        )

        if (active) {
          setOk(false)
          setChecking(false)
        }

        router.replace('/login')
        return
      }

      if (profile.activo === false) {
        await supabase.auth.signOut()

        if (active) {
          setOk(false)
          setChecking(false)
        }

        router.replace('/login')
        return
      }

      if (
        roles &&
        roles.length > 0 &&
        !roles.includes(profile.rol)
      ) {
        console.warn(
          `Rol no permitido: ${profile.rol}`,
          roles
        )

        if (active) {
          setOk(false)
          setChecking(false)
        }

        router.replace('/dashboard')
        return
      }

      if (active) {
        setOk(true)
        setChecking(false)
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [router])

  if (checking || !ok) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center">
        Verificando sesión...
      </div>
    )
  }

  return <>{children}</>
}
