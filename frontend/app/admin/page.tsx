import AuthGuard from '@/components/AuthGuard'

export default function Page() {
  return (
    <AuthGuard roles={['admin']}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="card p-8">

          <h1 className="text-3xl font-black">
            Panel administrativo
          </h1>

          <p className="text-slate-600 mt-3">
            Consulta y administra usuarios, cursos,
            categorías, evaluaciones y certificados
            desde CHRVM Cursos.
          </p>

          <p className="text-sm text-slate-500 mt-6">
            Los datos se gestionan de forma segura
            mediante Supabase.
          </p>

        </div>
      </div>
    </AuthGuard>
  )
}
