# OrchestApp

Aplicación web para gestionar obras musicales, compositores, directores, intérpretes e interpretaciones orquestales. Desarrollada como prueba técnica OATI – Universidad Distrital.

## Demo en producción

**https://orchestapp.vercel.app**

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 19, SCSS, standalone components |
| Backend | Node.js, Express, Sequelize |
| Base de datos | PostgreSQL 14+ con esquema de auditoría (`audit`) |
| Autenticación | Google OAuth 2.0 → JWT propio |
| Archivos | Multer (partituras PDF, audio MP3) |

## Arquitectura

Patrón en capas con separación de responsabilidades:

```text
frontend/                 Cliente SPA (visualización + formularios)
  src/app/
    core/                 Auth, guards, interceptors, servicios API
    features/             Módulos por dominio (works, interpretations…)
    layout/               Shell y navegación
    shared/               Componentes reutilizables

backend/                  API REST
  src/
    modules/              Lógica de negocio por dominio
      auth/               Login/registro Google
      catalog/            Obras, interpretaciones, artistas, directores
      profile/            Perfiles y cuenta de usuario
      admin/              Administración (usuarios, instrumentos)
      dashboard/          Panel personalizado por rol
    models/               Modelos Sequelize
    middlewares/          Auth JWT, roles, uploads, errores
    utils/                Helpers y manejo de archivos

db.sql                    Esquema relacional + triggers de auditoría
seed.sql                  Datos de prueba
```

## Funcionalidades

- **Obras:** listado, creación, edición y eliminación (compositor o admin). Varias obras con múltiples compositores y géneros. Carga de partitura PDF.
- **Interpretaciones:** CRUD por director o admin. Asignación de artistas e instrumentos. Audio MP3 y cola de reproducción global.
- **Artistas y directores:** catálogo, perfiles públicos con interpretaciones filtradas por `artistId` / `directorId`. Creación de artistas sin cuenta (director/admin).
- **Perfiles de usuario:** activar roles (Compositor, Director, Artista), editar nickname y descripción por rol, cuenta (nombre y correo vía Google OAuth).
- **Dashboard:** vista personal o administrativa según el rol del usuario.
- **Admin:** gestión de administradores y catálogo de tipos/instrumentos.
- **Auditoría:** registro automático de cambios en PostgreSQL por usuario autenticado.

## Requisitos previos

- Node.js 20+
- PostgreSQL 14+
- Cuenta en [Google Cloud Console](https://console.cloud.google.com/) con OAuth 2.0 Client ID

## Instalación

### 1. Base de datos

```bash
createdb orchestapp
psql -U postgres -d orchestapp -f db.sql
psql -U postgres -d orchestapp -f seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Configurar DB_*, JWT_SECRET y GOOGLE_CLIENT_ID
npm install
npm run dev
```

API en `http://localhost:3000`

**Documentación Swagger:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)  
Especificación OpenAPI JSON: `http://localhost:3000/api/docs/openapi.json`

#### Backend con Docker (alternativa)

Stack local con API + PostgreSQL:

```bash
cd backend
cp .env.docker.example .env
# Configurar GOOGLE_CLIENT_ID en .env
docker compose up --build
```

Solo la imagen de la API (BD externa): ver [backend/DOCKER.md](backend/DOCKER.md).

### 3. Frontend

```bash
cd frontend
# Configurar googleClientId en src/environments/environment.ts
npm install
npm start
```

App en `http://localhost:4200`

## Google OAuth

1. Google Cloud Console → APIs & Services → Credentials
2. Crear **OAuth 2.0 Client ID** (Web application)
3. **Authorized JavaScript origins:** `http://localhost:4200` (y el dominio de producción al desplegar)
4. Copiar el Client ID en:
   - `backend/.env` → `GOOGLE_CLIENT_ID`
   - `frontend/src/environments/environment.ts` → `googleClientId`

## Documentación API (Swagger)

Con el backend en ejecución, abre **http://localhost:3000/api/docs** para explorar y probar todos los endpoints de forma interactiva.

- Autenticación: usa el botón **Authorize** e introduce `Bearer <token>` (o solo el token, según la UI).
- Endpoints con archivos (`POST /api/works`, `POST /api/interpretations`) usan `multipart/form-data`.
- La especificación OpenAPI 3.0 está en `backend/src/docs/` y se expone en `/api/docs/openapi.json`.

