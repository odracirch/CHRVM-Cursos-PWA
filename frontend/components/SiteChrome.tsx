'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isHome = pathname === '/'

  return (
    <>
      {!isHome && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="font-black text-xl text-brand-600"
            >
              CHRVM <span className="text-slate-700">Cursos</span>
            </Link>

            <nav className="hidden md:flex gap-5 text-sm">
              <Link href="/cursos">Cursos</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/instructor">Instructor</Link>
              <Link href="/admin">Admin</Link>
              <Link href="/login">Ingresar</Link>
            </nav>

            <Link
              href="/registro"
              className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Crear cuenta
            </Link>
          </div>
        </header>
      )}

      <main>{children}</main>

      {!isHome && (
        <footer className="mt-16 border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-500">
            © 2026 CHRVM Cursos · Educación digital
          </div>
        </footer>
      )}
    </>
  )
}
