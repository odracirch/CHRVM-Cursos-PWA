import Link from 'next/link';

const cursos: Record<string, {
  titulo: string;
  descripcion: string;
  nivel: string;
  lecciones: string[];
}> = {
  'introduccion-programacion': {
    titulo: 'Introducción a la Programación',
    descripcion:
      'Curso diseñado para comenzar a programar desde cero.',
    nivel: 'Principiante',
    lecciones: [
      '¿Qué es la programación?',
      'Variables y tipos de datos',
      'Operadores',
      'Condicionales',
      'Ciclos',
      'Funciones',
    ],
  },

  'java-netbeans': {
    titulo: 'Java desde Cero con NetBeans',
    descripcion:
      'Aprende los fundamentos de Java utilizando NetBeans.',
    nivel: 'Principiante',
    lecciones: [
      'Introducción a Java',
      'Instalación y NetBeans',
      'Variables',
      'Condicionales',
      'Switch',
      'Ciclos',
    ],
  },

  'cultura-digital': {
    titulo: 'Cultura Digital',
    descripcion:
      'Aprende herramientas y conceptos fundamentales de cultura digital.',
    nivel: 'Básico',
    lecciones: [
      'Introducción a la cultura digital',
      'Internet',
      'Seguridad digital',
      'Herramientas colaborativas',
      'Información digital',
      'Ciudadanía digital',
    ],
  },
};

export default async function CursoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const curso = cursos[slug];

  if (!curso) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black">Curso no encontrado</h1>
        <Link
          href="/cursos"
          className="inline-block bg-blue-600 text-white px-5 py-3 rounded-xl mt-6"
        >
          Volver a cursos
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/cursos" className="text-blue-600 font-semibold">
        ← Volver a cursos
      </Link>

      <div className="mt-6 bg-slate-950 text-white rounded-3xl p-8 md:p-12">
        <span className="text-blue-400 font-semibold">
          {curso.nivel}
        </span>

        <h1 className="text-4xl md:text-5xl font-black mt-3">
          {curso.titulo}
        </h1>

        <p className="text-slate-300 text-lg mt-5">
          {curso.descripcion}
        </p>

        <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold mt-8">
          Inscribirme al curso
        </button>
      </div>

      <section className="mt-10">
        <h2 className="text-3xl font-black">Contenido del curso</h2>

        <div className="mt-5 space-y-3">
          {curso.lecciones.map((leccion, index) => (
            <div
              key={leccion}
              className="border border-slate-200 rounded-xl p-5 bg-white flex items-center gap-4"
            >
              <span className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                {index + 1}
              </span>

              <span className="font-semibold">{leccion}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-slate-100 rounded-2xl p-6 mt-10">
        <h3 className="font-bold text-xl">¿Quieres comenzar?</h3>

        <p className="text-slate-600 mt-2">
          Crea una cuenta para guardar tu progreso y posteriormente obtener
          certificados.
        </p>

        <div className="flex gap-3 mt-5">
          <Link
            href="/registro"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Registrarme
          </Link>

          <Link
            href="/login"
            className="border border-slate-300 bg-white px-5 py-3 rounded-xl font-semibold"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