## API REST — endpoints principales

Todas las rutas (salvo auth, health y docs) requieren header `Authorization: Bearer <token>`.

### Auth

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/google` | Login con `idToken` de Google |
| POST | `/api/auth/google/register` | Registro con Google |
| GET | `/api/auth/me` | Usuario autenticado |

### Catálogo

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/works` | Listar obras |
| GET | `/api/works/:id` | Detalle de obra |
| POST | `/api/works` | Crear obra (multipart: PDF) |
| PUT | `/api/works/:id` | Actualizar obra |
| DELETE | `/api/works/:id` | Eliminar obra |
| GET | `/api/interpretations` | Listar; filtros: `?artistId=&directorId=&workId=` |
| POST | `/api/interpretations` | Crear interpretación (multipart: MP3) |
| PUT | `/api/interpretations/:id` | Actualizar interpretación |
| DELETE | `/api/interpretations/:id` | Eliminar interpretación |
| GET | `/api/artists` | Listar artistas |
| POST | `/api/artists` | Crear artista sin usuario (director/admin) |
| GET | `/api/artists/:id` | Detalle de artista |
| PUT | `/api/artists/:id` | Actualizar artista |
| GET | `/api/directors` | Listar directores |
| GET | `/api/directors/:id` | Detalle de director |
| PUT | `/api/directors/:id` | Actualizar director |
| GET | `/api/composers` | Listar compositores |
| PUT | `/api/composers/:id` | Actualizar compositor |
| GET | `/api/catalogs` | Géneros, tipos, instrumentos |

### Perfil y panel

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/profile` | Estado de perfiles activos/disponibles |
| PATCH | `/api/profile/account` | Actualizar nombre de cuenta |
| PATCH | `/api/profile/account/email` | Cambiar correo (verificado con Google) |
| PATCH | `/api/profile/{composer\|director\|artist}` | Actualizar nickname y descripción del rol |
| GET | `/api/dashboard` | Panel según rol (personal o admin) |

### Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/users` | Listar usuarios |
| PATCH | `/api/admin/users/:id` | Asignar/quitar rol admin |
| GET | `/api/admin/instruments-catalog` | Catálogo de instrumentos |
| POST/PUT/DELETE | `/api/admin/type-instruments` | CRUD tipos de instrumento |
| POST/PUT/DELETE | `/api/admin/instruments` | CRUD instrumentos |

### Salud

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado de la API |

## Modelo de datos

Entidades principales:

- `user_app` — usuarios del sistema
- `composer`, `director`, `artist` — perfiles vinculados opcionalmente a un usuario
- `work` + `composition` — obras con uno o más compositores
- `interpretation` + `interpretation_artist` — interpretaciones con director, tipo, artistas e instrumentos
- `genre`, `type_interpretation`, `type_instrument`, `instrument` — catálogos de apoyo
- `audit.*` — historial de cambios vía triggers PostgreSQL

El diagrama completo está definido en [`db.sql`](db.sql).

## Roles y permisos

| Rol | Capacidades |
|-----|-------------|
| Oyente | Consulta de catálogos |
| Compositor | Crear/editar/eliminar sus obras |
| Director | Crear/editar/eliminar sus interpretaciones; crear artistas |
| Artista | Consulta de interpretaciones propias en dashboard |
| Admin | Obras e interpretaciones históricas, gestión de usuarios e instrumentos |

## Auditoría

Toda mutación ejecuta `audit.set_changed_by(email)` dentro de la transacción Sequelize. Los triggers de PostgreSQL registran cambios en `audit.log` y tablas específicas.

```sql
SELECT * FROM audit.log ORDER BY changed_at DESC LIMIT 20;
```

## Scripts

| Comando | Ubicación | Acción |
|---------|-----------|--------|
| `npm run dev` | `backend/` | API con recarga automática (nodemon) |
| `npm start` | `backend/` | API en producción |
| `npm start` | `frontend/` | Servidor de desarrollo Angular |
| `npm run build` | `frontend/` | Build de producción |

## Manual de marca

Ver [frontend/BRAND.md](frontend/BRAND.md) para paleta, tipografía y sistema UI OrchestApp.
