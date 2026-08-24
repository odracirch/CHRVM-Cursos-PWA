# CHRVM Cursos

Plataforma LMS full-stack para publicar cursos, administrar instructores y alumnos, controlar progreso, evaluaciones y certificados verificables.

## Arquitectura
- Frontend: Next.js 15 + React + TypeScript + App Router + Tailwind CSS + PWA.
- Backend: Python + Django 5.2 + Django REST Framework + SimpleJWT + Gunicorn.
- Base de datos: PostgreSQL. Docker para desarrollo; `DATABASE_URL` para producción.
- Almacenamiento: filesystem local por defecto, abstraído mediante Django Storage para migrar posteriormente a S3/Supabase Storage/Cloudinary.

## Requisitos
- Docker Desktop para la ruta recomendada.
- Alternativamente Python 3.12+ y Node.js 20+ para ejecutar servicios por separado.

## Inicio rápido con Docker
1. Copia `.env.example` como `.env`.
2. Ejecuta `docker compose up --build`.
3. Abre http://localhost:3000.
4. API: http://localhost:8000/api/ y health: http://localhost:8000/health/.
5. Admin Django: http://localhost:8000/admin/.

El contenedor backend ejecuta migraciones y `seed` al arrancar. Las credenciales de desarrollo se leen de variables de entorno.

## Usuarios seed
Configura en `.env`:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_INSTRUCTOR_EMAIL`
- `SEED_INSTRUCTOR_PASSWORD`
- `SEED_STUDENT_EMAIL`
- `SEED_STUDENT_PASSWORD`

Las contraseñas no están incluidas en el código.

## Desarrollo sin Docker
### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Define `NEXT_PUBLIC_API_URL=http://localhost:8000`.

## PostgreSQL
En local, Docker crea PostgreSQL automáticamente. Para producción, coloca una URL PostgreSQL estándar en `DATABASE_URL`, por ejemplo la URL entregada por un proveedor PostgreSQL compatible. Django no depende de APIs propietarias de Supabase.

## GitHub
```bash
git init
git add .
git commit -m "Initial CHRVM Cursos"
git branch -M main
git remote add origin TU_REPOSITORIO
 git push -u origin main
```

Nunca subas `.env`, secretos, tokens ni credenciales.

## Netlify
Configura el repositorio apuntando a `frontend/` o usa el directorio raíz según la configuración del sitio. `netlify.toml` incluye el build de Next.js. Define `NEXT_PUBLIC_API_URL` en variables de entorno del sitio.

El backend se despliega como contenedor Django/Gunicorn en cualquier proveedor compatible con Docker. `render.yaml` queda incluido como configuración compatible con proveedores que acepten Blueprints; si un proveedor cambia sus planes, Docker sigue siendo el método portable.

## CORS y CSRF
En producción define:
- `CORS_ALLOWED_ORIGINS=https://tu-sitio.netlify.app`
- `CSRF_TRUSTED_ORIGINS=https://tu-sitio.netlify.app`
- `ALLOWED_HOSTS=tu-backend.example.com`

## PWA
La aplicación incluye manifest, service worker básico, iconos SVG y estrategia offline mínima. Las páginas que requieren API muestran estado de conexión; no se inventa información offline.

## Pruebas
```bash
cd backend
python manage.py test
```

## Migraciones
```bash
python manage.py makemigrations
python manage.py migrate
```

En despliegue, `entrypoint.sh` ejecuta `migrate` automáticamente.

## Migración futura
La aplicación mantiene separadas la lógica de dominio, base de datos y almacenamiento. Puedes mover PostgreSQL, media y el backend a infraestructura de pago sin cambiar los modelos ni la interfaz principal.


## Estado de los servicios gratuitos (revisado el 24-08-2026)
Para el arranque sin pago, la combinación recomendada es **Netlify para frontend + Render Free para backend + Supabase Free para PostgreSQL**. Supabase muestra actualmente un plan Free de $0 con PostgreSQL de 500 MB y pausa por inactividad; Render mantiene servicios web Free, aunque sus instancias Free se duermen tras inactividad y su PostgreSQL Free expira a los 30 días, por lo que este proyecto usa PostgreSQL externo (por ejemplo Supabase) para evitar esa limitación. Render indica además que el Free está orientado a pruebas/hobby y no a aplicaciones de producción. Koyeb conserva una instancia web Free, pero sus condiciones actuales incluyen limitaciones y su documentación de facturación exige atención a la configuración de la organización; por eso no se toma como dependencia principal.
