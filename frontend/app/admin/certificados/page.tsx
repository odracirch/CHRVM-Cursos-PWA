import AuthGuard from '@/components/AuthGuard'
import AdminBackButton from '@/components/AdminBackButton'

export default function Page() {
  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-5">
          <AdminBackButton />
        </div>

        <div className="card p-7">
          <h1 className="text-3xl font-black">Admin · Certificados</h1>

          <p className="text-slate-600 mt-3">
            Panel protegido de CHRVM Cursos. Esta sección está preparada
            para administración por rol.
          </p>

          <p className="text-sm text-slate-500 mt-6">
            Esta sección todavía está en desarrollo.
          </p>
        </div>
      </div>
    </AuthGuard>
  )
}
