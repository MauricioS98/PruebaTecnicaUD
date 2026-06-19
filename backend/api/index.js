import app from '../src/app.js';
import sequelize from '../src/config/database.js';
import { assertAuthConfig } from '../src/config/auth.js';

let bootPromise;

function ensureBootstrapped() {
  if (!bootPromise) {
    bootPromise = (async () => {
      assertAuthConfig();
      await sequelize.authenticate();
    })().catch((error) => {
      bootPromise = null;
      throw error;
    });
  }
  return bootPromise;
}

export default async function handler(req, res) {
  try {
    await ensureBootstrapped();
    return app(req, res);
  } catch (error) {
    console.error('Vercel handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
      });
    }
  }
}
