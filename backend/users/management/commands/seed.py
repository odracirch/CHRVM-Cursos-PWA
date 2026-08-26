import os

from django.core.management.base import BaseCommand
from users.models import User
from courses.models import Category, Course, Module, Lesson


class Command(BaseCommand):
    def handle(self, *args, **kwargs):

        # =========================
        # CATEGORÍAS
        # =========================
        categorias = {}

        datos_categorias = [
            (
                "Programación",
                "Lenguajes y desarrollo de software",
            ),
            (
                "Ofimática",
                "Herramientas digitales para productividad",
            ),
            (
                "Cultura Digital",
                "Competencias digitales y tecnología",
            ),
        ]

        for nombre, descripcion in datos_categorias:
            categorias[nombre] = Category.objects.get_or_create(
                name=nombre,
                defaults={
                    "description": descripcion,
                },
            )[0]

        # =========================
        # USUARIOS DEMO
        # =========================
        def crear_usuario(email, password, role, first_name, last_name):
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": role,
                    "is_staff": role == "admin",
                    "is_superuser": role == "admin",
                },
            )

            if created:
                user.set_password(password)
                user.save()

            return user

        admin = crear_usuario(
            os.getenv("SEED_ADMIN_EMAIL", "admin@example.com"),
            os.getenv("SEED_ADMIN_PASSWORD", "ChangeMe123!"),
            "admin",
            "Administrador",
            "CHRVM",
        )

        instructor = crear_usuario(
            os.getenv("SEED_INSTRUCTOR_EMAIL", "instructor@example.com"),
            os.getenv("SEED_INSTRUCTOR_PASSWORD", "ChangeMe123!"),
            "instructor",
            "Instructor",
            "Demo",
        )

        student = crear_usuario(
            os.getenv("SEED_STUDENT_EMAIL", "student@example.com"),
            os.getenv("SEED_STUDENT_PASSWORD", "ChangeMe123!"),
            "student",
            "Alumno",
            "Demo",
        )

        # =========================
        # CURSOS
        # =========================
        cursos = [
            (
                "Introducción a la Programación",
                "introduccion-programacion",
                categorias["Programación"],
                "beginner",
                45,
            ),
            (
                "Introducción a Java",
                "introduccion-a-java",
                categorias["Programación"],
                "beginner",
                20,
            ),
            (
                "Python desde cero",
                "python-desde-cero",
                categorias["Programación"],
                "beginner",
                25,
            ),
            (
                "Herramientas de oficina",
                "herramientas-de-oficina",
                categorias["Ofimática"],
                "beginner",
                30,
            ),
            (
                "Ciudadanía digital",
                "ciudadania-digital",
                categorias["Cultura Digital"],
                "intermediate",
                35,
            ),
        ]

        for title, slug, category, level, duration in cursos:

            course, created = Course.objects.get_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "description": f"Curso práctico de {title}.",
                    "short_description": f"Aprende {title} paso a paso.",
                    "category": category,
                    "level": level,
                    "duration": duration,
                    "price": 0,
                    "published": True,
                    "instructor": instructor,
                },
            )

            # Si el curso ya existía, aseguramos que permanezca publicado.
            course.published = True
            course.save()

            # =========================
            # INTRODUCCIÓN A PROGRAMACIÓN
            # =========================
            if slug == "introduccion-programacion":

                modulos = [
                    (
                        1,
                        "Fundamentos de programación",
                        [
                            (
                                1,
                                "¿Qué es la programación?",
                                "Conceptos básicos de programación y algoritmos.",
                                "La programación es el proceso de crear instrucciones que una computadora puede ejecutar para resolver un problema o realizar una tarea.\n\nUn programa está formado por instrucciones organizadas en un orden determinado.\n\n¿Por qué aprender programación?\n\n• Pensamiento lógico\n• Resolución de problemas\n• Análisis de situaciones\n• Automatización de tareas\n• Creación de aplicaciones\n\nEjemplo:\n\nImagina que queremos indicarle a una computadora cómo preparar un café:\n\n1. Encender la cafetera.\n2. Agregar agua.\n3. Agregar café.\n4. Iniciar la preparación.\n5. Esperar.\n6. Servir el café.\n\nLa computadora necesita instrucciones claras y ordenadas.\n\nConcepto clave:\n\nProgramar significa convertir una solución o idea en instrucciones que una computadora pueda entender y ejecutar.",
                            ),
                            (
                                2,
                                "Algoritmos",
                                "Qué son los algoritmos y cómo representan soluciones paso a paso.",
                                "Un algoritmo es un conjunto de pasos ordenados que permite resolver un problema o realizar una tarea.",
                            ),
                            (
                                3,
                                "Lenguajes de programación",
                                "Introducción a los lenguajes utilizados para crear programas.",
                                "Los lenguajes de programación permiten escribir instrucciones que posteriormente pueden ser interpretadas o compiladas para que una computadora las ejecute.",
                            ),
                        ],
                    ),
                    (
                        2,
                        "Conceptos básicos",
                        [
                            (
                                1,
                                "Variables y tipos de datos",
                                "Aprende qué son las variables y los principales tipos de datos.",
                                "Una variable es un espacio donde un programa puede almacenar información.\n\nLos tipos de datos determinan qué clase de información podemos guardar.",
                            ),
                            (
                                2,
                                "Operadores",
                                "Conoce los operadores matemáticos, relacionales y lógicos.",
                                "Los operadores permiten realizar operaciones y comparaciones dentro de un programa.",
                            ),
                            (
                                3,
                                "Condicionales",
                                "Aprende a tomar decisiones dentro de un programa.",
                                "Las estructuras condicionales permiten ejecutar diferentes instrucciones dependiendo de si una condición se cumple o no.",
                            ),
                        ],
                    ),
                    (
                        3,
                        "Estructuras de control",
                        [
                            (
                                1,
                                "Ciclos",
                                "Aprende a repetir instrucciones mediante ciclos.",
                                "Los ciclos permiten ejecutar un conjunto de instrucciones varias veces mientras se cumple una condición determinada.",
                            ),
                            (
                                2,
                                "Funciones",
                                "Aprende a organizar código mediante funciones.",
                                "Una función es un bloque de código diseñado para realizar una tarea específica y que puede reutilizarse dentro de un programa.",
                            ),
                            (
                                3,
                                "Proyecto final",
                                "Integra los conocimientos adquiridos durante el curso.",
                                "En esta actividad aplicarás los conceptos de programación, algoritmos, variables, operadores, condicionales, ciclos y funciones.",
                            ),
                        ],
                    ),
                ]

                for module_order, module_title, lessons in modulos:

                    module, _ = Module.objects.get_or_create(
                        course=course,
                        order=module_order,
                        defaults={
                            "title": module_title,
                            "description": "Contenido esencial del curso.",
                        },
                    )

                    module.title = module_title
                    module.save()

                    for lesson_order, lesson_title, description, content in lessons:

                        Lesson.objects.get_or_create(
                            module=module,
                            order=lesson_order,
                            defaults={
                                "title": lesson_title,
                                "description": description,
                                "content": content,
                                "duration": 15,
                                "published": True,
                            },
                        )

            # =========================
            # OTROS CURSOS
            # =========================
            else:

                for module_order in range(1, 3):

                    module, _ = Module.objects.get_or_create(
                        course=course,
                        order=module_order,
                        defaults={
                            "title": f"Módulo {module_order}: Fundamentos",
                            "description": "Contenido esencial del curso.",
                        },
                    )

                    for lesson_order in range(1, 4):

                        Lesson.objects.get_or_create(
                            module=module,
                            order=lesson_order,
                            defaults={
                                "title": f"Lección {module_order}.{lesson_order}",
                                "description": "Lección práctica.",
                                "content": "Contenido educativo de ejemplo listo para editar desde el panel.",
                                "duration": 15,
                                "published": True,
                            },
                        )

        self.stdout.write(
            self.style.SUCCESS(
                "Seed completado correctamente."
            )
        )
