import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      {/* ENCABEZADO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-2xl font-black text-amber-400">
                C
              </div>

              <div className="leading-none">
                <div className="text-xl font-black tracking-tight text-slate-950">
                  CHRVM
                </div>
                <div className="text-base font-bold text-blue-700">
                  Cursos
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl border-2 border-slate-900 px-3 sm:px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/registro"
                className="rounded-xl bg-amber-500 px-3 sm:px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-amber-400 transition"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {/* HERO */}
        <section className="py-14 sm:py-20">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-600">
            CHRVM Cursos
          </p>

          <h1 className="mt-5 text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight text-slate-950">
            Aprende.
            <br />
            Practica.
            <br />
            <span className="text-blue-700">Certifícate.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg sm:text-xl leading-relaxed text-slate-600">
            Cursos prácticos de tecnología y herramientas digitales en un
            solo lugar.
          </p>
        </section>

        {/* POR QUÉ CHRVM */}
        <section className="pb-10">
          <div className="text-center mb-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-600">
              ¿Por qué <span className="text-slate-950">CHRVM</span>?
            </p>
          </div>

          <div className="space-y-6">
            {/* BENEFICIO 1 */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 text-3xl text-slate-950">
                ◷
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black">
                  Aprende a tu ritmo
                </h2>

                <p className="mt-1 text-base sm:text-lg text-slate-600">
                  Estudia cuando quieras, desde cualquier dispositivo.
                </p>
              </div>
            </div>

            {/* BENEFICIO 2 */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 text-3xl text-slate-950">
                ▥
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black">
                  Evalúa tu progreso
                </h2>

                <p className="mt-1 text-base sm:text-lg text-slate-600">
                  Pruebas y evaluaciones para medir tu evolución.
                </p>
              </div>
            </div>

            {/* BENEFICIO 3 */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-100 text-3xl text-slate-950">
                ▱
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black">
                  Obtén certificados
                </h2>

                <p className="mt-1 text-base sm:text-lg text-slate-600">
                  Certificados al completar cada curso.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MI APRENDIZAJE */}
        <section className="pb-8">
          <div className="rounded-2xl border-2 border-slate-900 bg-[#f8f3e8] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                  Mi aprendizaje
                </h2>

                <p className="mt-2 text-base sm:text-lg text-slate-700">
                  Progreso actual · 40% completado
                </p>
              </div>

              <div className="text-2xl text-amber-600">
                🔖
              </div>
            </div>

            {/* BARRA */}
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[40%] rounded-full bg-amber-500" />
            </div>

            <p className="mt-3 text-sm sm:text-base text-slate-700">
              4 de 12 lecciones completadas
            </p>

            <div className="mt-4">
              <p className="font-black text-slate-950">
                Introducción a la Programación
              </p>
            </div>
          </div>
        </section>

        {/* CONTINUAR APRENDIENDO */}
        <section className="pb-16">
          <Link
            href="/cursos"
            className="block w-full rounded-xl border-2 border-slate-900 bg-white py-4 text-center text-lg font-black text-slate-950 hover:bg-slate-50 transition"
          >
            Continuar aprendiendo
          </Link>
        </section>
      </main>
    </div>
  )
}
