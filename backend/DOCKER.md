# Backend Docker — OrchestApp

## Requisitos

- Docker Desktop (o Docker Engine + Docker Compose v2)
- `GOOGLE_CLIENT_ID` válido (la API no arranca sin él)

## Opción A — Stack completo (API + PostgreSQL)

Levanta la API y una base PostgreSQL con el esquema de `db.sql`.

```bash
cd backend
cp .env.docker.example .env
# Edita .env y configura GOOGLE_CLIENT_ID (y JWT_SECRET en producción)

docker compose up --build
```

| Servicio | URL |
|----------|-----|
| API | http://localhost:3000 |
| Health | http://localhost:3000/api/health |
| Swagger | http://localhost:3000/api/docs |
| PostgreSQL | `localhost:5432` (user/pass: `postgres`) |

Los archivos subidos (PDF/MP3) persisten en el volumen `uploads_data`.

```bash
# Detener
docker compose down

# Detener y borrar volúmenes (resetea BD y archivos)
docker compose down -v
```

## Opción B — Solo la imagen de la API

Útil cuando la base de datos ya está en Neon, Supabase u otro host.

```bash
cd backend
cp .env.example .env
# Configura DB_HOST, DB_* y el resto de variables

docker build -t orchestapp-api .
docker run --rm -p 3000:3000 --env-file .env orchestapp-api
```

En producción monta un volumen en `/app/uploads` para que PDF y MP3 no se pierdan al reiniciar el contenedor:

```bash
docker run --rm -p 3000:3000 --env-file .env \
  -v orchestapp_uploads:/app/uploads \
  orchestapp-api
```

## Despliegue en Render / Railway / Fly.io

1. Conecta el repositorio y define **Root Directory:** `backend`
2. **Runtime:** Docker (usa el `Dockerfile` de esta carpeta)
3. Configura las variables de entorno de `.env.example`
4. Añade un **disco/volumen persistente** montado en `/app/uploads`
5. Usa una base PostgreSQL externa (`DB_HOST` apuntando al proveedor)

## Scripts npm

| Comando | Acción |
|---------|--------|
| `npm run docker:build` | Construye la imagen `orchestapp-api` |
| `npm run docker:run` | Ejecuta la API con `.env` local |
| `npm run docker:up` | `docker compose up --build` |
| `npm run docker:down` | Detiene los contenedores |
| `npm run docker:logs` | Sigue los logs de la API |
