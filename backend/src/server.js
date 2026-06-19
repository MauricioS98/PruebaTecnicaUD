import app from './app.js';
import sequelize, { getDatabaseDiagnostics } from './config/database.js';
import { assertAuthConfig } from './config/auth.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    assertAuthConfig();
    const dbInfo = getDatabaseDiagnostics();
    console.log('DB config:', JSON.stringify(dbInfo));
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida');

    app.listen(PORT, () => {
      console.log(`OrchestApp API escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
