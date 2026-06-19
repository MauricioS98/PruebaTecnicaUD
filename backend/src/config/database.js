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
  if (process.env.PGSSLMODE === 'require') return true;
  if (process.env.DATABASE_URL) return true;
  if (process.env.DB_HOST && !isLocalHost(process.env.DB_HOST)) return true;
  return process.env.NODE_ENV === 'production';
}

function buildSslConfig() {
  if (process.env.DB_CA_CERT) {
    return {
      require: true,
      rejectUnauthorized: true,
      ca: process.env.DB_CA_CERT,
    };
  }

  if (process.env.DB_CA_CERT_PATH) {
    return {
      require: true,
      rejectUnauthorized: true,
      ca: fs.readFileSync(process.env.DB_CA_CERT_PATH, 'utf8'),
    };
  }

  return {
    require: true,
    rejectUnauthorized: false,
  };
}

function buildConnectionUrl() {
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL.trim();
    if (/sslmode=/i.test(url)) {
      return url;
    }
    return `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;
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

  return `postgres://${user}:${password}@${host}:${port}/${database}?sslmode=require`;
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
    const ssl = buildSslConfig();
    return new Sequelize(buildConnectionUrl(), {
      ...commonOptions,
      dialectOptions: { ssl },
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
    pgSslMode: process.env.PGSSLMODE || null,
    dbSslFlag: process.env.DB_SSL || null,
  };
}

export default sequelize;
