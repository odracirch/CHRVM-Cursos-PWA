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

  const isInstructor = pathname === '/instructor' || pathname.startsWith('/instructor/')
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  const homeHref = isInstructor
    ? '/instructor'
    : isAdmin
      ? '/admin'
      : '/dashboard'

  const coursesHref = isInstructor
    ? '/instructor/cursos'
    : '/mis-cursos'

  return (
    <>
      {!isHome && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
          <div className="max-w-6xl mx-auto px-4 min-h-16 py-3">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="font-black text-xl text-brand-600 whitespace-nowrap"
              >
                CHRVM <span className="text-slate-700">Cursos</span>
              </Link>

            </div>

            <nav className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              <Link
                href={homeHref}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap"
              >
                Inicio
              </Link>

              <Link
                href={coursesHref}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap"
              >
                Mis cursos
              </Link>

            </nav>
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
