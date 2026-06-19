import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../docs/openapi.js';

export function mountSwagger(app) {
  app.get('/api/docs/openapi.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'OrchestApp API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })
  );
}
