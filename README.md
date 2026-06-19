# OrchestApp

Gestión premium de obras musicales, compositores, directores, intérpretes e interpretaciones orquestales.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 19, SCSS design system |
| Backend | Express, Sequelize |
| Base de datos | PostgreSQL + auditoría (`audit` schema) |
| Auth | Google OAuth → JWT propio |

## Estructura del proyecto

```text
├── backend/          API Express + Sequelize
├── frontend/         SPA Angular (OrchestApp UI)
├── db.sql            Esquema PostgreSQL
├── seed.sql          Datos de prueba
└── README.md
```

## Requisitos previos

- Node.js 20+
- PostgreSQL 14+
- Cuenta Google Cloud (OAuth 2.0 Client ID)

## 1. Base de datos

```bash
psql -U postgres -d orchestapp -f db.sql
psql -U postgres -d orchestapp -f seed.sql
```

## 2. Backend

```bash
cd backend
cp .env.example .env
# Editar .env con credenciales DB, JWT_SECRET y GOOGLE_CLIENT_ID
npm install
npm run dev
```

API disponible en `http://localhost:3000`

### Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/google` | Login con `idToken` de Google |
| GET | `/api/auth/me` | Usuario autenticado |
| GET | `/api/works` | Listar obras |
| GET | `/api/interpretations` | Filtrar por `artistId`, `directorId`, `workId` |
| POST | `/api/interpretations` | Crear interpretación (transaccional + audit) |

## 3. Frontend

```bash
cd frontend
# Editar src/environments/environment.ts → googleClientId
npm install
npm start
```

App en `http://localhost:4200`

## Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Crear **OAuth 2.0 Client ID** (Web application)
3. Authorized JavaScript origins: `http://localhost:4200`
4. Copiar Client ID en:
   - `backend/.env` → `GOOGLE_CLIENT_ID`
   - `frontend/src/environments/environment.ts` → `googleClientId`

## Auditoría

Toda mutación ejecuta `audit.set_changed_by(email)` dentro de la transacción Sequelize. Los triggers de PostgreSQL escriben en `audit.log` y tablas específicas.

```sql
SELECT * FROM audit.log ORDER BY changed_at DESC LIMIT 20;
```

## Manual de marca

Ver [frontend/BRAND.md](frontend/BRAND.md) para paleta, tipografía y sistema UI OrchestApp.

## Scripts

| Comando | Ubicación | Acción |
|---------|-----------|--------|
| `npm run dev` | backend | API en modo desarrollo |
| `npm start` | frontend | Angular dev server |
| `npm run build` | frontend | Build producción |

## Próximos pasos

- [ ] CRUD completo de obras en UI
- [ ] Formulario interpretaciones recientes / históricas
- [ ] Edición de artistas y directores
- [ ] Vista de auditoría en admin
