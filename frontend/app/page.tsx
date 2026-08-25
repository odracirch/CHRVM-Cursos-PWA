import Link from 'next/link';

const cursos = [
  {
    slug: 'introduccion-programacion',
    titulo: 'Introducción a la Programación',
    descripcion: 'Aprende los fundamentos de la programación desde cero.',
    nivel: 'Principiante',
    lecciones: 12,
  },
  {
    slug: 'java-netbeans',
    titulo: 'Java desde Cero con NetBeans',
    descripcion: 'Aprende Java y crea tus primeros programas con NetBeans.',
    nivel: 'Principiante',
    lecciones: 15,
  },
  {
    slug: 'cultura-digital',
    titulo: 'Cultura Digital',
    descripcion: 'Conoce herramientas digitales para estudiar y trabajar.',
    nivel: 'Básico',
    lecciones: 10,
  },
];

export default function Home() {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-slate-900">
            CHRVM <span className="text-blue-600">Cursos</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/cursos"
              className="hidden sm:block px-4 py-2 text-slate-700 hover:text-blue-600"
            >
              Cursos
            </Link>

            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/registro"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-slate-950 text-white">
          <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm">
                Plataforma educativa
              </span>

              <h1 className="text-4xl md:text-6xl font-black mt-5 leading-tight">
                Aprende. Practica.{' '}
                <span className="text-blue-400">Certifícate.</span>
              </h1>

              <p className="text-slate-300 text-lg mt-5">
                CHRVM Cursos reúne cursos, lecciones, evaluaciones, progreso y
                certificados en una sola plataforma.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/cursos"
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold"
                >
                  Explorar cursos
                </Link>

                <Link
                  href="/login"
                  className="border border-slate-600 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold"
                >
                  Iniciar sesión
                </Link>

                <Link
                  href="/registro"
                  className="border border-slate-600 hover:bg-slate-800 px-6 py-3 rounded-xl font-semibold"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-7 text-slate-900 shadow-2xl">
              <h2 className="font-bold text-xl">
                Todo tu aprendizaje en un lugar
              </h2>

              <div className="grid grid-cols-2 gap-3 mt-5">
                {[
                  ['Cursos', 'Aprende a tu ritmo'],
                  ['Progreso', 'Consulta tu avance'],
                  ['Evaluaciones', 'Comprueba lo aprendido'],
                  ['Certificados', 'Obtén tus certificados'],
                ].map(([titulo, texto]) => (
                  <div
                    key={titulo}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                  >
                    <b>{titulo}</b>
                    <p className="text-xs text-slate-500 mt-1">{texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-blue-600 font-semibold">DEMO</p>
              <h2 className="text-3xl md:text-4xl font-black">
                Cursos destacados
              </h2>
              <p className="text-slate-600 mt-2">
                Explora algunos cursos de demostración de CHRVM Cursos.
              </p>
            </div>

            <Link
              href="/cursos"
              className="hidden sm:block text-blue-600 font-semibold"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {cursos.map((curso) => (
              <article
                key={curso.slug}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition"
              >
                <div className="h-32 bg-gradient-to-br from-blue-700 to-slate-900 flex items-center justify-center">
                  <span className="text-white text-4xl font-black">C</span>
                </div>

                <div className="p-5">
                  <span className="text-xs font-semibold text-blue-600">
                    {curso.nivel}
                  </span>

                  <h3 className="text-xl font-bold mt-2">
                    {curso.titulo}
                  </h3>

                  <p className="text-slate-600 text-sm mt-2 min-h-12">
                    {curso.descripcion}
                  </p>

                  <p className="text-xs text-slate-500 mt-4">
                    {curso.lecciones} lecciones · Curso de demostración
                  </p>

                  <Link
                    href={`/cursos/${curso.slug}`}
                    className="block text-center bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 mt-5 font-semibold"
                  >
                    Ver curso
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-100">
          <div className="max-w-6xl mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-black">
              ¿Listo para comenzar?
            </h2>

            <p className="text-slate-600 mt-3">
              Crea tu cuenta y comienza a explorar los cursos.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <Link
                href="/registro"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Crear cuenta
              </Link>

              <Link
                href="/login"
                className="bg-white border border-slate-300 px-6 py-3 rounded-xl font-semibold"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-400 text-center py-8">
        <p>© 2026 CHRVM Cursos · Plataforma educativa</p>
      </footer>
    </>
  );
}
