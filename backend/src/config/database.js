import 'dotenv/config';
import fs from 'fs';
import pg from 'pg';
import { Sequelize } from 'sequelize';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', 'db']);

function isLocalHost(host = '') {
  return !host || LOCAL_HOSTS.has(host.trim());
}

function shouldUseSsl() {
  if (process.env.DB_SSL === 'false') return false;
  if (process.env.DB_SSL === 'true') return true;
  if (process.env.DATABASE_URL) return true;
  if (process.env.DB_HOST && !isLocalHost(process.env.DB_HOST)) return true;
  return process.env.NODE_ENV === 'production';
}

function buildSslConfig() {
  if (process.env.DB_CA_CERT) {
    return {
      rejectUnauthorized: true,
      ca: process.env.DB_CA_CERT.replace(/\\n/g, '\n'),
    };
  }

  if (process.env.DB_CA_CERT_PATH) {
    return {
      rejectUnauthorized: true,
      ca: fs.readFileSync(process.env.DB_CA_CERT_PATH, 'utf8'),
    };
  }

  // Aiven: cifrado sí, sin validar cadena (evita "self-signed certificate in certificate chain")
  return { rejectUnauthorized: false };
}

/** Quita sslmode de la URL para que pg no fuerce verify-full (incompatible con Aiven sin CA local). */
function sanitizeConnectionUrl(url) {
  try {
    const parsed = new URL(url);
    for (const key of ['sslmode', 'ssl', 'uselibpqcompat']) {
      parsed.searchParams.delete(key);
    }
    const result = parsed.toString();
    return result.endsWith('?') ? result.slice(0, -1) : result;
  } catch {
    return url
      .replace(/[?&]sslmode=[^&]*/gi, '')
      .replace(/[?&]uselibpqcompat=[^&]*/gi, '')
      .replace(/\?&/, '?')
      .replace(/[?&]$/, '');
  }
}

function buildConnectionUrl() {
  if (process.env.DATABASE_URL) {
    return sanitizeConnectionUrl(process.env.DATABASE_URL.trim());
  }

  const host = process.env.DB_HOST?.trim();
  const port = process.env.DB_PORT || 5432;
  const database = process.env.DB_NAME || 'defaultdb';
  const user = encodeURIComponent(process.env.DB_USER || '');
  const password = encodeURIComponent(process.env.DB_PASSWORD || '');

  if (!host || !user || !process.env.DB_PASSWORD) {
    throw new Error(
      'Faltan variables de BD: usa DATABASE_URL o DB_HOST, DB_USER, DB_PASSWORD y DB_NAME'
    );
  }

  return `postgres://${user}:${password}@${host}:${port}/${database}`;
}

function createSequelize() {
  const commonOptions = {
    dialect: 'postgres',
    dialectModule: pg,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false,
    },
  };

  if (shouldUseSsl()) {
    return new Sequelize(buildConnectionUrl(), {
      ...commonOptions,
      dialectOptions: { ssl: buildSslConfig() },
    });
  }

  return new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      ...commonOptions,
      dialectOptions: {},
    }
  );
}

const sequelize = createSequelize();

export function getDatabaseDiagnostics() {
  return {
    ssl: shouldUseSsl(),
    usesDatabaseUrl: Boolean(process.env.DATABASE_URL),
    dbSslFlag: process.env.DB_SSL || null,
    sslVerify: Boolean(process.env.DB_CA_CERT || process.env.DB_CA_CERT_PATH),
  };
}

export default sequelize;
