import { components } from './components.js';
import { paths } from './paths.js';

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'OrchestApp API',
    version: '1.0.0',
    description: `
API REST de **OrchestApp** para gestionar obras musicales, compositores, directores,
artistas e interpretaciones orquestales.

## Autenticación

1. Obtén un \`idToken\` de Google OAuth 2.0 desde el frontend.
2. Llama a \`POST /api/auth/google\` o \`POST /api/auth/google/register\`.
3. Usa el \`token\` JWT devuelto en el header: \`Authorization: Bearer <token>\`.

## Formato de respuesta

Todas las respuestas exitosas siguen: \`{ "success": true, "data": ... }\`.

Los errores devuelven: \`{ "success": false, "message": "..." }\`.

## Archivos estáticos

- Partituras PDF: \`/uploads/scores/{filename}\`
- Audio MP3: \`/uploads/audio/{filename}\`
    `.trim(),
    contact: {
      name: 'OrchestApp - Prueba técnica UD',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Desarrollo local',
    },
  ],
  tags: [
    { name: 'Sistema', description: 'Salud y metadatos de la API' },
    { name: 'Autenticación', description: 'Login y registro con Google OAuth' },
    { name: 'Perfil', description: 'Cuenta y perfiles de usuario (Compositor, Director, Artista)' },
    { name: 'Dashboard', description: 'Panel personalizado por rol' },
    { name: 'Administración', description: 'Gestión de usuarios e instrumentos (solo admin)' },
    { name: 'Catálogo', description: 'Catálogos de apoyo (géneros, tipos, instrumentos)' },
    { name: 'Obras', description: 'CRUD de obras musicales' },
    { name: 'Compositores', description: 'Listado y actualización de compositores' },
    { name: 'Directores', description: 'Listado y detalle de directores' },
    { name: 'Artistas', description: 'Listado, creación y detalle de artistas' },
    { name: 'Interpretaciones', description: 'CRUD de interpretaciones orquestales' },
  ],
  paths,
  components,
};
