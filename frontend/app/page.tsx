import Link from 'next/link'

const cursos = [
  {
    slug: 'introduccion-programacion',
    titulo: 'Introducción a la Programación',
    descripcion:
      'Aprende los fundamentos de la programación desde cero mediante ejemplos sencillos y prácticos.',
    nivel: 'Principiante',
    lecciones: 12,
    categoria: 'Programación',
  },
  {
    slug: 'java-netbeans',
    titulo: 'Java desde Cero con NetBeans',
    descripcion:
      'Aprende Java y crea tus primeros programas con NetBeans paso a paso.',
    nivel: 'Principiante',
    lecciones: 15,
    categoria: 'Programación',
  },
  {
    slug: 'cultura-digital',
    titulo: 'Cultura Digital',
    descripcion:
      'Conoce herramientas digitales útiles para estudiar, trabajar y desenvolverte en el mundo digital.',
    nivel: 'Básico',
    lecciones: 10,
    categoria: 'Cultura Digital',
  },
]

const pasos = [
  {
    numero: '01',
    titulo: 'Explora',
    texto: 'Encuentra un curso que se adapte a tus objetivos.',
  },
  {
    numero: '02',
    titulo: 'Aprende',
    texto: 'Avanza por las lecciones a tu propio ritmo.',
  },
  {
    numero: '03',
    titulo: 'Evalúate',
    texto: 'Comprueba lo que aprendiste mediante evaluaciones.',
  },
  {
    numero: '04',
    titulo: 'Certifícate',
    texto: 'Completa tu aprendizaje y obtén tu certificado.',
  },
]

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xl font-black tracking-tight text-slate-950"
          >
            CHRVM <span className="text-blue-600">Cursos</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/cursos"
              className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
            >
              Cursos
            </Link>

            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/registro"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200">
                Plataforma educativa
              </span>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] mt-6">
                Aprende.
                <br />
                Practica.
                <br />
                <span className="text-blue-400">Certifícate.</span>
              </h1>

              <p className="max-w-2xl text-lg md:text-xl leading-relaxed text-slate-300 mt-7">
                Aprende nuevas habilidades con cursos prácticos, lecciones
                organizadas, evaluaciones y certificados en un solo lugar.
              </p>

              <div className="mt-9">
                <Link
                  href="/cursos"
                  className="inline-flex justify-center items-center rounded-xl bg-blue-600 px-6 py-3.5 font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-950/30"
                >
                  Explorar cursos →
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm text-slate-400">
                <span>✓ Aprende a tu ritmo</span>
                <span>✓ Evalúa tu progreso</span>
                <span>✓ Obtén certificados</span>
              </div>
            </div>

            {/* PREVISUALIZACIÓN DEL APRENDIZAJE */}
            <div className="lg:pl-8">
              <div className="rounded-3xl border border-white/10 bg-white p-5 text-slate-900 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Tu aprendizaje
                    </p>

                    <h2 className="text-xl font-black mt-1">
                      Introducción a la Programación
                    </h2>
                  </div>

                  <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                    C
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      Progreso del curso
                    </span>

                    <span className="font-black text-blue-600">
                      68%
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-slate-100 mt-3 overflow-hidden">
                    <div className="h-full w-[68%] rounded-full bg-blue-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-2xl font-black">12</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Lecciones
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-2xl font-black">4</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Completadas
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-sm font-bold text-blue-900">
                    Sigue aprendiendo
                  </p>

                  <p className="text-xs text-blue-700 mt-1">
                    Tu próximo paso está a solo una lección.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CURSOS DESTACADOS */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Para comenzar
              </p>

              <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-2">
                Cursos destacados
              </h2>

              <p className="text-slate-600 mt-3">
                Explora algunos cursos de demostración de CHRVM Cursos.
              </p>
            </div>

            <Link
              href="/cursos"
              className="hidden sm:block text-blue-600 font-bold hover:text-blue-700"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {cursos.map((curso, index) => (
              <article
                key={curso.slug}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl transition"
              >
                <div className="h-44 bg-slate-950 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950" />

                  <div className="relative h-full p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs font-bold text-blue-100">
                        {curso.categoria}
                      </span>

                      <span className="text-4xl font-black text-white/90">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <p className="text-sm text-blue-200 font-semibold">
                      {curso.nivel}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black leading-tight">
                    {curso.titulo}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed mt-3">
                    {curso.descripcion}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-5">
                    <span>{curso.lecciones} lecciones</span>
                    <span>·</span>
                    <span>Curso de demostración</span>
                  </div>

                  <Link
                    href={`/cursos/${curso.slug}`}
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 mt-6 font-bold transition"
                  >
                    Ver curso
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <Link
            href="/cursos"
            className="sm:hidden block text-center text-blue-600 font-bold mt-8"
          >
            Ver todos los cursos →
          </Link>
        </section>

        {/* COMO FUNCIONA */}
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-20">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Así funciona
              </p>

              <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-2">
                Aprende paso a paso
              </h2>

              <p className="text-slate-600 text-lg mt-4">
                Un proceso sencillo para concentrarte en lo más importante:
                aprender.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 mt-12">
              {pasos.map((paso) => (
                <div key={paso.numero}>
                  <div className="text-5xl font-black text-slate-200">
                    {paso.numero}
                  </div>

                  <h3 className="text-xl font-black mt-2">
                    {paso.titulo}
                  </h3>

                  <p className="text-slate-500 leading-relaxed mt-2">
                    {paso.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="px-4 py-20">
          <div className="max-w-6xl mx-auto overflow-hidden rounded-3xl bg-blue-600 text-white">
            <div className="px-6 py-14 md:px-12 md:py-16 text-center">
              <p className="text-blue-100 font-semibold">
                Tu próximo aprendizaje comienza aquí
              </p>

              <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-3">
                ¿Listo para comenzar?
              </h2>

              <p className="max-w-2xl mx-auto text-blue-100 text-lg mt-4">
                Crea tu cuenta y empieza a explorar los cursos disponibles en
                CHRVM Cursos.
              </p>

              <div className="mt-8">
                <Link
                  href="/registro"
                  className="inline-flex rounded-xl bg-white text-blue-700 px-6 py-3.5 font-bold hover:bg-blue-50 transition"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="text-lg font-black text-white"
            >
              CHRVM <span className="text-blue-400">Cursos</span>
            </Link>

            <div className="flex items-center gap-5 text-sm">
              <Link
                href="/cursos"
                className="hover:text-white transition"
              >
                Cursos
              </Link>

              <Link
                href="/login"
                className="hover:text-white transition"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm">
            © 2026 CHRVM Cursos · Educación digital
          </div>
        </div>
      </footer>
    </>
  )
}
