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

export default function CursosPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <Link href="/" className="text-blue-600 font-semibold">
            ← Inicio
          </Link>
          <h1 className="text-4xl font-black mt-3">Cursos</h1>
          <p className="text-slate-600 mt-2">
            Explora nuestros cursos de demostración.
          </p>
        </div>

        <Link
          href="/login"
          className="hidden sm:block bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold"
        >
          Iniciar sesión
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {cursos.map((curso) => (
          <article
            key={curso.slug}
            className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"
          >
            <div className="h-36 bg-gradient-to-br from-blue-700 to-slate-900 flex items-center justify-center">
              <span className="text-white text-5xl font-black">C</span>
            </div>

            <div className="p-6">
              <span className="text-sm text-blue-600 font-semibold">
                {curso.nivel}
              </span>

              <h2 className="text-2xl font-bold mt-2">
                {curso.titulo}
              </h2>

              <p className="text-slate-600 mt-3">
                {curso.descripcion}
              </p>

              <p className="text-sm text-slate-500 mt-4">
                {curso.lecciones} lecciones
              </p>

              <Link
                href={`/cursos/${curso.slug}`}
                className="block text-center bg-blue-600 text-white rounded-xl py-3 mt-5 font-semibold"
              >
                Ver curso
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
