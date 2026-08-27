import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'

const adminSections = [
  {
    href: '/admin/cursos',
    title: 'Cursos',
    description: 'Crea, edita, publica y administra los cursos.',
    icon: '📚',
  },
  {
    href: '/admin/usuarios',
    title: 'Usuarios',
    description: 'Consulta los usuarios registrados y sus roles.',
    icon: '👥',
  },
  {
    href: '/admin/categorias',
    title: 'Categorías',
    description: 'Administra las categorías de los cursos.',
    icon: '🏷️',
  },
  {
    href: '/admin/evaluaciones',
    title: 'Evaluaciones',
    description: 'Gestiona evaluaciones y preguntas.',
    icon: '📝',
  },
  {
    href: '/admin/certificados',
    title: 'Certificados',
    description: 'Consulta y administra certificados emitidos.',
    icon: '🎓',
  },
  {
    href: '/admin/instructores',
    title: 'Instructores',
    description: 'Administra instructores de la plataforma.',
    icon: '👨‍🏫',
  },
  {
    href: '/admin/estadisticas',
    title: 'Estadísticas',
    description: 'Consulta información y métricas de la plataforma.',
    icon: '📊',
  },
  {
    href: '/admin/configuracion',
    title: 'Configuración',
    description: 'Administra la configuración de CHRVM Cursos.',
    icon: '⚙️',
  },
  {
    href: '/admin/inscripciones',
    title: 'Inscripciones',
    description: 'Consulta las inscripciones de los estudiantes.',
    icon: '📋',
  },
  {
    href: '/admin/modulos',
    title: 'Módulos',
    description: 'Administra los módulos de los cursos.',
    icon: '📖',
  },
  {
    href: '/admin/lecciones',
    title: 'Lecciones',
    description: 'Administra las lecciones de los cursos.',
    icon: '🧩',
  },
]

export default function Page() {
  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-black">
            Panel administrativo
          </h1>

          <p className="text-slate-600 mt-2">
            Consulta y administra CHRVM Cursos desde un solo lugar.
          </p>

          <p className="text-sm text-slate-500 mt-2">
            Selecciona una sección para comenzar.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="card p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl mb-4">
                {section.icon}
              </div>

              <h2 className="text-xl font-bold">
                {section.title}
              </h2>

              <p className="text-slate-600 text-sm mt-2">
                {section.description}
              </p>

              <div className="mt-5 text-sm font-bold">
                Administrar →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  )
}
