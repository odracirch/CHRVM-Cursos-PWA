import './globals.css'
import type { Metadata } from 'next'
import PwaRegister from '@/components/PwaRegister'
import SiteChrome from '@/components/SiteChrome'

export const metadata: Metadata = {
  title: 'CHRVM Cursos',
  description: 'Plataforma educativa CHRVM Cursos',
  manifest: '/manifest.webmanifest',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <PwaRegister />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
